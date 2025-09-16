import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Razorpay webhooks are temporarily disabled for deployment
  return NextResponse.json({ 
    error: 'Razorpay webhooks are temporarily unavailable' 
  }, { status: 503 })
}