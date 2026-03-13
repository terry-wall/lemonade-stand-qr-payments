import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ 
    message: "This is a lemonade stand payment system, not a sports application",
    team: null
  })
}