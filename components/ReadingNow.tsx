"use client"

import React, { useState, useEffect } from 'react'

interface Post {
  id: number
  slug: string
  title: string
  excerpt: string
  category?: string
  published_at?: string | null
  created_at?: string
}

export default function ReadingNow({ initialPosts }: { initialPosts: Post[] }) {
  const POSTS_PER_PAGE = 6
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Reset to first page if the incoming posts change
  useEffect(() => {
    setPage(1)
  }, [initialPosts])

  // reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [searchTerm, selectedCategory])

  // compute filtered posts based on search and category
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredPosts = initialPosts.filter((p) => {
    const matchesCategory = selectedCategory ? (p.category === selectedCategory) : true
    if (!normalizedSearch) return matchesCategory
    const inTitle = (p.title || '').toLowerCase().includes(normalizedSearch)
    const inExcerpt = (p.excerpt || '').toLowerCase().includes(normalizedSearch)
    return matchesCategory && (inTitle || inExcerpt)
  })

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))
  const start = (page - 1) * POSTS_PER_PAGE
  const pagedPosts = filteredPosts.slice(start, start + POSTS_PER_PAGE)

  // derive available categories from posts (unique)
  const categories = Array.from(new Set(initialPosts.map(p => p.category).filter(Boolean)))

  return (
    
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-[#EF623C]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M5 12l5-5 7 7" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900">What Students Are Reading Now</h2>
          </div>
          <p className="text-gray-600 mt-2">Join thousands of students accessing the most valuable content this week</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Search & Category filter moved inside the blog list and shown at top */}
            <div className="mb-6 flex flex-col sm:flex-row items-center gap-3 ">
              <div className="w-full sm:w-80">
          <input
            aria-label="Search posts"
            placeholder="Search by title or excerpt"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-white"
            style={{ color: 'black' }}
          />
              </div>
              <div>
          <select
            aria-label="Filter by category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
            style={{ color: 'black' }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pagedPosts.map((post) => (
          <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="relative h-44 bg-gray-200">
              <img src={`/images/post-${post.id}.jpg`} alt={post.title} className="w-full h-full object-cover" />
              <span className="absolute left-4 bottom-4 inline-flex items-center px-3 py-1 rounded-full bg-[#1C334D] text-white text-sm">
                {post.category || 'Article'}
              </span>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <a href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#EF623C] text-white text-sm">Read More</a>
                <div className="text-sm text-gray-500">{new Date(post.published_at || post.created_at || '').toLocaleDateString()}</div>
              </div>
            </div>
          </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            className="px-3 py-2 bg-white border rounded-md"
            disabled={page === 1}
          >
            Prev
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1
              return (
                <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 rounded-md ${p === page ? 'bg-[#EF623C] text-white' : 'bg-white border text-gray-700'}`}
                >
            {p}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className="px-3 py-2 bg-white border rounded-md"
            disabled={page === totalPages}
          >
            Next
          </button>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-5">
              <div className="flex items-center gap-3 mb-3">
          <svg className="w-5 h-5 text-[#EF623C]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 7-7 7-7-7 7-7z" />
          </svg>
          <h4 className="text-lg font-semibold text-gray-900">Get Your University Roadmap</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">3-minute quiz — Personalized application plan</p>
              <div className="space-y-2 mb-3">
          <select aria-label="Target degree" className="w-full px-3 py-2 border rounded-md bg-white text-sm">
            <option>What's your target degree?</option>
          </select>
          <select aria-label="Academic level" className="w-full px-3 py-2 border rounded-md bg-white text-sm">
            <option>Your academic level</option>
          </select>
          <select aria-label="Field of study" className="w-full px-3 py-2 border rounded-md bg-white text-sm">
            <option>Target field of study</option>
          </select>
              </div>
              <button className="w-full px-4 py-2 rounded-md bg-[#EF623C] text-white font-semibold">Get My Custom Plan</button>

              <div className="mt-4 text-sm text-gray-700">
          <div>✓ Personalized timeline ✓ Required tests</div>
          <div>✓ Application deadlines</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex items-center gap-3 mb-2">
          <svg className="w-5 h-5 text-[#EF623C]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 2l3 7h7l-5.5 4.2L20 22l-8-5.6L4 22l2.5-8.8L1 9h7l3-7z" />
          </svg>
          <h4 className="text-lg font-semibold text-gray-900">What's Trending</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">Most popular topics this week</p>

              <div className="flex flex-col gap-2 mb-3">
          {['UCAS Applications','Student Loans','University Rankings','Personal Statements','Accommodation','Scholarships'].map((t) => (
            <button key={t} className="text-sm px-3 py-2 rounded-md bg-gray-100 text-gray-800 text-left">{t}</button>
          ))}
              </div>

              <button className="w-full px-4 py-2 rounded-md border border-[#1C334D] text-[#1C334D]">View All Trending</button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
