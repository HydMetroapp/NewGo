
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateCardNumber } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const metroCards = await prisma.metroCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ metroCards }, { status: 200 });
  } catch (error: any) {
    console.error('Get metro cards error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch metro cards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, cardType = 'REGULAR' } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const metroCard = await prisma.metroCard.create({
      data: {
        cardNumber: generateCardNumber(),
        balance: 0,
        isActive: true,
        cardType,
        userId,
      },
    });

    return NextResponse.json({ metroCard }, { status: 201 });
  } catch (error: any) {
    console.error('Create metro card error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create metro card' },
      { status: 500 }
    );
  }
}
