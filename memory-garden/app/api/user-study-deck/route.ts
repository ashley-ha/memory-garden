import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/user-study-deck - Get user's study deck cards
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const topicId = searchParams.get('topicId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    let query = supabase
      .from('user_study_decks')
      .select(`
        id,
        card_id,
        added_at,
        cards!inner (
          id,
          topic_id,
          type,
          content,
          front_content,
          back_content,
          author_name,
          author_id,
          helpful_count,
          sources,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false })

    // If topicId is provided, filter by topic
    if (topicId) {
      query = query.eq('cards.topic_id', topicId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching user study deck:', error)
      if (error.message?.includes('user_study_decks') && error.message?.includes('does not exist')) {
        return NextResponse.json({ error: 'Study deck feature not yet enabled. Please run the database migration first.' }, { status: 503 })
      }
      return NextResponse.json({ error: 'Failed to fetch study deck' }, { status: 500 })
    }

    // Transform the data to flatten the cards
    const cards = data?.map(item => ({
      ...item.cards,
      in_study_deck: true,
      deck_added_at: item.added_at
    })) || []

    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error in GET /api/user-study-deck:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/user-study-deck - Add card to user's study deck
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, cardId } = body

    if (!userId || !cardId) {
      return NextResponse.json({ error: 'User ID and Card ID are required' }, { status: 400 })
    }

    const supabase = await createClient()
    // Insert into user_study_decks (will fail if already exists due to unique constraint)
    const { data, error } = await supabase
      .from('user_study_decks')
      .insert({
        user_id: userId,
        card_id: cardId
      })
      .select()
      .single()

    if (error) {
      // Check if it's a unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Card already in study deck' }, { status: 409 })
      }
      console.error('Error adding card to study deck:', error)
      if (error.message?.includes('user_study_decks') && error.message?.includes('does not exist')) {
        return NextResponse.json({ error: 'Study deck feature not yet enabled. Please run the database migration first.' }, { status: 503 })
      }
      return NextResponse.json({ error: 'Failed to add card to study deck' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in POST /api/user-study-deck:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}