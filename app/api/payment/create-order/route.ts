

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
    const { amount, currency, description, userId } = await request.json();

    // Validate required fields
    if (!amount || !userId) {
      return NextResponse.json(
        { error: 'Amount and user ID are required' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount provided' },
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

    // Create unique receipt ID
    const receiptId = `receipt_${userId}_${Date.now()}`;

    // Create Razorpay order
    const orderOptions = {
      amount: amount, // amount in paise
      currency: currency || 'INR',
      receipt: receiptId,
      notes: {
        userId,
        description: description || 'Metro Card Recharge',
        timestamp: new Date().toISOString(),
      },
    };

    console.log('Creating Razorpay order with options:', {
      ...orderOptions,
      amount: `${amount} paise (₹${amount / 100})`,
    });

    const order = await razorpay.orders.create(orderOptions);

    console.log('Razorpay order created successfully:', order.id);

    // Create transaction record in database
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: 'CARD_RECHARGE',
        amount: amount / 100, // convert back to rupees for storage
        status: 'PENDING',
        razorpayOrderId: order.id,
        description: description || 'Metro Card Recharge',
        createdAt: new Date(),
      },
    });

    console.log('Transaction record created:', transaction.id);

    return NextResponse.json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      transactionId: transaction.id
    }, { status: 200 });

  } catch (error: any) {
    console.error('Create order error:', error);
    
    // Handle specific Razorpay errors
    if (error.statusCode) {
      return NextResponse.json(
        { 
          error: error.error?.description || 'Razorpay API error',
          code: error.statusCode 
        },
        { status: error.statusCode }
      );
    }

    // Handle database errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate transaction detected' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}

