

import { Transaction, PaymentStatus } from '../types';
import { PAYMENT_CONFIG } from '../constants';
import { prisma } from '../db';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export class PaymentService {
  static async createOrder(amount: number, description: string, userId: string): Promise<string> {
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          currency: PAYMENT_CONFIG.razorpay.currency,
          description,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const data = await response.json();
      return data.orderId;
    } catch (error: any) {
      console.error('Create order error:', error);
      throw new Error(error.message || 'Failed to create payment order');
    }
  }

  static async processPayment(
    orderId: string,
    amount: number,
    description: string,
    userId: string,
    userEmail: string,
    userName: string,
    userPhone: string
  ): Promise<Transaction> {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded'));
        return;
      }

      // Validate Razorpay key
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        reject(new Error('Razorpay configuration missing'));
        return;
      }

      const options = {
        key: razorpayKey,
        amount: amount * 100,
        currency: PAYMENT_CONFIG.razorpay.currency,
        name: 'Hyderabad Metro',
        description,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment on server
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId,
                amount,
                description,
              }),
            });

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              throw new Error(errorData.error || 'Payment verification failed');
            }

            const result = await verifyResponse.json();
            resolve(result.transaction);
          } catch (error: any) {
            console.error('Payment verification error:', error);
            reject(new Error(error.message || 'Payment verification failed'));
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        theme: PAYMENT_CONFIG.razorpay.theme,
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
          },
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
        timeout: 300, // 5 minutes
      };

      try {
        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', (response: any) => {
          console.error('Payment failed:', response.error);
          reject(new Error(response.error.description || 'Payment failed'));
        });
        razorpay.open();
      } catch (error: any) {
        console.error('Razorpay initialization error:', error);
        reject(new Error('Failed to initialize payment'));
      }
    });
  }

  static async rechargeMetroCard(
    cardId: string,
    amount: number,
    userId: string,
    userEmail: string,
    userName: string,
    userPhone: string
  ): Promise<Transaction> {
    try {
      // Validate recharge amount
      if (!this.isValidRechargeAmount(amount)) {
        throw new Error(`Recharge amount must be between ₹${PAYMENT_CONFIG.minRechargeAmount} and ₹${PAYMENT_CONFIG.maxRechargeAmount}`);
      }

      // Create order
      const orderId = await this.createOrder(
        amount,
        `Metro Card Recharge - ₹${amount}`,
        userId
      );

      // Process payment
      const transaction = await this.processPayment(
        orderId,
        amount,
        `Metro Card Recharge - ₹${amount}`,
        userId,
        userEmail,
        userName,
        userPhone
      );

      return transaction;
    } catch (error: any) {
      console.error('Recharge error:', error);
      throw new Error(error.message || 'Failed to recharge metro card');
    }
  }

  static async getTransactionHistory(userId: string, limit: number = 20): Promise<Transaction[]> {
    try {
      const transactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return transactions as any;
    } catch (error: any) {
      console.error('Get transaction history error:', error);
      throw new Error('Failed to get transaction history');
    }
  }

  static loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = (error) => {
        console.error('Failed to load Razorpay script:', error);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  static isValidRechargeAmount(amount: number): boolean {
    return (
      amount >= PAYMENT_CONFIG.minRechargeAmount &&
      amount <= PAYMENT_CONFIG.maxRechargeAmount &&
      amount > 0 &&
      Number.isInteger(amount)
    );
  }

  static validatePaymentData(data: any): boolean {
    return (
      data &&
      data.razorpay_order_id &&
      data.razorpay_payment_id &&
      data.razorpay_signature &&
      typeof data.razorpay_order_id === 'string' &&
      typeof data.razorpay_payment_id === 'string' &&
      typeof data.razorpay_signature === 'string'
    );
  }

  static async refundPayment(paymentId: string, amount: number, reason: string): Promise<any> {
    try {
      const response = await fetch('/api/payment/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          amount: amount * 100, // Convert to paise
          reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Refund failed');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Refund error:', error);
      throw new Error(error.message || 'Failed to process refund');
    }
  }
}

