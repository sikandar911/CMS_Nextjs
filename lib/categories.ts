import { prisma } from './prisma'

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  created_at: Date
  updated_at: Date
}

export interface CategoryWithCount extends Category {
  _count?: {
    posts: number
  }
}

// Get all categories from database
export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// Get categories with post counts
export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  try {
    const categories = await prisma.category.findMany({
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
    return categories
  } catch (error) {
    console.error('Error fetching categories with counts:', error)
    return []
  }
}

// Get category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug }
    })
    return category
  } catch (error) {
    console.error('Error fetching category by slug:', error)
    return null
  }
}

// Get category by ID
export async function getCategoryById(id: number): Promise<Category | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { id }
    })
    return category
  } catch (error) {
    console.error('Error fetching category by ID:', error)
    return null
  }
}
