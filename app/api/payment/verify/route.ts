

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { NotificationService } from '@/lib/services/notification-service';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      amount,
      description,
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return NextResponse.json(
        { error: 'Missing required payment verification data' },
        { status: 400 }
      );
    }

    // Validate Razorpay secret key
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay secret key not configured');
      return NextResponse.json(
        { error: 'Payment service configuration error' },
        { status: 500 }
      );
    }

    console.log('Verifying payment signature for order:', razorpay_order_id);

    // Verify signature
    const signatureBody = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(signatureBody.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Payment signature verification failed');
      console.error('Expected:', expectedSignature);
      console.error('Received:', razorpay_signature);
      
      // Mark transaction as failed
      await prisma.transaction.updateMany({
        where: {
          razorpayOrderId: razorpay_order_id,
          userId,
        },
        data: {
          status: 'FAILED',
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    console.log('Payment signature verified successfully');

    // Find the transaction
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        razorpayOrderId: razorpay_order_id,
        userId,
      },
    });

    if (!existingTransaction) {
      console.error('Transaction not found for order:', razorpay_order_id);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if already processed
    if (existingTransaction.status === 'SUCCESS') {
      console.log('Transaction already processed:', existingTransaction.id);
      return NextResponse.json(
        { transaction: existingTransaction },
        { status: 200 }
      );
    }

    // Update transaction as successful
    const updatedTransaction = await prisma.transaction.update({
      where: { id: existingTransaction.id },
      data: {
        status: 'SUCCESS',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        updatedAt: new Date(),
      },
    });

    console.log('Transaction updated successfully:', updatedTransaction.id);

    // If it's a card recharge, update the card balance
    if (updatedTransaction.type === 'CARD_RECHARGE') {
      try {
        // Find user's metro card
        const userCard = await prisma.metroCard.findFirst({
          where: { userId },
        });

        if (userCard) {
          const updatedCard = await prisma.metroCard.update({
            where: { id: userCard.id },
            data: {
              balance: {
                increment: updatedTransaction.amount,
              },
              updatedAt: new Date(),
            },
          });

          console.log('Metro card balance updated:', {
            cardId: updatedCard.id,
            newBalance: updatedCard.balance,
            rechargeAmount: updatedTransaction.amount,
          });

          // Update transaction with card reference
          await prisma.transaction.update({
            where: { id: updatedTransaction.id },
            data: {
              metroCardId: updatedCard.id,
            },
          });

          // Send success notification
          try {
            await NotificationService.notifyRechargeSuccess(
              userId,
              updatedTransaction.amount,
              updatedCard.balance
            );
          } catch (notificationError) {
            console.error('Failed to send notification:', notificationError);
            // Don't fail the transaction for notification errors
          }
        } else {
          console.warn('Metro card not found for user:', userId);
        }
      } catch (cardUpdateError) {
        console.error('Failed to update card balance:', cardUpdateError);
        // Mark transaction as failed if card update fails
        await prisma.transaction.update({
          where: { id: updatedTransaction.id },
          data: {
            status: 'FAILED',
            updatedAt: new Date(),
          },
        });
        
        return NextResponse.json(
          { error: 'Failed to update card balance' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { 
        transaction: updatedTransaction,
        message: 'Payment verified successfully'
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Verify payment error:', error);
    
    // Try to mark transaction as failed
    try {
      const body = await request.json();
      if (body.razorpay_order_id) {
        await prisma.transaction.updateMany({
          where: {
            razorpayOrderId: body.razorpay_order_id,
          },
          data: {
            status: 'FAILED',
            updatedAt: new Date(),
          },
        });
      }
    } catch (updateError) {
      console.error('Failed to update transaction status:', updateError);
    }

    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}

