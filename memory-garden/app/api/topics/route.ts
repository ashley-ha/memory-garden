import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'


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

    // Get card counts and calculate popularity
    const topicsWithStats = await Promise.all(
      (topics || []).map(async (topic) => {
        const { count: cardCount } = await supabase
          .from('cards')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topic.id)

        // Get unique learner count from real user interactions for this topic's cards
        const { data: cardIds } = await supabase
          .from('cards')
          .select('id')
          .eq('topic_id', topic.id)

        let learnerCount = 0
        if (cardIds && cardIds.length > 0) {
          // Get users who have studied cards (reviews)
          const { data: reviews } = await supabase
            .from('reviews')
            .select('user_id')
            .in('card_id', cardIds.map(c => c.id))

          // Get users who have marked cards as helpful
          const { data: helpfulVotes } = await supabase
            .from('helpful_votes')
            .select('user_id')
            .in('card_id', cardIds.map(c => c.id))

          // Get users who have contributed cards to this topic
          const { data: cardContributors } = await supabase
            .from('cards')
            .select('author_id')
            .eq('topic_id', topic.id)
            .not('author_id', 'is', null)

          // Combine all unique user sessions/IDs
          const allUserSessions = new Set([
            ...(reviews?.map(r => r.user_id) || []),
            ...(helpfulVotes?.map(v => v.user_id) || []),
            ...(cardContributors?.map(c => c.author_id) || [])
          ])

          learnerCount = allUserSessions.size
        }

        const finalLearnerCount = learnerCount

        return {
          ...topic,
          card_count: cardCount || 0,
          learner_count: finalLearnerCount,
          popularity_score: (cardCount || 0) + finalLearnerCount
        }
      })
    )

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