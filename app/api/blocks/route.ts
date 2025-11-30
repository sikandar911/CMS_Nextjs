import { NextRequest, NextResponse } from 'next/server'
import { blocksApi } from '@/lib/api'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    let blocks
    if (postId) {
      blocks = await blocksApi.getByPostId(parseInt(postId))
    } else {
      blocks = await blocksApi.getAll()
    }

    return NextResponse.json({ blocks })
  } catch (error) {
    console.error('Error fetching blocks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blocks' },
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
    const newBlock = await blocksApi.create(body)

    return NextResponse.json({ block: newBlock }, { status: 201 })
  } catch (error) {
    console.error('Error creating block:', error)
    return NextResponse.json(
      { error: 'Failed to create block' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { blocks } = body

    if (Array.isArray(blocks)) {
      // Batch update blocks
      const updatedBlocks = await blocksApi.updateMany(blocks)
      return NextResponse.json({ blocks: updatedBlocks })
    } else {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating blocks:', error)
    return NextResponse.json(
      { error: 'Failed to update blocks' },
      { status: 500 }
    )
  }
}