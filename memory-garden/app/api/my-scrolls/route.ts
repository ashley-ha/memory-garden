import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const supabase = await createClient()

    // Fetch saved topics with stats
    const { data: savedTopicsData, error: savedError } = await supabase
      .from('saved_topics')
      .select(`
        topic_id,
        saved_at,
        topics (
          id,
          title,
          description,
          created_at,
          author_id,
          author_name
        )
      `)
      .eq('user_id', session.user.id)
      .order('saved_at', { ascending: false })

    if (savedError) {
      console.error('Error fetching saved topics:', savedError)
      return NextResponse.json({ error: 'Failed to fetch saved topics' }, { status: 500 })
    }

    // Transform saved topics and add stats
    const savedTopics = await Promise.all(
      (savedTopicsData || []).map(async (item) => {
        const topic = item.topics as any
        
        // Get card count
        const { count: cardCount } = await supabase
          .from('cards')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topic.id)

        // Get learner count
        const { count: learnerCount } = await supabase
          .from('reviews')
          .select('user_id', { count: 'exact', head: true })
          .eq('card_id', topic.id)

        return {
          ...topic,
          card_count: cardCount || 0,
          learner_count: learnerCount || 0
        }
      })
    )

    // Fetch user's created cards with topic info
    const { data: userCards, error: cardsError } = await supabase
      .from('cards')
      .select(`
        *,
        topics (
          id,
          title
        )
      `)
      .eq('author_id', session.user.id)
      .order('created_at', { ascending: false })

    if (cardsError) {
      console.error('Error fetching user cards:', cardsError)
      return NextResponse.json({ error: 'Failed to fetch user cards' }, { status: 500 })
    }

    // Transform the cards data
    const createdCards = (userCards || []).map(card => ({
      card: {
        id: card.id,
        topic_id: card.topic_id,
        type: card.type,
        content: card.content,
        author_name: card.author_name,
        author_id: card.author_id,
        helpful_count: card.helpful_count,
        created_at: card.created_at
      },
      topic: card.topics as { id: string; title: string }
    }))

    return NextResponse.json({
      savedTopics,
      createdCards
    })
  } catch (error) {
    console.error('Error in my-scrolls GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}