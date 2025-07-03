

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { paymentId, amount, reason } = await request.json();

    // Validate required fields
    if (!paymentId || !amount || !reason) {
      return NextResponse.json(
        { error: 'Payment ID, amount, and reason are required' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid refund amount' },
        { status: 400 }
      );
    }

    // Validate Razorpay configuration
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay configuration missing');
      return NextResponse.json(
        { error: 'Payment service configuration error' },
        { status: 500 }
      );
    }

    console.log('Processing refund for payment:', paymentId);

    // Create refund through Razorpay
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount, // amount in paise
      speed: 'normal',
      notes: {
        reason,
        timestamp: new Date().toISOString(),
      },
    });

    console.log('Refund created successfully:', refund.id);

    // Find the original transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        razorpayPaymentId: paymentId,
      },
    });

    if (transaction) {
      // Create refund transaction record
      await prisma.transaction.create({
        data: {
          userId: transaction.userId,
          type: 'REFUND',
          amount: -(amount / 100), // negative amount for refund, convert to rupees
          status: 'SUCCESS',
          razorpayPaymentId: paymentId,
          description: `Refund: ${reason}`,
          createdAt: new Date(),
        },
      });

      // If original transaction was a card recharge, deduct from card balance
      if (transaction.type === 'CARD_RECHARGE' && transaction.metroCardId) {
        await prisma.metroCard.update({
          where: { id: transaction.metroCardId },
          data: {
            balance: {
              decrement: amount / 100, // convert to rupees
            },
            updatedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status,
      message: 'Refund processed successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Refund error:', error);
    
    // Handle specific Razorpay errors
    if (error.statusCode) {
      return NextResponse.json(
        { 
          error: error.error?.description || 'Razorpay refund error',
          code: error.statusCode 
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to process refund' },
      { status: 500 }
    );
  }
}

