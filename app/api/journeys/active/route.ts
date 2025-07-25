import { NextRequest, NextResponse } from 'next/server'
import { JourneyService } from '@/lib/services/journey-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const activeJourney = await JourneyService.getActiveJourney(userId)
    return NextResponse.json({ journey: activeJourney }, { status: 200 })
  } catch (error: any) {
    console.error('Get active journey error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch active journey' },
      { status: 500 },
    )
  }
}
