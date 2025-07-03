
import { NextRequest, NextResponse } from 'next/server';
import { JourneyService } from '@/lib/services/journey-service';
import { EntryMethod } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const journeys = await JourneyService.getJourneyHistory(userId, limit);
    return NextResponse.json({ journeys }, { status: 200 });
  } catch (error: any) {
    console.error('Get journeys error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch journeys' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'start':
        const { userId, metroCardId, fromStationId, entryMethod, entryLatitude, entryLongitude } = data;
        const journey = await JourneyService.startJourney(
          userId,
          metroCardId,
          fromStationId,
          entryMethod as EntryMethod,
          entryLatitude,
          entryLongitude
        );
        return NextResponse.json({ journey }, { status: 201 });

      case 'end':
        const { journeyId, toStationId, exitMethod, exitLatitude, exitLongitude } = data;
        const completedJourney = await JourneyService.endJourney(
          journeyId,
          toStationId,
          exitMethod as EntryMethod,
          exitLatitude,
          exitLongitude
        );
        return NextResponse.json({ journey: completedJourney }, { status: 200 });

      case 'cancel':
        const { journeyId: cancelJourneyId } = data;
        const cancelledJourney = await JourneyService.cancelJourney(cancelJourneyId);
        return NextResponse.json({ journey: cancelledJourney }, { status: 200 });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Journey API error:', error);
    return NextResponse.json(
      { error: error.message || 'Journey operation failed' },
      { status: 400 }
    );
  }
}
