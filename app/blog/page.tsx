import { postsApi } from '@/lib/api'
import { SEOHelper } from '@/lib/seo'
import { Metadata } from 'next'
import Link from 'next/link'
import BlogPageClient from '@/components/BlogPageClient'
import { getCategories } from '@/lib/categories'

// Helper function to format dates
function formatDate(dateInput?: string | Date): string {
  if (!dateInput) return ''
  const date = new Date(dateInput as any)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const metadata: Metadata = {
  title: 'Blog | Your Site Name',
  description: 'Latest articles and insights from our blog',
  openGraph: {
    title: 'Blog | Your Site Name',
    description: 'Latest articles and insights from our blog',
    type: 'website',
  }
}

export default async function BlogPage() {
  // Get all published posts
  const allPosts = await postsApi.getAll()
  const publishedPosts = allPosts
    .filter(post => post.status === 'published')
    .sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at)
      const dateB = new Date(b.published_at || b.created_at)
      return dateB.getTime() - dateA.getTime()
    })

  // Get all categories
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Solid Color */}
      <section className="relative h-[350px] w-full bg-[#045B5C] overflow-hidden -mt-20">
        {/* Hero Content */}
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center relative z-10">
          <div className="w-full">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-white mb-4">
              Our Blog
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-0 max-w-3xl">
              Discover insights, tips, and stories from our team. Stay updated with the latest in education, technology, and innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts with Search and Filter */}
      <BlogPageClient posts={publishedPosts} categories={categories} />
    </div>
  )
}