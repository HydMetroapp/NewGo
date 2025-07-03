
'use client';

import { CreditCard, Plus, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetroCard, CardType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { getLineColor } from '@/lib/utils';

interface MetroCardDisplayProps {
  card: MetroCard;
  onRecharge: (cardId: string) => void;
  className?: string;
}

export function MetroCardDisplay({ card, onRecharge, className }: MetroCardDisplayProps) {
  const getCardTypeColor = (type: CardType) => {
    switch (type) {
      case CardType.STUDENT:
        return 'bg-green-500';
      case CardType.SENIOR_CITIZEN:
        return 'bg-orange-500';
      case CardType.DISABLED:
        return 'bg-purple-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getCardTypeName = (type: CardType) => {
    switch (type) {
      case CardType.STUDENT:
        return 'Student';
      case CardType.SENIOR_CITIZEN:
        return 'Senior Citizen';
      case CardType.DISABLED:
        return 'Disabled';
      default:
        return 'Regular';
    }
  };

  const isLowBalance = card.balance < 50;

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* Card Background Gradient */}
      <div className={`absolute inset-0 ${getCardTypeColor(card.cardType)} opacity-10`} />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle className="text-lg">Metro Card</CardTitle>
          </div>
          <Badge variant={card.isActive ? "default" : "secondary"}>
            {card.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Card Number */}
        <div>
          <p className="text-sm text-muted-foreground">Card Number</p>
          <p className="font-mono text-lg font-semibold">
            {card.cardNumber.replace(/(.{4})/g, '$1 ').trim()}
          </p>
        </div>

        {/* Card Type */}
        <div>
          <p className="text-sm text-muted-foreground">Card Type</p>
          <Badge variant="outline" className={`${getCardTypeColor(card.cardType)} text-white border-none`}>
            {getCardTypeName(card.cardType)}
          </Badge>
        </div>

        {/* Balance */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className={`text-2xl font-bold ${isLowBalance ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(card.balance)}
            </p>
            {isLowBalance && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Low balance
              </p>
            )}
          </div>
          
          <Button 
            onClick={() => onRecharge(card.id)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Recharge
          </Button>
        </div>

        {/* Card Visual Element */}
        <div className="flex justify-end">
          <div className={`h-8 w-12 rounded ${getCardTypeColor(card.cardType)} opacity-20`} />
        </div>
      </CardContent>
    </Card>
  );
}
