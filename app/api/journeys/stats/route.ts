
import { NextRequest, NextResponse } from 'next/server';
import { JourneyService } from '@/lib/services/journey-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const stats = await JourneyService.getJourneyStats(userId);
    return NextResponse.json({ stats }, { status: 200 });
  } catch (error: any) {
    console.error('Get journey stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch journey stats' },
      { status: 500 }
    );
  }
}
