import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')
    
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

    return NextResponse.json(cards || [])
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
    const { topicId, type, content, sources, isAnonymous, userSession } = await request.json()
    
    if (!topicId || !type || !content) {
      return NextResponse.json({ 
        error: 'Topic ID, type, and content are required' 
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

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('cards')
      .insert([{
        topic_id: topicId,
        type,
        content,
        sources: sources || null,
        author_id: authorId,
        author_name: finalAuthorName
      }])
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