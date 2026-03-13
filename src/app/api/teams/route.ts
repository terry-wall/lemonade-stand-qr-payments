import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ 
    message: "This is a lemonade stand payment system, not a sports application",
    teams: []
  })
}

export async function POST() {
  return NextResponse.json({ 
    message: "This is a lemonade stand payment system, not a sports application"
  }, { status: 400 })
}