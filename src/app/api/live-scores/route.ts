import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // This is a lemonade stand app, not a sports app
    // Return empty scores or redirect to appropriate endpoint
    return NextResponse.json({ 
      message: "This is a lemonade stand payment system, not a sports application",
      scores: []
    })
  } catch (error) {
    console.error('Error in live-scores route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}