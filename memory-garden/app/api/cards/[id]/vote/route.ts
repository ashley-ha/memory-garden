import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    
    const session = await getServerSession(authOptions)
    const { id: cardId } = await params
    
    if (!cardId) {
      return NextResponse.json({ 
        error: 'Card ID is required' 
      }, { status: 400 })
    }

    // For voting, we use either authenticated user ID or anonymous session
    let userId = 'anonymous'
    if (session?.user?.id) {
      userId = session.user.id
    } else {
      // For anonymous users, we'll create a temporary session
      const { userSession } = await request.json()
      if (userSession) {
        userId = `anonymous_${userSession}`
      }
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, mock vote recorded')
      return NextResponse.json({ success: true, helpful_count: 42 })
    }

    const supabase = await createClient()
    
    // Check if user has already voted on this card
    const { data: existingVote } = await supabase
      .from('helpful_votes')
      .select('id')
      .eq('card_id', cardId)
      .eq('user_id', userId)
      .single()

    if (existingVote) {
      return NextResponse.json({ 
        error: 'You have already voted on this card' 
      }, { status: 400 })
    }

    // Add the vote
    const { error: voteError } = await supabase
      .from('helpful_votes')
      .insert([{
        card_id: cardId,
        user_id: userId
      }])

    if (voteError) {
      console.error('Vote error:', voteError)
      return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
    }

    // Update the helpful count on the card
    const { error: updateError } = await supabase
      .rpc('increment_helpful_count', { card_id: cardId })

    if (updateError) {
      console.error('Update error:', updateError)
      // Vote was recorded but count update failed - not critical
    }

    // Get updated count
    const { data: card } = await supabase
      .from('cards')
      .select('helpful_count')
      .eq('id', cardId)
      .single()

    return NextResponse.json({ 
      success: true, 
      helpful_count: card?.helpful_count || 1 
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 })
  }
}