import { createClient } from '@/lib/supabase/server'
import { calculateNextReview } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { cardId, rating, userSession } = await request.json()
    
    if (!cardId || !rating || !userSession) {
      return NextResponse.json({ 
        error: 'Card ID, rating, and user session are required' 
      }, { status: 400 })
    }

    const validRatings = ['again', 'hard', 'good', 'easy'] as const
    if (!validRatings.includes(rating)) {
      return NextResponse.json({ 
        error: 'Rating must be one of: again, hard, good, easy' 
      }, { status: 400 })
    }

    const nextReview = calculateNextReview(rating)

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, mock review recorded')
      return NextResponse.json({ 
        success: true, 
        nextReview: nextReview.toISOString(),
        rating 
      })
    }

    const supabase = await createClient()
    
    // Check if there's an existing review for this card by this user
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('card_id', cardId)
      .eq('user_session', userSession)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let reviewData
    if (existingReview) {
      // Update existing review
      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating,
          next_review: nextReview.toISOString()
        })
        .eq('id', existingReview.id)
        .select()
        .single()

      if (error) {
        console.error('Update review error:', error)
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
      }
      reviewData = data
    } else {
      // Create new review
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          card_id: cardId,
          user_session: userSession,
          rating,
          next_review: nextReview.toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Create review error:', error)
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
      }
      reviewData = data
    }

    return NextResponse.json({ 
      success: true, 
      nextReview: reviewData.next_review,
      rating: reviewData.rating
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to process review' }, { status: 500 })
  }
}

// Get cards due for review for a specific user and topic
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userSession = searchParams.get('userSession')
    const topicId = searchParams.get('topicId')
    
    if (!userSession || !topicId) {
      return NextResponse.json({ 
        error: 'User session and topic ID are required' 
      }, { status: 400 })
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, returning mock due cards')
      return NextResponse.json([])
    }

    const supabase = await createClient()
    const now = new Date().toISOString()
    
    // Get cards due for review
    const { data: dueReviews, error } = await supabase
      .from('reviews')
      .select(`
        card_id,
        next_review,
        cards (
          id,
          topic_id,
          type,
          content,
          author_name,
          helpful_count,
          created_at
        )
      `)
      .eq('user_session', userSession)
      .eq('cards.topic_id', topicId)
      .lte('next_review', now)
      .order('next_review', { ascending: true })

    if (error) {
      console.error('Query due reviews error:', error)
      return NextResponse.json({ error: 'Failed to fetch due cards' }, { status: 500 })
    }

    // Extract the cards from the review data
    const dueCards = (dueReviews || []).map(review => review.cards).filter(Boolean)
    
    return NextResponse.json(dueCards)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch due cards' }, { status: 500 })
  }
}