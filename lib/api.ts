import { prisma } from './prisma'
import type { Post, User, PostBlock, PostRevision } from '@prisma/client'

// Extended types for API responses (including relations)
export interface PostWithAuthor extends Post {
  author: {
    id: number
    display_name: string | null
  }
  category?: {
    id: number
    name: string
    slug: string
  } | null
}

export interface PostWithAuthorAndBlocks extends PostWithAuthor {
  blocks: PostBlock[]
}

// Re-export Prisma types
export type { User, Post, PostBlock, PostRevision }

// Posts API
export const postsApi = {
  getAll: async (): Promise<PostWithAuthor[]> => {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
    return posts
  },

  getBySlug: async (slug: string): Promise<PostWithAuthor | null> => {
    // Use findFirst with proper ordering to get the most recent post
    const post = await prisma.post.findFirst({
      where: { 
        slug,
        active: 1 // Only active posts
      },
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { status: 'desc' }, // Published posts come first (alphabetically 'published' > 'draft')
        { updated_at: 'desc' } // Most recently updated first
      ]
    })
    
    return post
  },

  getById: async (id: number): Promise<PostWithAuthor | null> => {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })
    return post
  },

  getPublished: async (): Promise<PostWithAuthor[]> => {
    const posts = await prisma.post.findMany({
      where: {
        status: 'published',
        active: 1,
      },
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        published_at: 'desc',
      },
    })
    return posts
  },

  getDrafts: async (): Promise<PostWithAuthor[]> => {
    const posts = await prisma.post.findMany({
      where: {
        status: 'draft',
        active: 1,
      },
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    })
    return posts
  },

  create: async (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<PostWithAuthor> => {
    const newPost = await prisma.post.create({
      data: post,
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })
    return newPost
  },

  update: async (id: number, updates: Partial<Post>, authorId?: number): Promise<PostWithAuthor | null> => {
    try {
      // Get current revision number for this post
      const latestRevision = await prisma.postRevision.findFirst({
        where: { post_id: id },
        orderBy: { revision_number: 'desc' },
        select: { revision_number: true },
      })
      
      const nextRevisionNumber = (latestRevision?.revision_number || 0) + 1
      
      // Update the post and create revision in a transaction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await prisma.$transaction(async (tx: any) => {
        // Update the post
        const updatedPost = await tx.post.update({
          where: { id },
          data: updates,
          include: {
            author: {
              select: {
                id: true,
                display_name: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        })

        // Create revision record if authorId is provided
        if (authorId) {
          await tx.postRevision.create({
            data: {
              post_id: id,
              revision_number: nextRevisionNumber,
              author_id: authorId,
              edited_at: new Date(),
            } as any,
          })
        }

        return updatedPost
      })

      return result
    } catch (error) {
      console.error('Error updating post:', error)
      return null
    }
  },

  delete: async (id: number): Promise<boolean> => {
    try {
      await prisma.post.delete({
        where: { id },
      })
      return true
    } catch (error) {
      return false
    }
  }
}

// Blocks API
export const blocksApi = {
  getByPostId: async (postId: number): Promise<PostBlock[]> => {
    const blocks = await prisma.postBlock.findMany({
      where: { post_id: postId },
      orderBy: [
        { order: 'asc' },
        { index: 'asc' },
      ],
    })
    return blocks
  },

  // Return all blocks across posts
  getAll: async (): Promise<PostBlock[]> => {
    const blocks = await prisma.postBlock.findMany({
      orderBy: [
        { post_id: 'asc' },
        { order: 'asc' },
        { index: 'asc' },
      ],
    })
    return blocks
  },

  create: async (block: Omit<PostBlock, 'created_at' | 'updated_at'>): Promise<PostBlock> => {
    const newBlock = await prisma.postBlock.create({
      // cast to any to avoid strict Prisma Json typing issues when content can be null
      data: block as any,
    })
    return newBlock
  },

  update: async (id: string, updates: Partial<PostBlock>): Promise<PostBlock | null> => {
    try {
      const updatedBlock = await prisma.postBlock.update({
        where: { id },
        // cast updates to any to avoid strict typing mismatch when partial fields are provided
        data: updates as any,
      })
      return updatedBlock as any
    } catch (error) {
      return null
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await prisma.postBlock.delete({
        where: { id },
      })
      return true
    } catch (error) {
      return false
    }
  },

  reorder: async (postId: number, blockIds: string[]): Promise<void> => {
    // Use transaction to ensure all updates happen atomically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      const updates = blockIds.map((id, newIndex) => 
        tx.postBlock.updateMany({
          where: { 
            id,
            post_id: postId 
          },
          data: { 
            index: newIndex,
            order: newIndex,
          }
        })
      )
      await Promise.all(updates)
    })
  },

  updateMany: async (blocks: Partial<PostBlock>[]): Promise<PostBlock[]> => {
    const updatedBlocks: PostBlock[] = []
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      for (const blockUpdate of blocks) {
        if (blockUpdate.id) {
          // Try to update existing block
            try {
              const updatedBlock = await tx.postBlock.update({
                where: { id: blockUpdate.id },
                // cast to any to avoid strict Prisma Json typing issues
                data: blockUpdate as any,
              })
              updatedBlocks.push(updatedBlock)
          } catch (error) {
            // Block doesn't exist, create it
            const newBlock = await tx.postBlock.create({
              data: {
                id: blockUpdate.id,
                post_id: blockUpdate.post_id || 0,
                type: blockUpdate.type || 'paragraph',
                // cast content/settings to any to avoid Json/null typing issues
                content: blockUpdate.content as any,
                settings: blockUpdate.settings as any || {},
                index: blockUpdate.index || 0,
                order: blockUpdate.order || 0,
                created_by: blockUpdate.created_by || 1,
                updated_by: blockUpdate.updated_by || 1,
              } as any,
            })
            updatedBlocks.push(newBlock)
          }
        } else {
          // Create new block without ID - Prisma will generate UUID
          const newBlock = await tx.postBlock.create({
            data: {
              post_id: blockUpdate.post_id || 0,
              type: blockUpdate.type || 'paragraph',
              content: blockUpdate.content as any,
              settings: blockUpdate.settings as any || {},
              index: blockUpdate.index || 0,
              order: blockUpdate.order || 0,
              created_by: blockUpdate.created_by || 1,
              updated_by: blockUpdate.updated_by || 1,
            } as any,
          })
          updatedBlocks.push(newBlock)
        }
      }
    })
    
    return updatedBlocks
  }
}

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const users = await prisma.user.findMany({
      orderBy: {
        created_at: 'desc',
      },
    })
    return users
  },

  getByEmail: async (email: string): Promise<User | null> => {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    return user
  },

  getById: async (id: number): Promise<User | null> => {
    const user = await prisma.user.findUnique({
      where: { id },
    })
    return user
  },

  create: async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
    const newUser = await prisma.user.create({
      data: user,
    })
    return newUser
  },

  update: async (id: number, updates: Partial<User>): Promise<User | null> => {
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updates,
      })
      return updatedUser
    } catch (error) {
      return null
    }
  }
}

// Revisions API  
export const revisionsApi = {
  getByPostId: async (postId: number): Promise<PostRevision[]> => {
    const revisions = await prisma.postRevision.findMany({
      where: { post_id: postId },
      include: {
        author: {
          select: {
            id: true,
            display_name: true,
          },
        },
      },
      orderBy: {
        revision_number: 'desc',
      },
    })
    return revisions
  },

  create: async (postId: number, authorId: number): Promise<PostRevision> => {
    // Get next revision number
    const latestRevision = await prisma.postRevision.findFirst({
      where: { post_id: postId },
      orderBy: { revision_number: 'desc' },
      select: { revision_number: true },
    })
    
    const nextRevisionNumber = (latestRevision?.revision_number || 0) + 1
    
    const newRevision = await prisma.postRevision.create({
      data: {
        post_id: postId,
        revision_number: nextRevisionNumber,
        author_id: authorId,
        edited_at: new Date(),
      } as any,
    })
    return newRevision
  },

  getLatestRevisionNumber: async (postId: number): Promise<number> => {
    const latest = await prisma.postRevision.findFirst({
      where: { post_id: postId },
      orderBy: { revision_number: 'desc' },
      select: { revision_number: true },
    })
    return latest?.revision_number || 0
  },

  getRevisionCount: async (postId: number): Promise<number> => {
    const count = await prisma.postRevision.count({
      where: { post_id: postId },
    })
    return count
  }
}