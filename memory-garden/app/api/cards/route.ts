import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Mock data for development/testing
const mockCards = [
  {
    id: '1',
    topic_id: '1',
    type: 'analogy',
    content: "It's like two dancers who practiced together for years. Even when they're in separate rooms, they move in perfect synchronization, as if connected by invisible threads.",
    author_name: 'Emma',
    helpful_count: 127,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    topic_id: '1',
    type: 'definition',
    content: 'When two particles share a quantum state and measuring one instantly affects the other, regardless of the distance between them.',
    author_name: 'Marcus',
    helpful_count: 89,
    created_at: '2024-01-01T00:00:00.000Z'
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')
    
    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 })
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, using mock cards')
      const filteredMockCards = mockCards.filter(card => card.topic_id === topicId)
      return NextResponse.json(filteredMockCards)
    }

    const supabase = await createClient()
    
    const { data: cards, error } = await supabase
      .from('cards')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      // Fallback to mock data
      const filteredMockCards = mockCards.filter(card => card.topic_id === topicId)
      return NextResponse.json(filteredMockCards)
    }

    return NextResponse.json(cards || [])
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { topicId, type, content, authorName } = await request.json()
    
    if (!topicId || !type || !content) {
      return NextResponse.json({ 
        error: 'Topic ID, type, and content are required' 
      }, { status: 400 })
    }

    if (!['analogy', 'definition'].includes(type)) {
      return NextResponse.json({ 
        error: 'Type must be either "analogy" or "definition"' 
      }, { status: 400 })
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, creating mock card')
      const mockCard = {
        id: Date.now().toString(),
        topic_id: topicId,
        type,
        content,
        author_name: authorName || null,
        helpful_count: 0,
        created_at: new Date().toISOString()
      }
      return NextResponse.json(mockCard)
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('cards')
      .insert([{
        topic_id: topicId,
        type,
        content,
        author_name: authorName || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      // Fallback to mock card
      const mockCard = {
        id: Date.now().toString(),
        topic_id: topicId,
        type,
        content,
        author_name: authorName || null,
        helpful_count: 0,
        created_at: new Date().toISOString()
      }
      return NextResponse.json(mockCard)
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