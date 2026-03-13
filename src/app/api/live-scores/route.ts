import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Mock live scores data
    const liveScores = [
      {
        id: '1',
        homeTeam: 'Lakers',
        awayTeam: 'Celtics',
        homeScore: 98,
        awayScore: 102,
        quarter: 4,
        timeRemaining: '2:30',
        status: 'LIVE'
      },
      {
        id: '2',
        homeTeam: 'Warriors',
        awayTeam: 'Nuggets', 
        homeScore: 115,
        awayScore: 108,
        quarter: 'FINAL',
        timeRemaining: '',
        status: 'FINAL'
      },
      {
        id: '3',
        homeTeam: 'Heat',
        awayTeam: 'Bucks',
        homeScore: 0,
        awayScore: 0,
        quarter: 'Q1',
        timeRemaining: '12:00',
        status: 'SCHEDULED'
      }
    ]
    
    return NextResponse.json(liveScores)
  } catch (error: any) {
    console.error('Error fetching live scores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch live scores' },
      { status: 500 }
    )
  }
}