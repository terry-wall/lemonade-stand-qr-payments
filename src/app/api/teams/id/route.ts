import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Handle the case where params might be a Promise in newer Next.js versions
    const params = await Promise.resolve(context.params)
    const { id } = params
    
    if (!id) {
      return NextResponse.json({ error: 'Missing team ID' }, { status: 400 })
    }

    // Mock team data
    const team = {
      id: id,
      name: `Team ${id}`,
      players: [
        { id: 1, name: 'Player 1', position: 'Forward' },
        { id: 2, name: 'Player 2', position: 'Guard' },
        { id: 3, name: 'Player 3', position: 'Center' },
      ],
      stats: {
        wins: 10,
        losses: 5,
        pointsScored: 850,
        pointsAllowed: 720,
      }
    }
    
    return NextResponse.json(team)
  } catch (error: any) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}