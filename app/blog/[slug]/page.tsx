import { postsApi, blocksApi, usersApi } from '@/lib/api'
import { SEOHelper, injectJsonLd } from '@/lib/seo'
import { AuthService } from '@/lib/auth'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlockRenderer from '@/components/BlockRenderer'
import FeaturedCourses from '@/components/FeaturedCourses'
import { cookies, headers } from 'next/headers'
import { getCategoriesWithCounts } from '@/lib/categories'

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

// Force dynamic rendering (no static generation at build time)
export const dynamic = 'force-dynamic'

// Generate static paths for published posts (optional, for better performance)
export async function generateStaticParams() {
  // Return empty array so build doesn't try to query DB
  // Pages will be generated on-demand at runtime
  return []
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

    // Get all published posts for suggested blogs (excluding current post)
    const allPosts = await postsApi.getAll()
    const publishedPosts = allPosts
      .filter(p => p.status === 'published' && p.id !== post.id)
      .sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at)
        const dateB = new Date(b.published_at || b.created_at)
        return dateB.getTime() - dateA.getTime()
      })

    // Get categories with counts
    const categories = await getCategoriesWithCounts()

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
            className="blog-header -mt-20"
            style={{
              backgroundImage: `url(${post.featured_image || 'https://res.cloudinary.com/drgot7znf/image/upload/v1759752597/blog_image_a2jalg.jpg'})`
            }}
            >
       

            {/* Dark overlay for better text contrast */}
            <div className="blog-header__overlay"></div>

            {/* Content positioned in bottom-left */}
            <div className="blog-header__content">
              <div className="blog-header__container">
              <div className="blog-header__inner">
                {/* Category Tag */}
                {/* Visible Breadcrumbs (also shown at top) - placed above the title */}
                <nav aria-label="Breadcrumb" className="breadcrumb">
                <ol>
                  <li>
                  <a href="/" aria-label="Home link">Home</a>
                  </li>
                  <li>
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  </li>
                  <li>
                  <a href="/blog">Blog</a>
                  </li>
                  <li>
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  </li>
                  <li style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {post.title}
                  </li>
                </ol>
                </nav>

                {/* Category Tag */}
                {post.category && (
                <div style={{ marginBottom: 12, marginTop: 8 }}>
                <span className="category-tag">
                  {post.category.name}
                </span>
                </div>
                )}

                {/* Post Title */}
                <h1 className="post-title">
                {post.title}
                </h1>

                {/* Post Meta Information */}
                <div className="post-meta">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>By {author?.name || 'Unknown Author'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <time dateTime={(post.published_at || post.created_at) ? (post.published_at || post.created_at).toString() : undefined}>
                  {formatDate(post.published_at || post.created_at)}
                  </time>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{SEOHelper.calculateReadingTime(contentText)} min read</span>
                </div>
                </div>

                {/* Post Excerpt */}
                {post.excerpt && (
                <p className="post-excerpt">
                  {post.excerpt.length > 280 ? `${post.excerpt.substring(0, 280)}...` : post.excerpt}
                </p>
                )}
              </div>
              </div>
            </div>

            {/* top breadcrumb removed - using breadcrumb above title inside overlay */}
            </header>
             {/* hero section end */}


          {/* Article Content - Two Column Layout */}
          <div className="py-6">
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
                        {categories.map((category) => (
                          <a key={category.id} href={`/blog?category=${category.slug}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                            <span className="text-gray-700 group-hover:text-blue-600">{category.name}</span>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{category._count?.posts || 0}</span>
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
                          <button className="w-full bg-[#045D5E] text-white px-4 py-2 rounded-lg hover:bg-[#034B4C] transition-colors text-sm font-medium">
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

          {/* Article Footer - Suggested Posts */}
          <footer className="bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Suggested Posts Section */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                  Suggested Blogs
                </h2>
                
                {/* Horizontal Scroll Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {publishedPosts && publishedPosts.slice(0, 4).map((suggestedPost) => (
                    <article 
                      key={suggestedPost.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      {/* Featured Image */}
                      <div className="h-40 bg-gray-200 overflow-hidden">
                        <img
                          src={suggestedPost.featured_image || 'https://res.cloudinary.com/drgot7znf/image/upload/v1759752597/blog_image_a2jalg.jpg'}
                          alt={suggestedPost.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="p-5">
                        {/* Category (left-aligned row) */}
                        {suggestedPost.category && (
                          <div className="mb-2 text-left">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FC7300] text-white">
                              {suggestedPost.category.name}
                            </span>
                          </div>
                        )}

                        {/* Post Title */}
                        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                          <a 
                            href={`/blog/${suggestedPost.slug}`}
                            className="hover:text-[#045D5E] transition-colors"
                          >
                            {suggestedPost.title}
                          </a>
                        </h3>

                        {/* Post Excerpt */}
                        <p className="text-[#000000] text-sm mb-2 line-clamp-2">
                          {suggestedPost.excerpt && suggestedPost.excerpt.length > 100 
                            ? `${suggestedPost.excerpt.substring(0, 100)}...` 
                            : suggestedPost.excerpt}
                        </p>

                        {/* Post Date (under excerpt, left-aligned) */}
                        {(suggestedPost.published_at || suggestedPost.created_at) && (
                          <div className="text-xs text-gray-500 mb-3">
                            <time dateTime={(suggestedPost.published_at || suggestedPost.created_at) ? (suggestedPost.published_at || suggestedPost.created_at).toString() : undefined}>
                              {formatDate(suggestedPost.published_at || suggestedPost.created_at)}
                            </time>
                          </div>
                        )}

                        {/* Read More Link */}
                        <a 
                          href={`/blog/${suggestedPost.slug}`}
                          className="inline-flex items-center text-[#045D5E] hover:text-[#034B4C] font-medium text-sm transition-colors"
                        >
                          Read more
                          <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>

                {/* View More Button */}
                <div className="flex justify-center pt-4">
                  <a
                    href="/blog"
                    className="inline-flex items-center px-8 py-3 bg-[#045D5E] text-white font-medium rounded-lg hover:bg-[#034B4C] transition-colors"
                  >
                    View More Blogs
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </footer>
          </article>
        </div>
             <style>{`
              .blog-header {
              position: relative;
              width: 100%;
              overflow: hidden;
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
              min-height: 400px;
              height: auto;
              padding-bottom: 2rem;
              display: flex;
              align-items: flex-end;
              }

              @media (min-width: 640px) {
              .blog-header { min-height: 450px; }
              }
              @media (min-width: 768px) {
              .blog-header { min-height: 500px; }
              }
              @media (min-width: 1024px) {
              .blog-header { min-height: 550px; }
              }

              .blog-header__overlay {
              position: absolute;
              inset: 0;
              background: rgba(0,0,0,0.6);
              }

              .blog-header__content {
              position: relative;
              z-index: 10;
              padding: 24px;
              width: 100%;
              padding-top: 80px;
              padding-bottom: 40px;
              }

              @media (min-width: 768px) {
              .blog-header__content {
                padding: 32px 48px 48px;
                padding-top: 100px;
              }
              }

              .blog-header__container {
              max-width: 1120px;
              margin: 0 auto;
              width: 100%;
              }

              .blog-header__inner {
              max-width: 640px;
              color: #fff;
              }

              .breadcrumb {
              margin-bottom: 1rem;
              padding-top: 5rem; 
              @media (min-width: 640px) { padding-top: 0; }
              }

              .breadcrumb ol {
              display: flex;
              gap: 8px;
              align-items: center;
              font-size: 14px;
              color: #e5e7eb; /* gray-200 */
              }

              .breadcrumb a {
              color: inherit;
              text-decoration: none;
              }

              .breadcrumb svg {
              width: 16px;
              height: 16px;
              color: #9ca3af; /* gray-400 */
              }

              .category-tag {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 9999px;
              font-size: 14px;
              font-weight: 500;
              color: #fff;
              background: #EF623C;
              margin-bottom: 12px;
              }

              .post-title {
              margin: 0 0 12px 0;
              font-weight: 700;
              line-height: 1.15;
              font-size: 28px;
              word-wrap: break-word;
              overflow-wrap: break-word;
              }

              @media (min-width: 640px) {
              .post-title { font-size: 32px; }
              }
              @media (min-width: 768px) {
              .post-title { font-size: 36px; line-height: 1.1; }
              }
              @media (min-width: 1024px) {
              .post-title { font-size: 42px; }
              }

              .post-meta {
              display: flex;
              flex-wrap: wrap;
              gap: 18px;
              align-items: center;
              color: #e5e7eb;
              font-size: 14px;
              margin-bottom: 12px;
              }

              .post-meta svg {
              width: 16px;
              height: 16px;
              margin-right: 6px;
              vertical-align: text-bottom;
              }

              .post-excerpt {
              margin-top: 6px;
              color: #f3f4f6; /* gray-100 */
              font-size: 16px;
              line-height: 1.6;
              word-wrap: break-word;
              overflow-wrap: break-word;
              }
              
              @media (min-width: 768px) {
              .post-excerpt { font-size: 16px; }
              }
            `}</style>
      </>
    )
  } catch (error) {
    console.error('Error loading blog post:', error)
    notFound()
  } 
}