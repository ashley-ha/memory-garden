// NextAuth temporarily disabled for MVP - using simple session-based tracking
// import NextAuth from 'next-auth'
// import { authOptions } from '@/lib/auth'

// const handler = NextAuth(authOptions)

// export { handler as GET, handler as POST }

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Auth disabled for MVP' })
}

export async function POST() {
  return NextResponse.json({ message: 'Auth disabled for MVP' })
}