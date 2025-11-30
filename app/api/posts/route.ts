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
    console.log('POST /api/posts - Token payload:', JSON.stringify(user))
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token. Please log in again.' },
        { status: 401 }
      )
    }
    
    // Allow both admin and editor roles to create posts
    if (!['admin', 'editor'].includes(user.role)) {
      return NextResponse.json(
        { error: `Access denied. Your role "${user.role}" cannot create posts. Admin or editor role required.` },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('POST /api/posts - Request body:', JSON.stringify(body))
    
    // Transform the request body to match Prisma schema
    const postData: any = {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || null,
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
      status: body.status || 'draft',
      tags: body.tags || [],
      category: body.category || null,
      canonical_url: body.canonical_url || null,
      featured_image: body.featured_image || null,
      featured_image_id: body.featured_image_id || null,
      language: body.language || 'en',
      // Handle author - could be nested object or just author_id
      author_id: body.author_id || body.author?.id || user.userId,
      published_at: body.published_at ? new Date(body.published_at) : null,
      active: body.active ?? 1,
    }
    
    console.log('POST /api/posts - Transformed data:', JSON.stringify(postData))
    
    try {
      const newPost = await postsApi.create(postData)
      return NextResponse.json({ post: newPost }, { status: 201 })
    } catch (dbError: any) {
      console.error('Database error creating post:', dbError)
      return NextResponse.json(
        { 
          error: 'Database error creating post', 
          details: dbError?.message || String(dbError),
          code: dbError?.code,
          meta: dbError?.meta
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}