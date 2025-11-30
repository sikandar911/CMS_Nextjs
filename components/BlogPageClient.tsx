'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
  published_at?: string
  category?: string
}

interface BlogPageClientProps {
  posts: Post[]
}

function formatDate(dateInput?: string | Date): string {
  if (!dateInput) return ''
  const date = new Date(dateInput as any)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function BlogPageClient({ posts }: BlogPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Get unique categories
  const categories = Array.from(
    new Set(posts.map(p => p.category).filter(Boolean))
  ).sort()

  // Filter and search with best matches at top
  const getFilteredAndSortedPosts = () => {
    let filtered = [...posts]

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Filter by search term - sort by relevance (best matches first)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.map(post => {
        const titleMatch = post.title.toLowerCase().includes(term)
        const excerptMatch = post.excerpt.toLowerCase().includes(term)
        const categoryMatch = post.category?.toLowerCase().includes(term)

        // Scoring: title match is highest priority
        let score = 0
        if (titleMatch) score += 3
        if (excerptMatch) score += 1
        if (categoryMatch) score += 2

        return { ...post, _searchScore: score }
      })
      .filter(p => p._searchScore > 0)
      .sort((a, b) => (b._searchScore || 0) - (a._searchScore || 0))
      .map(({ _searchScore, ...p }) => p)
    }

    return filtered
  }

  const filteredPosts = getFilteredAndSortedPosts()

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

  // Reset to page 1 when search/filter changes
  const handleFilterChange = (callback: () => void) => {
    setCurrentPage(1)
    callback()
  }

  return (
    <>
      {/* Search & Filter Bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search posts by title, excerpt, or category..."
                value={searchTerm}
                onChange={(e) => handleFilterChange(() => setSearchTerm(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
              />
              {searchTerm && (
                <p className="text-xs text-gray-500 mt-1">
                  {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="blog-category-select" className="sr-only">Filter by category</label>
              <select
                id="blog-category-select"
                value={selectedCategory}
                onChange={(e) => handleFilterChange(() => setSelectedCategory(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              {posts.length === 0 ? (
                <>
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No blog posts yet</h3>
                  <p className="text-gray-600">Check back soon for new content!</p>
                </>
              ) : (
                <>
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {paginatedPosts.map((post) => (
                  <article 
                    key={post.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="p-6">
                      {/* Post Date */}
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <time dateTime={(post.published_at || post.created_at) ? (post.published_at || post.created_at).toString() : undefined}>
                          {formatDate(post.published_at || post.created_at)}
                        </time>
                        {post.category && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary">
                              {post.category}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Post Title */}
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      {/* Post Excerpt */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Read More Link */}
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-primary hover:text-primary-800 font-medium text-sm transition-colors"
                      >
                        Read more
                        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 pt-8 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="blog-items-per-page" className="text-sm text-gray-700">Show per page:</label>
                    <select
                      id="blog-items-per-page"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white text-gray-900"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages} ({filteredPosts.length} total)
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>

                      {/* Page number indicators */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum = i + 1
                          if (totalPages > 5) {
                            if (currentPage > 3) {
                              pageNum = currentPage - 2 + i
                            }
                            if (pageNum > totalPages) {
                              pageNum = totalPages - (4 - i)
                            }
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-primary text-white'
                                  : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
