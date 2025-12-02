import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Try to get Prisma client
    const { prisma } = await import('@/lib/prisma')
    
    if (!prisma) {
      return NextResponse.json({ error: 'Prisma not initialized' }, { status: 500 })
    }

    // Check if the client has the post method
    if (!prisma.post) {
      return NextResponse.json({ 
        error: 'Prisma post model not available',
        prismaKeys: Object.keys(prisma)
      }, { status: 500 })
    }

    // Try to fetch posts
    const posts = await prisma.post.findMany({
      take: 5,
    })

    return NextResponse.json({
      success: true,
      count: posts.length,
      posts: posts,
      prismaMethods: Object.keys(prisma).slice(0, 20)
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error?.message || 'Unknown error',
      details: error?.toString(),
    }, { status: 500 })
  }
}
