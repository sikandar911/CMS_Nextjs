import { NextRequest, NextResponse } from 'next/server'
import { postsApi } from '@/lib/api'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined

    let posts
    if (status === 'draft') {
      posts = await postsApi.getDrafts()
    } else if (status === 'published') {
      posts = await postsApi.getPublished()
    } else if (status === 'archived') {
      const allPosts = await postsApi.getAll()
      posts = allPosts.filter(p => p.status === 'archived' && p.active === 1)
    } else {
      posts = await postsApi.getAll()
    }

    // Apply pagination if specified
    if (limit !== undefined) {
      const start = offset || 0
      posts = posts.slice(start, start + limit)
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const user = await AuthService.verifyToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const newPost = await postsApi.create(body)

    return NextResponse.json({ post: newPost }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}