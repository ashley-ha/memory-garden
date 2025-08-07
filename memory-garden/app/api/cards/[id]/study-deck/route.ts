import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const cardId = resolvedParams.id
    const body = await request.json()
    const { inStudyDeck } = body

    const supabase = await createClient()

    // Toggle the in_study_deck status
    const { data, error } = await supabase
      .from('cards')
      .update({ in_study_deck: inStudyDeck })
      .eq('id', cardId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to update study deck status:', error)
    return NextResponse.json(
      { error: 'Failed to update study deck status' },
      { status: 500 }
    )
  }
}