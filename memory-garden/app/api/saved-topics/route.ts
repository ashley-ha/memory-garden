import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { topicId, userSession } = await request.json()

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_topics')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('topic_id', topicId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Topic already saved' }, { status: 400 })
    }

    // Save the topic
    const { data, error } = await supabase
      .from('saved_topics')
      .insert({
        user_id: session.user.id,
        topic_id: topicId
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving topic:', error)
      return NextResponse.json({ error: 'Failed to save topic' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in saved-topics POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { topicId } = await request.json()

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Remove the saved topic
    const { error } = await supabase
      .from('saved_topics')
      .delete()
      .eq('user_id', session.user.id)
      .eq('topic_id', topicId)

    if (error) {
      console.error('Error removing saved topic:', error)
      return NextResponse.json({ error: 'Failed to remove saved topic' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in saved-topics DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all saved topic IDs for the user
    const { data, error } = await supabase
      .from('saved_topics')
      .select('topic_id')
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Error fetching saved topics:', error)
      return NextResponse.json({ error: 'Failed to fetch saved topics' }, { status: 500 })
    }

    const topicIds = data?.map(item => item.topic_id) || []
    return NextResponse.json({ topicIds })
  } catch (error) {
    console.error('Error in saved-topics GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}