import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username } = await request.json()
    
    if (!username || username.length < 3) {
      return NextResponse.json({ 
        error: 'Username must be at least 3 characters' 
      }, { status: 400 })
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, mock profile created')
      return NextResponse.json({ 
        success: true,
        profile: {
          user_id: session.user.id,
          username,
          email: session.user.email,
          image_url: session.user.image
        }
      })
    }

    const supabase = await createClient()
    
    // Check if username is available
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existing) {
      return NextResponse.json({ 
        error: 'Username is already taken' 
      }, { status: 400 })
    }

    // Create profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: session.user.id,
        username,
        email: session.user.email,
        image_url: session.user.image
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'Username is already taken' 
        }, { status: 400 })
      }
      return NextResponse.json({ 
        error: 'Failed to create profile' 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ profile: null })
    }

    const supabase = await createClient()
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}