import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  try {
    const { tag } = await request.json()
    
    if (!tag) {
      return NextResponse.json({ error: 'Tag is required' }, { status: 400 })
    }
    
    // Revalidate the cache for the specified tag
    revalidateTag(tag)
    
    return NextResponse.json({ revalidated: true, tag })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 })
  }
}