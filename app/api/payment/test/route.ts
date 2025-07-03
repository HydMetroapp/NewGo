

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are set
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({
        status: 'error',
        message: 'Razorpay credentials not configured',
        config: {
          keyId: keyId ? 'Set' : 'Not Set',
          keySecret: keySecret ? 'Set' : 'Not Set'
        }
      }, { status: 500 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Test creating a minimal order
    try {
      const testOrder = await razorpay.orders.create({
        amount: 100, // ₹1 in paise
        currency: 'INR',
        receipt: `test_receipt_${Date.now()}`,
        notes: {
          test: 'true',
          timestamp: new Date().toISOString(),
        },
      });

      return NextResponse.json({
        status: 'success',
        message: 'Razorpay integration working correctly',
        config: {
          keyId: keyId.substring(0, 10) + '...',
          keySecret: 'Set (hidden)',
        },
        testOrder: {
          id: testOrder.id,
          amount: testOrder.amount,
          currency: testOrder.currency,
          status: testOrder.status,
        }
      }, { status: 200 });

    } catch (razorpayError: any) {
      return NextResponse.json({
        status: 'error',
        message: 'Razorpay API error',
        error: razorpayError.message,
        config: {
          keyId: keyId.substring(0, 10) + '...',
          keySecret: 'Set (hidden)',
        }
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Payment test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test payment integration',
      error: error.message
    }, { status: 500 });
  }
}

