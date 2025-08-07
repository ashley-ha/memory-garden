import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { canCreateCard } from '@/lib/subscription'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')
    const userId = searchParams.get('userId')
    
    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    const { data: cards, error } = await supabase
      .from('cards')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
    }

    // If userId is provided, check which cards are in the user's study deck
    let cardsWithDeckStatus = cards || []
    if (userId && cards && cards.length > 0) {
      const cardIds = cards.map(card => card.id)
      const { data: userDeckCards } = await supabase
        .from('user_study_decks')
        .select('card_id')
        .eq('user_id', userId)
        .in('card_id', cardIds)

      const deckCardIds = new Set(userDeckCards?.map(item => item.card_id) || [])
      cardsWithDeckStatus = cards.map(card => ({
        ...card,
        in_study_deck: deckCardIds.has(card.id)
      }))
    }

    return NextResponse.json(cardsWithDeckStatus)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    
    const session = await getServerSession(authOptions)
    const { 
      topicId, 
      type, 
      content, 
      frontContent, 
      backContent,
      sources, 
      isAnonymous, 
      userSession 
    } = await request.json()
    
    // Validate based on whether it's a flashcard or general wisdom
    const isFlashcard = frontContent !== undefined && backContent !== undefined
    
    if (!topicId || !type) {
      return NextResponse.json({ 
        error: 'Topic ID and type are required' 
      }, { status: 400 })
    }

    if (isFlashcard && (!frontContent || !backContent)) {
      return NextResponse.json({ 
        error: 'Front and back content are required for flashcards' 
      }, { status: 400 })
    }

    if (!isFlashcard && !content) {
      return NextResponse.json({ 
        error: 'Content is required' 
      }, { status: 400 })
    }

    if (!['analogy', 'definition', 'knowledge'].includes(type)) {
      return NextResponse.json({ 
        error: 'Type must be "analogy", "definition", or "knowledge"' 
      }, { status: 400 })
    }

    let authorId = null
    let finalAuthorName = null

    // If user is authenticated, use their info
    if (session?.user?.id) {
      authorId = session.user.id
      finalAuthorName = isAnonymous ? null : (session.user.name?.split(' ')[0] || 'User')
    } else {
      // For anonymous users, use session ID from request
      authorId = userSession || 'anonymous'
      // Anonymous users don't get a name displayed, but can still delete
      finalAuthorName = null
    }

    // Check if user can create a card for this topic (subscription limits)
    if (authorId && authorId !== 'anonymous') {
      const limitCheck = await canCreateCard(authorId, topicId)
      if (!limitCheck.allowed) {
        return NextResponse.json({ 
          error: 'LIMIT_REACHED',
          message: limitCheck.reason,
          cardCount: limitCheck.cardCount
        }, { status: 403 })
      }
    }

    // Process sources: convert newline-separated string to array for PostgreSQL
    let processedSources = null
    if (sources && typeof sources === 'string' && sources.trim()) {
      const sourceUrls = sources
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)
        .filter(url => {
          // Basic URL validation
          try {
            new URL(url)
            return true
          } catch {
            return false
          }
        })
      processedSources = sourceUrls.length > 0 ? sourceUrls : null
    }

    const supabase = await createClient()
    
    const cardData = {
      topic_id: topicId,
      type,
      content: isFlashcard ? '' : content, // Empty string for flashcards
      front_content: isFlashcard ? frontContent : null,
      back_content: isFlashcard ? backContent : null,
      sources: processedSources,
      author_id: authorId,
      author_name: finalAuthorName
    }
    
    const { data, error } = await supabase
      .from('cards')
      .insert([cardData])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
    }

    return NextResponse.json({
      ...data,
      helpful_count: 0 // New cards start with 0 helpful votes
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
  }
}