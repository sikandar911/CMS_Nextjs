import { postsApi, blocksApi, usersApi } from '@/lib/api'
import { SEOHelper, injectJsonLd } from '@/lib/seo'
import { AuthService } from '@/lib/auth'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlockRenderer from '@/components/BlockRenderer'
import Navigation from '@/components/Navigation'
import FeaturedCourses from '@/components/FeaturedCourses'
import { cookies, headers } from 'next/headers'
import { getCategories } from '@/lib/categories'

interface PageProps {
  params: {
    slug: string
  }
  searchParams?: {
    preview?: string
    token?: string
  }
}

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

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  try {
    const post = await postsApi.getBySlug(params.slug)
    
    // Check if this is a preview request
    const isPreview = searchParams?.preview === 'true'
    
    if (!post || (post.status !== 'published' && !isPreview)) {
      return {
        title: 'Post Not Found',
        description: 'The requested blog post could not be found.'
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'
    const postUrl = `${baseUrl}/blog/${post.slug}`

    return {
      title: post.meta_title || post.title,
      description: (post.meta_description ?? post.excerpt) || undefined,
      openGraph: {
        title: post.meta_title || post.title,
        description: (post.meta_description ?? post.excerpt) || undefined,
        type: 'article',
        url: postUrl,
        publishedTime: post.published_at ? (post.published_at as Date).toISOString() : undefined,
        modifiedTime: post.updated_at ? (post.updated_at as Date).toISOString() : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.meta_title || post.title,
        description: (post.meta_description ?? post.excerpt) || undefined,
      },
      alternates: {
        canonical: postUrl,
      },
    }
  } catch (error) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.'
    }
  }
}

// Generate static paths for published posts (optional, for better performance)
export async function generateStaticParams() {
  try {
    const posts = await postsApi.getAll()
    const publishedPosts = posts.filter(post => post.status === 'published')
    
    return publishedPosts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function BlogPostPage({ params, searchParams }: PageProps) {
  const isPreview = searchParams?.preview === 'true'
  const previewToken = searchParams?.token

  try {
    // Get the post
    const post = await postsApi.getBySlug(params.slug)
    
    if (!post) {
      notFound()
    }

    // Check if post is published or if it's a valid preview
    if (post.status !== 'published') {
      if (!isPreview || !previewToken) {
        notFound()
      }
      
      // Verify preview token
      const user = AuthService.verifyToken(previewToken)
      if (!user) {
        notFound()
      }
    }

    // Get post blocks
    const blocks = await blocksApi.getByPostId(post.id)
    
    // Get author information - post already contains author details
  const author = post.author ? { name: (post.author as any).display_name || (post.author as any).name } : null

    // Calculate content for reading time
    const contentText = blocks.map(block => {
      const content = block.content as any
      if (block.type === 'paragraph' || block.type === 'title') {
        if (content && typeof content === 'object') {
          return content.text || (content.html ? String(content.html).replace(/<[^>]*>/g, '') : '')
        }
        return content ? String(content) : ''
      }
      if (block.type === 'accordion' && content && typeof content === 'object') {
        return content.sections?.map((s: any) => `${s.title} ${s.content}`).join(' ') || ''
      }
      if (block.type === 'tabs' && content && typeof content === 'object') {
        return content.tabs?.map((t: any) => `${t.title} ${t.content}`).join(' ') || ''
      }
      return ''
    }).join(' ')

    // Generate JSON-LD schema
    const jsonLd = SEOHelper.generateBlogPostSchema({ ...(post as any), author } as any, undefined, blocks)

    // Generate breadcrumb schema
    const breadcrumbSchema = SEOHelper.generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Blog', url: '/blog' },
      { name: post.title, url: `/blog/${post.slug}` }
    ])

    return (
      <>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: injectJsonLd(jsonLd)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: injectJsonLd(breadcrumbSchema)
          }}
        />

        <div className="min-h-screen bg-white">
          <Navigation />
          <article className="relative">
            {/* Preview Banner */}
            {isPreview && (
            <div className="bg-yellow-50 border-b border-yellow-200">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-yellow-800 font-medium">
                    Preview Mode - This post is not yet published
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Hero Section with Featured Image Background */}
          <header
            className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat h-auto sm:h-[70vh] min-h-0 sm:min-h-[300px] pb-8"
            style={{
              backgroundImage: `url(${post.featured_image || 'https://res.cloudinary.com/drgot7znf/image/upload/v1759752597/blog_image_a2jalg.jpg'})`
            }}
          >
            {/* Dark overlay for better text contrast */}
            <div className="absolute inset-0 bg-black/60"></div>

            {/* Content positioned in bottom-left */}
            <div className="relative lg:right-0 p-6 md:p-12 lg:p-16 pb-12 md:pb-16 z-10">
              <div className="max-w-7xl mx-auto pt-12 sm:pt-[10vh]">
                <div className="max-w-2xl ">
                  {/* Category Tag */}
                  {/* Visible Breadcrumbs (also shown at top) - placed above the title */}
                  <nav aria-label="Breadcrumb" className="mb-4">
                    <ol className="flex items-center space-x-2 text-sm text-gray-200">
                      <li>
                        <a href="/" className="hover:text-white transition-colors">
                          Home
                        </a>
                      </li>
                      <li>
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </li>
                      <li>
                        <a href="/blog" className="hover:text-white transition-colors">
                          Blog
                        </a>
                      </li>
                      <li>
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </li>
                      <li className="text-gray-200 font-medium truncate ">
                        {post.title}
                      </li>
                    </ol>
                  </nav>

                  {/* Category Tag */}
                  <div className="mb-4">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white z-10"
                      style={{ backgroundColor: '#EF623C' }}
                    >
                      {post.category}
                    </span>
                  </div>

                  {/* Post Title */}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    {post.title}
                  </h1>

                  {/* Post Meta Information */}
                  <div className="flex flex-wrap items-center text-gray-200 text-sm space-x-6 mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>By {author?.name || 'Unknown Author'}</span>
                    </div>

                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <time dateTime={(post.published_at || post.created_at) ? (post.published_at || post.created_at).toString() : undefined}>
                        {formatDate(post.published_at || post.created_at)}
                      </time>
                    </div>

                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{SEOHelper.calculateReadingTime(contentText)} min read</span>
                    </div>
                  </div>

                  {/* Post Excerpt */}
                  {post.excerpt && (
                    <p className="text-lg md:text-xl text-gray-100 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* top breadcrumb removed - using breadcrumb above title inside overlay */}
          </header>
             {/* hero section end */}


          {/* Article Content - Two Column Layout */}
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content - 70% width */}
                <main className="lg:col-span-8">
                  <div className="prose prose-lg prose-blue max-w-none">
                    <BlockRenderer blocks={blocks.map(block => ({
                      ...block,
                      order: block.index
                    }))} />
                  </div>
                </main>

                {/* Sidebar - 30% width */}
                <aside className="lg:col-span-4">
                  <div className="sticky top-8 space-y-8">
                        {/* Course Cards Section */}
                        <FeaturedCourses />

                    {/* Categories List */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Blog Categories
                      </h3>
                      <div className="space-y-2">
                        {/* Use canonical categories - counts are placeholders (0) until we implement counts */}
                        {getCategories().map((c) => (
                          <a key={c} href={`/blog?category=${encodeURIComponent(c)}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                            <span className="text-gray-700 group-hover:text-blue-600">{c}</span>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">0</span>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Newsletter Signup */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg p-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Stay Updated
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Get the latest articles and university updates delivered to your inbox.
                        </p>
                        <div className="space-y-3">
                          <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            Subscribe Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>

          {/* Article Footer */}
          <footer className="bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Author Bio */}
              {author && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-xl">
                          {author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {author.name}
                      </h3>
                      <p className="text-gray-600">
                        Author
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation to other posts */}
              <div className="mt-12 pt-12 border-t border-gray-200">
                <div className="flex justify-center">
                  <a
                    href="/blog"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Blog
                  </a>
                </div>
              </div>
            </div>
          </footer>
          </article>
        </div>
      </>
    )
  } catch (error) {
    console.error('Error loading blog post:', error)
    notFound()
  }
}