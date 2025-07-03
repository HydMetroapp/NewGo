
'use client';

import { useState, useEffect } from 'react';
import { PaymentService } from '@/lib/services/payment-service';
import { useToast } from '@/hooks/use-toast';

interface UseMetroCardReturn {
  metroCards: any[];
  transactions: any[];
  isLoading: boolean;
  error: string | null;
  rechargeCard: (cardId: string, amount: number) => Promise<void>;
  refreshCards: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  getCardById: (cardId: string) => any | undefined;
}

export function useMetroCard(): UseMetroCardReturn {
  const [metroCards, setMetroCards] = useState([
    {
      id: '1',
      cardNumber: '6011123456789012',
      balance: 150,
      isActive: true,
      cardType: 'REGULAR',
      createdAt: new Date(),
    }
  ]);
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      description: 'Card Recharge',
      amount: 200,
      status: 'SUCCESS',
      createdAt: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load Razorpay script on component mount
  useEffect(() => {
    const loadRazorpay = async () => {
      const loaded = await PaymentService.loadRazorpayScript();
      if (!loaded) {
        setError('Failed to load payment service');
        toast({
          title: 'Payment Service Error',
          description: 'Failed to load payment service. Please refresh the page.',
          variant: 'destructive',
        });
      }
    };

    loadRazorpay();
  }, [toast]);

  const rechargeCard = async (cardId: string, amount: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate recharge amount
      if (!PaymentService.isValidRechargeAmount(amount)) {
        throw new Error('Invalid recharge amount');
      }

      // Mock user data - in real app, this would come from auth context
      const mockUser = {
        id: 'user_123',
        email: 'user@example.com',
        name: 'Test User',
        phone: '9876543210',
      };

      // Process payment through Razorpay
      const transaction = await PaymentService.rechargeMetroCard(
        cardId,
        amount,
        mockUser.id,
        mockUser.email,
        mockUser.name,
        mockUser.phone
      );

      // Update local state with new balance
      setMetroCards(prev => prev.map(card => 
        card.id === cardId 
          ? { ...card, balance: card.balance + amount }
          : card
      ));
      
      // Add transaction to local state
      setTransactions(prev => [{
        id: transaction.id || Date.now().toString(),
        description: `Card Recharge - ₹${amount}`,
        amount,
        status: 'SUCCESS',
        createdAt: new Date(),
        razorpayPaymentId: transaction.razorpayPaymentId,
        razorpayOrderId: transaction.razorpayOrderId,
      }, ...prev]);

      toast({
        title: 'Recharge Successful',
        description: `₹${amount} has been added to your metro card.`,
      });

    } catch (error: any) {
      console.error('Recharge error:', error);
      setError(error.message);
      
      // Add failed transaction to local state
      setTransactions(prev => [{
        id: Date.now().toString(),
        description: `Failed Card Recharge - ₹${amount}`,
        amount,
        status: 'FAILED',
        createdAt: new Date(),
      }, ...prev]);

      toast({
        title: 'Recharge Failed',
        description: error.message || 'Failed to recharge metro card. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCards = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from API
      // For now, just simulate a refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTransactions = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch transaction history from API
      // For now, just simulate a refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCardById = (cardId: string) => {
    return metroCards.find(card => card.id === cardId);
  };

  return {
    metroCards,
    transactions,
    isLoading,
    error,
    rechargeCard,
    refreshCards,
    refreshTransactions,
    getCardById,
  };
}
