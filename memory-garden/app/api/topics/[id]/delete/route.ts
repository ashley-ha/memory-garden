import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    
    const session = await getServerSession(authOptions)
    const { id: topicId } = await params
    
    if (!topicId) {
      return NextResponse.json({ 
        error: 'Topic ID is required' 
      }, { status: 400 })
    }

    let userId = null
    if (session?.user?.id) {
      userId = session.user.id
    } else {
      // For anonymous users, get their session ID from localStorage on client
      // We can't access localStorage on server, so we'll get it from request
      const body = await request.json()
      userId = body.userSession || 'anonymous'
    }


    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, mock delete successful')
      return NextResponse.json({ success: true })
    }

    const supabase = await createClient()
    
    // First check if the topic exists and get its author info
    const { data: topic, error: fetchError } = await supabase
      .from('topics')
      .select('author_id, author_name')
      .eq('id', topicId)
      .single()

    if (fetchError || !topic) {
      return NextResponse.json({ 
        error: 'Topic not found' 
      }, { status: 404 })
    }

    // Check if user is the author using author_id
    if (topic.author_id !== userId) {
      return NextResponse.json({ 
        error: 'You can only delete your own topics' 
      }, { status: 403 })
    }

    // Delete the topic (this will cascade delete related cards due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('topics')
      .delete()
      .eq('id', topicId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to process delete request' }, { status: 500 })
  }
}