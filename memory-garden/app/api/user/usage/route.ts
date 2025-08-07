import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserUsage, isUserPro, FREE_LIMITS } from '@/lib/subscription'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const [usage, isPro] = await Promise.all([
      getUserUsage(session.user.id),
      isUserPro(session.user.id)
    ])

    return NextResponse.json({
      usage,
      isPro,
      limits: FREE_LIMITS,
      canCreateTopic: isPro || usage.topics_created < FREE_LIMITS.TOPICS_PER_MONTH
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 })
  }
}