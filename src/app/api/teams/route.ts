import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Mock teams data
    const teams = [
      {
        id: '1',
        name: 'Lakers',
        city: 'Los Angeles',
        conference: 'Western',
        division: 'Pacific',
        wins: 45,
        losses: 37,
      },
      {
        id: '2', 
        name: 'Celtics',
        city: 'Boston',
        conference: 'Eastern',
        division: 'Atlantic',
        wins: 50,
        losses: 32,
      },
      {
        id: '3',
        name: 'Warriors',
        city: 'Golden State',
        conference: 'Western', 
        division: 'Pacific',
        wins: 42,
        losses: 40,
      }
    ]
    
    return NextResponse.json(teams)
  } catch (error: any) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}