import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/lib/auth'

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeCounts = searchParams.get('counts') === 'true'

    let categories
    if (includeCounts) {
      categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              posts: {
                where: {
                  status: 'published',
                  active: 1
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
    } else {
      categories = await prisma.category.findMany({
        orderBy: {
          name: 'asc'
        }
      })
    }

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST - Create new category (admin only)
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
    const { name, slug, description } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null
      }
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category with this name or slug already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
