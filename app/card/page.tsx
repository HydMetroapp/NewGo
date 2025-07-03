
'use client';

import { useState } from 'react';
import { Plus, CreditCard, History, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MainLayout } from '@/components/layout/main-layout';
import { MetroCardDisplay } from '@/components/metro/metro-card-display';
import { useMetroCard } from '@/hooks/use-metro-card';
import { useToast } from '@/hooks/use-toast';
import { PAYMENT_CONFIG } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export default function MetroCardPage() {
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [isRecharging, setIsRecharging] = useState(false);
  const [showRechargeDialog, setShowRechargeDialog] = useState(false);

  const { metroCards, transactions, rechargeCard, isLoading } = useMetroCard();
  const { toast } = useToast();

  const handleRecharge = async () => {
    if (!selectedCardId || !rechargeAmount) return;

    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount < PAYMENT_CONFIG.minRechargeAmount) {
      toast({
        title: 'Invalid Amount',
        description: `Minimum recharge amount is ${formatCurrency(PAYMENT_CONFIG.minRechargeAmount)}`,
        variant: 'destructive',
      });
      return;
    }

    setIsRecharging(true);
    try {
      await rechargeCard(selectedCardId, amount);
      setShowRechargeDialog(false);
      setRechargeAmount('');
      setSelectedCardId('');
    } catch (error: any) {
      // Error is handled in the hook
    } finally {
      setIsRecharging(false);
    }
  };

  const openRechargeDialog = (cardId: string) => {
    setSelectedCardId(cardId);
    setShowRechargeDialog(true);
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Metro Cards</h1>
            <p className="text-muted-foreground">
              Manage your metro cards and view transaction history
            </p>
          </div>
        </div>

        {/* Metro Cards */}
        <div className="space-y-4">
          {metroCards.length > 0 ? (
            metroCards.map((card) => (
              <MetroCardDisplay
                key={card.id}
                card={card}
                onRecharge={openRechargeDialog}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Metro Cards</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any metro cards yet. A default card will be created when you sign up.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Recharge */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Recharge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_CONFIG.rechargeAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => {
                    if (metroCards.length > 0) {
                      setSelectedCardId(metroCards[0].id);
                      setRechargeAmount(amount.toString());
                      setShowRechargeDialog(true);
                    }
                  }}
                  disabled={metroCards.length === 0}
                >
                  {formatCurrency(amount)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-2 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {transaction.status.toLowerCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recharge Dialog */}
        <Dialog open={showRechargeDialog} onOpenChange={setShowRechargeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recharge Metro Card</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Recharge Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  min={PAYMENT_CONFIG.minRechargeAmount}
                  max={PAYMENT_CONFIG.maxRechargeAmount}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Minimum: {formatCurrency(PAYMENT_CONFIG.minRechargeAmount)}, 
                  Maximum: {formatCurrency(PAYMENT_CONFIG.maxRechargeAmount)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_CONFIG.rechargeAmounts.slice(0, 6).map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setRechargeAmount(amount.toString())}
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRechargeDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRecharge}
                  disabled={isRecharging || !rechargeAmount}
                  className="flex-1"
                >
                  {isRecharging ? 'Processing...' : 'Recharge'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
