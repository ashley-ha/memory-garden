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
    const { id: cardId } = await params
    
    if (!cardId) {
      return NextResponse.json({ 
        error: 'Card ID is required' 
      }, { status: 400 })
    }

    let userId = null
    if (session?.user?.id) {
      userId = session.user.id
    } else {
      // For anonymous users, get their session ID from request
      const body = await request.json()
      userId = body.userSession || 'anonymous'
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, mock delete successful')
      return NextResponse.json({ success: true })
    }

    const supabase = await createClient()
    
    // First check if the card exists and get its author info
    const { data: card, error: fetchError } = await supabase
      .from('cards')
      .select('author_id, author_name')
      .eq('id', cardId)
      .single()

    if (fetchError || !card) {
      return NextResponse.json({ 
        error: 'Card not found' 
      }, { status: 404 })
    }

    // Check if user is the author using author_id
    if (card.author_id !== userId) {
      return NextResponse.json({ 
        error: 'You can only delete your own cards' 
      }, { status: 403 })
    }

    // Delete the card
    const { error: deleteError } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to process delete request' }, { status: 500 })
  }
}