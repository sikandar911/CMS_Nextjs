'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { clientApi, ClientApiError } from '@/lib/client-api'
import { generateSlug, generateExcerpt } from '@/lib/seo'
import BlockEditor from '@/components/BlockEditor'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  meta_title?: string
  meta_description?: string
  status: 'draft' | 'published'
  tags: string[]
  category: string
  canonical_url?: string
  published_at?: string
}

interface BlockData {
  id: string
  type: string
  content: any
  settings?: any
  order: number
}

export default function EditPost() {
  const router = useRouter()
  const params = useParams()
  
  const [post, setPost] = useState<Post | null>(null)
  const [blocks, setBlocks] = useState<BlockData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'preview'>('content')
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    // Check authentication
    if (!clientApi.auth.isAuthenticated()) {
      router.push('/admin')
      return
    }
    setIsAuthenticated(true)
    loadPost()
  }, [router])

  const loadPost = async () => {
    if (!params?.id) return
    
    try {
      setLoading(true)
      const postResponse = await clientApi.posts.getById(parseInt(params.id as string))
      setPost(postResponse.post)

      // Load blocks for this post
      const blocksResponse = await clientApi.blocks.getAll(parseInt(params.id as string))
      setBlocks(blocksResponse.blocks || [])
    } catch (error) {
      console.error('Error loading post:', error)
      if (error instanceof ClientApiError && error.status === 401) {
        clientApi.auth.logout()
        router.push('/admin')
      } else if (error instanceof ClientApiError && error.status === 404) {
        router.push('/admin')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePostChange = (field: keyof Post, value: string | string[]) => {
    if (!post) return
    
    setPost(prev => {
      if (!prev) return prev
      
      const updated = { ...prev, [field]: value }
      
      // Auto-generate slug when title changes
      if (field === 'title' && typeof value === 'string') {
        updated.slug = generateSlug(value)
      }
      
      return updated
    })
  }

  const handleBlocksChange = (newBlocks: BlockData[]) => {
    setBlocks(newBlocks)
  }

  const addTag = () => {
    if (!post) return
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost(prev => prev ? ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }) : prev)
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    if (!post) return
    setPost(prev => prev ? ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }) : prev)
  }

  const handleSave = async (publishStatus: 'draft' | 'published' = post?.status || 'draft') => {
    if (!post || !post.title.trim()) {
      alert('Please enter a post title')
      return
    }

    setSaving(true)
    try {
      // Update the post
      const postData = {
        ...post,
        status: publishStatus,
        published_at: publishStatus === 'published' && post.status !== 'published' 
          ? new Date().toISOString() 
          : post.published_at
      }

      const response = await clientApi.posts.update(post.id, postData)
      const savedPost = response.post

      // Update blocks if any changes
      if (blocks.length > 0) {
        const blocksWithPostId = blocks.map((block, index) => ({
          ...block,
          post_id: savedPost.id,
          index: index,
          updated_by: 1
        }))

        await clientApi.blocks.updateMany(blocksWithPostId)
      }

      // Update local state
      setPost(savedPost)
      alert('Post saved successfully!')
    } catch (error) {
      console.error('Error saving post:', error)
      if (error instanceof ClientApiError && error.status === 401) {
        clientApi.auth.logout()
        router.push('/admin')
      } else {
        alert('Failed to save post. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Post not found</p>
          <button
            onClick={() => router.push('/admin')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Admin
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
                <p className="text-sm text-gray-600">{post.title || 'Untitled Post'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {(['content', 'seo', 'preview'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Basic Post Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post Title *
                    </label>
                    <input
                      type="text"
                      value={post.title}
                      onChange={(e) => handlePostChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="Enter post title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={post.slug}
                      onChange={(e) => handlePostChange('slug', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      placeholder="post-slug"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={post.category}
                      onChange={(e) => handlePostChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      title="Select category"
                    >
                      <option value="General">General</option>
                      <option value="Technology">Technology</option>
                      <option value="Business">Business</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Travel">Travel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Tags
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        placeholder="Enter tag and press Enter"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={post.excerpt}
                    onChange={(e) => handlePostChange('excerpt', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="Brief description of the post"
                  />
                </div>

                {/* Block Editor */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Content Blocks</h3>
                  <BlockEditor
                    initialBlocks={blocks}
                    onChange={handleBlocksChange}
                  />
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={post.meta_title || ''}
                    onChange={(e) => handlePostChange('meta_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="SEO title for search engines"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={post.meta_description || ''}
                    onChange={(e) => handlePostChange('meta_description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="SEO description for search engines (150-160 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canonical URL
                  </label>
                  <input
                    type="url"
                    value={post.canonical_url || ''}
                    onChange={(e) => handlePostChange('canonical_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="https://example.com/canonical-url"
                  />
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {post.title || 'Post Title'}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {post.excerpt || 'Post excerpt will appear here...'}
                  </p>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Category: {post.category} | Status: {post.status} | ID: {post.id}
                  </div>
                </div>

                {blocks.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Content Preview</h3>
                    {blocks.map((block) => (
                      <div key={block.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500 mb-2">
                          {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block
                        </div>
                        <div className="text-gray-900 text-sm font-mono">
                          {JSON.stringify(block.content, null, 2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}