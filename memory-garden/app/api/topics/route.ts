import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { canCreateTopic, incrementTopicUsage } from '@/lib/subscription'


export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''
    const limit = parseInt(url.searchParams.get('limit') || '50')

    const supabase = await createClient()
    
    // Build query with search
    let query = supabase
      .from('topics')
      .select('*')

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: topics, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
    }

    // Get card counts for all topics in a single query
    const { data: cardCounts } = await supabase
      .from('cards')
      .select('topic_id')
      .in('topic_id', (topics || []).map(t => t.id))

    const cardCountMap = new Map<string, number>()
    cardCounts?.forEach(card => {
      cardCountMap.set(card.topic_id, (cardCountMap.get(card.topic_id) || 0) + 1)
    })

    // Get all cards with their IDs for learner calculations
    const { data: allTopicCards } = await supabase
      .from('cards')
      .select('id, topic_id, author_id')
      .in('topic_id', (topics || []).map(t => t.id))

    // Get all card IDs
    const allCardIds = allTopicCards?.map(c => c.id) || []

    // Get all reviews and helpful votes in bulk
    const [reviewsResult, helpfulVotesResult] = await Promise.all([
      supabase.from('reviews').select('user_id, card_id').in('card_id', allCardIds),
      supabase.from('helpful_votes').select('user_id, card_id').in('card_id', allCardIds)
    ])

    // Group learner data by topic
    const learnerCountMap = new Map<string, Set<string>>()
    
    // Initialize empty sets for each topic
    topics?.forEach(topic => {
      learnerCountMap.set(topic.id, new Set())
    })

    // Add review users
    reviewsResult.data?.forEach(review => {
      const card = allTopicCards?.find(c => c.id === review.card_id)
      if (card) {
        learnerCountMap.get(card.topic_id)?.add(review.user_id)
      }
    })

    // Add helpful vote users
    helpfulVotesResult.data?.forEach(vote => {
      const card = allTopicCards?.find(c => c.id === vote.card_id)
      if (card) {
        learnerCountMap.get(card.topic_id)?.add(vote.user_id)
      }
    })

    // Add card contributors
    allTopicCards?.forEach(card => {
      if (card.author_id) {
        learnerCountMap.get(card.topic_id)?.add(card.author_id)
      }
    })

    // Build topics with stats
    const topicsWithStats = (topics || []).map(topic => {
      const cardCount = cardCountMap.get(topic.id) || 0
      const learnerCount = learnerCountMap.get(topic.id)?.size || 0

      return {
        ...topic,
        card_count: cardCount,
        learner_count: learnerCount,
        popularity_score: cardCount + learnerCount
      }
    })

    // Sort by popularity (card_count + learner_count) and limit to top results
    const sortedTopics = topicsWithStats
      .sort((a, b) => b.popularity_score - a.popularity_score)
      .slice(0, limit)

    // Debug: Log first topic to check author_id
    if (sortedTopics.length > 0) {
      console.log('First topic from DB:', {
        title: sortedTopics[0].title,
        author_id: sortedTopics[0].author_id,
        hasAuthorId: !!sortedTopics[0].author_id
      })
    }

    return NextResponse.json(sortedTopics)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    
    const session = await getServerSession(authOptions)
    const { title, description, isAnonymous, userSession } = await request.json()
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
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

    // Check if user can create a topic (subscription limits)
    if (authorId && authorId !== 'anonymous') {
      const limitCheck = await canCreateTopic(authorId)
      if (!limitCheck.allowed) {
        return NextResponse.json({ 
          error: 'LIMIT_REACHED',
          message: limitCheck.reason,
          usage: limitCheck.usage
        }, { status: 403 })
      }
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('topics')
      .insert([{ 
        title, 
        description,
        author_id: authorId,
        author_name: finalAuthorName
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 })
    }

    // Increment usage counter for authenticated users
    if (authorId && authorId !== 'anonymous') {
      await incrementTopicUsage(authorId)
    }

    return NextResponse.json({
      ...data,
      card_count: 0,
      learner_count: 0 // Real learner count for new topics (starts at 0)
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 })
  }
}