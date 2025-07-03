
import { NextRequest, NextResponse } from 'next/server';
import { calculateFare } from '@/lib/utils';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { fromStationId, toStationId, cardType = 'REGULAR' } = await request.json();

    if (!fromStationId || !toStationId) {
      return NextResponse.json(
        { error: 'From and to station IDs are required' },
        { status: 400 }
      );
    }

    // Get station details
    const [fromStation, toStation] = await Promise.all([
      prisma.station.findUnique({ where: { id: fromStationId } }),
      prisma.station.findUnique({ where: { id: toStationId } }),
    ]);

    if (!fromStation || !toStation) {
      return NextResponse.json(
        { error: 'Invalid station ID(s)' },
        { status: 400 }
      );
    }

    const fare = calculateFare(fromStation as any, toStation as any, cardType);

    return NextResponse.json({
      fare,
      fromStation: fromStation.name,
      toStation: toStation.name,
      cardType,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Calculate fare error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate fare' },
      { status: 500 }
    );
  }
}
