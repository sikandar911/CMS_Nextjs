import fs from 'fs'
import path from 'path'

// Data file paths
const DATA_DIR = path.join(process.cwd(), 'data')
const POSTS_FILE = path.join(DATA_DIR, 'posts.json')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const BLOCKS_FILE = path.join(DATA_DIR, 'post_blocks.json')
const MEDIA_FILE = path.join(DATA_DIR, 'media.json')
const REVISIONS_FILE = path.join(DATA_DIR, 'post_revisions.json')

// Type definitions
export interface User {
  id: number
  email: string
  display_name: string
  password: string
  role: 'admin' | 'editor'
  created_at: string
}

export interface Post {
  id: number
  slug: string
  title: string
  excerpt: string
  tags: string[]
  category: string
  status: 'draft' | 'published' | 'archived'
  author: {
    id: number
    name: string
  }
  canonical_url: string
  published_at: string | null
  meta_title: string
  meta_description: string
  featured_image_id: number | null
  language: string
  created_at: string
  updated_at: string
  active: number
}

export interface PostBlock {
  id: string
  post_id: number
  index: number
  type: 'title' | 'paragraph' | 'accordion' | 'tabs' | 'card' | 'button' | 'image' | 'html' | 'embed' | 'gallery'
  content: any
  settings: any
  created_by: number
  updated_by: number
  created_at: string
  updated_at: string
}

export interface Media {
  id: number
  filename: string
  alt_text: string
  url: string
  width: number
  height: number
  size: number
  uploaded_by: number
  created_at: string
}

export interface PostRevision {
  id: number
  post_id: number
  revision_number: number
  author_id: number
  data_snapshot: any
  created_at: string
}

// Helper functions to read JSON files
function readJsonFile<T>(filePath: string): T {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContents)
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    throw new Error(`Failed to read ${filePath}`)
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error)
    throw new Error(`Failed to write ${filePath}`)
  }
}

// Posts API
export const postsApi = {
  getAll: (): Post[] => {
    const data = readJsonFile<{ posts: Post[] }>(POSTS_FILE)
    return data.posts
  },

  getBySlug: (slug: string): Post | null => {
    const posts = postsApi.getAll()
    const matchingPosts = posts.filter(post => post.slug === slug)
    
    if (matchingPosts.length === 0) {
      return null
    }
    
    // Prioritize published posts over drafts
    const publishedPost = matchingPosts.find(post => post.status === 'published')
    if (publishedPost) {
      return publishedPost
    }
    
    // If no published post, return the first match
    return matchingPosts[0]
  },

  getById: (id: number): Post | null => {
    const posts = postsApi.getAll()
    return posts.find(post => post.id === id) || null
  },

  getPublished: (): Post[] => {
    const posts = postsApi.getAll()
    return posts.filter(post => post.status === 'published' && post.active === 1)
  },

  getDrafts: (): Post[] => {
    const posts = postsApi.getAll()
    return posts.filter(post => post.status === 'draft' && post.active === 1)
  },

  create: (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Post => {
    const data = readJsonFile<{ posts: Post[] }>(POSTS_FILE)
    const newId = Math.max(...data.posts.map(p => p.id), 0) + 1
    const now = new Date().toISOString()
    
    const newPost: Post = {
      id: newId,
      created_at: now,
      updated_at: now,
      ...post
    }
    
    data.posts.push(newPost)
    writeJsonFile(POSTS_FILE, data)
    return newPost
  },

  update: (id: number, updates: Partial<Post>): Post | null => {
    const data = readJsonFile<{ posts: Post[] }>(POSTS_FILE)
    const index = data.posts.findIndex(post => post.id === id)
    
    if (index === -1) return null
    
    data.posts[index] = {
      ...data.posts[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    writeJsonFile(POSTS_FILE, data)
    return data.posts[index]
  },

  delete: (id: number): boolean => {
    const data = readJsonFile<{ posts: Post[] }>(POSTS_FILE)
    const index = data.posts.findIndex(post => post.id === id)
    
    if (index === -1) return false
    
    data.posts.splice(index, 1)
    writeJsonFile(POSTS_FILE, data)
    return true
  }
}

// Blocks API
export const blocksApi = {
  getByPostId: (postId: number): PostBlock[] => {
    const data = readJsonFile<{ post_blocks: PostBlock[] }>(BLOCKS_FILE)
    return data.post_blocks
      .filter(block => block.post_id === postId)
      .sort((a, b) => a.index - b.index)
  },

  create: (block: Omit<PostBlock, 'created_at' | 'updated_at'>): PostBlock => {
    const data = readJsonFile<{ post_blocks: PostBlock[] }>(BLOCKS_FILE)
    const now = new Date().toISOString()
    
    const newBlock: PostBlock = {
      ...block,
      created_at: now,
      updated_at: now
    }
    
    data.post_blocks.push(newBlock)
    writeJsonFile(BLOCKS_FILE, data)
    return newBlock
  },

  update: (id: string, updates: Partial<PostBlock>): PostBlock | null => {
    const data = readJsonFile<{ post_blocks: PostBlock[] }>(BLOCKS_FILE)
    const index = data.post_blocks.findIndex(block => block.id === id)
    
    if (index === -1) return null
    
    data.post_blocks[index] = {
      ...data.post_blocks[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    writeJsonFile(BLOCKS_FILE, data)
    return data.post_blocks[index]
  },

  delete: (id: string): boolean => {
    const data = readJsonFile<{ post_blocks: PostBlock[] }>(BLOCKS_FILE)
    const index = data.post_blocks.findIndex(block => block.id === id)
    
    if (index === -1) return false
    
    data.post_blocks.splice(index, 1)
    writeJsonFile(BLOCKS_FILE, data)
    return true
  },

  reorder: (postId: number, blockIds: string[]): void => {
    const data = readJsonFile<{ post_blocks: PostBlock[] }>(BLOCKS_FILE)
    
    blockIds.forEach((id, newIndex) => {
      const blockIndex = data.post_blocks.findIndex(block => block.id === id && block.post_id === postId)
      if (blockIndex !== -1) {
        data.post_blocks[blockIndex].index = newIndex
        data.post_blocks[blockIndex].updated_at = new Date().toISOString()
      }
    })
    
    writeJsonFile(BLOCKS_FILE, data)
  },

  updateMany: (blocks: Partial<PostBlock>[]): PostBlock[] => {
    const data = readJsonFile<{ post_blocks: PostBlock[] }>(BLOCKS_FILE)
    const updatedBlocks: PostBlock[] = []
    const now = new Date().toISOString()
    
    blocks.forEach(blockUpdate => {
      if (blockUpdate.id) {
        // Try to update existing block
        const index = data.post_blocks.findIndex(block => block.id === blockUpdate.id)
        if (index !== -1) {
          data.post_blocks[index] = {
            ...data.post_blocks[index],
            ...blockUpdate,
            updated_at: now
          }
          updatedBlocks.push(data.post_blocks[index])
        } else {
          // Block doesn't exist, create it
          const newBlock: PostBlock = {
            id: blockUpdate.id,
            post_id: blockUpdate.post_id || 0,
            type: blockUpdate.type || 'paragraph',
            content: blockUpdate.content || {},
            settings: blockUpdate.settings || {},
            index: blockUpdate.index || 0,
            created_by: blockUpdate.created_by || 1,
            updated_by: blockUpdate.updated_by || 1,
            created_at: now,
            updated_at: now
          }
          data.post_blocks.push(newBlock)
          updatedBlocks.push(newBlock)
        }
      } else {
        // Create new block without ID
        const maxId = Math.max(...data.post_blocks.map(block => parseInt(block.id)), 0)
        const newBlock: PostBlock = {
          id: (maxId + 1).toString(),
          post_id: blockUpdate.post_id || 0,
          type: blockUpdate.type || 'paragraph',
          content: blockUpdate.content || {},
          settings: blockUpdate.settings || {},
          index: blockUpdate.index || 0,
          created_by: blockUpdate.created_by || 1,
          updated_by: blockUpdate.updated_by || 1,
          created_at: now,
          updated_at: now
        }
        data.post_blocks.push(newBlock)
        updatedBlocks.push(newBlock)
      }
    })
    
    writeJsonFile(BLOCKS_FILE, data)
    return updatedBlocks
  }
}

// Users API
export const usersApi = {
  getAll: (): User[] => {
    const data = readJsonFile<{ users: User[] }>(USERS_FILE)
    return data.users
  },

  getByEmail: (email: string): User | null => {
    const users = usersApi.getAll()
    return users.find(user => user.email === email) || null
  },

  getById: (id: number): User | null => {
    const users = usersApi.getAll()
    return users.find(user => user.id === id) || null
  }
}

// Media API
export const mediaApi = {
  getAll: (): Media[] => {
    const data = readJsonFile<{ media: Media[] }>(MEDIA_FILE)
    return data.media
  },

  getById: (id: number): Media | null => {
    const media = mediaApi.getAll()
    return media.find(item => item.id === id) || null
  }
}

// Revisions API
export const revisionsApi = {
  getByPostId: (postId: number): PostRevision[] => {
    const data = readJsonFile<{ post_revisions: PostRevision[] }>(REVISIONS_FILE)
    return data.post_revisions
      .filter(revision => revision.post_id === postId)
      .sort((a, b) => b.revision_number - a.revision_number)
  },

  create: (revision: Omit<PostRevision, 'id' | 'created_at'>): PostRevision => {
    const data = readJsonFile<{ post_revisions: PostRevision[] }>(REVISIONS_FILE)
    const newId = Math.max(...data.post_revisions.map(r => r.id), 0) + 1
    
    const newRevision: PostRevision = {
      id: newId,
      created_at: new Date().toISOString(),
      ...revision
    }
    
    data.post_revisions.push(newRevision)
    writeJsonFile(REVISIONS_FILE, data)
    return newRevision
  }
}