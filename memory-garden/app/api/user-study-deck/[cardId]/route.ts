import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// DELETE /api/user-study-deck/[cardId] - Remove card from user's study deck
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Verify the requested userId matches the authenticated user (if provided)
    if (userId && userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const authenticatedUserId = session.user.id

    const resolvedParams = await params
    const supabase = await createClient()
    const { error } = await supabase
      .from('user_study_decks')
      .delete()
      .eq('user_id', authenticatedUserId)
      .eq('card_id', resolvedParams.cardId)

    if (error) {
      console.error('Error removing card from study deck:', error)
      return NextResponse.json({ error: 'Failed to remove card from study deck' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/user-study-deck:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}