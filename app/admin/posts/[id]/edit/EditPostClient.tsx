'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { clientApi, ClientApiError } from '@/lib/client-api'
import { generateSlug, generateExcerpt } from '@/lib/seo'
import BlockEditor from '@/components/BlockEditor'
import BlockRenderer from '@/components/BlockRenderer'

interface Category {
  id: number
  name: string
  slug: string
}

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  meta_title?: string
  meta_description?: string
  status: 'draft' | 'published'
  tags: string[]
  category_id?: number
  category?: Category
  canonical_url?: string
  featured_image?: string
  published_at?: string
}

interface BlockData {
  id: string
  type: string
  content: any
  settings?: any
  order: number
}

interface EditPostClientProps {
  categories: Category[]
}

export default function EditPostClient({ categories }: EditPostClientProps) {
  const router = useRouter()
  const params = useParams()
  
  const [post, setPost] = useState<Post | null>(null)
  const [blocks, setBlocks] = useState<BlockData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'preview' | 'revisions'>('content')
  const [tagInput, setTagInput] = useState('')
  const [revisions, setRevisions] = useState<any[]>([])
  const [revisionCount, setRevisionCount] = useState(0)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    show: boolean
  }>({ type: 'info', message: '', show: false })

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

      // Load revisions for this post
      try {
        const revisionsResponse = await fetch(`/api/posts/${params.id}/revisions`, {
          headers: {
            'Authorization': `Bearer ${clientApi.auth.getToken()}`
          }
        })
        if (revisionsResponse.ok) {
          const revisionsData = await revisionsResponse.json()
          setRevisions(revisionsData.revisions || [])
          setRevisionCount(revisionsData.count || 0)
        }
      } catch (error) {
        console.error('Error loading revisions:', error)
      }
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

  const handlePostChange = (field: string, value: any) => {
    if (!post) return
    
    const updatedPost = { ...post, [field]: value }
    setPost(updatedPost)
  }

  const handleBlocksChange = (updatedBlocks: any[]) => {
    setBlocks(updatedBlocks)
  }

  const addTag = () => {
    if (!post) return
    const tag = tagInput.trim()
    if (tag && !post.tags.includes(tag)) {
      const updatedPost = { ...post, tags: [...post.tags, tag] }
      setPost(updatedPost)
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    if (!post) return
    const updatedPost = { ...post, tags: post.tags.filter(t => t !== tag) }
    setPost(updatedPost)
  }

  const handleSave = async () => {
    if (!post) return
    
    try {
      setSaving(true)
      const response = await clientApi.posts.update(post.id, {
        ...post,
        blocks: blocks
      })

      showNotification('Post saved successfully', 'success')
    } catch (error) {
      console.error('Error saving post:', error)
      showNotification('Error saving post', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!post) return
    
    try {
      setSaving(true)
      const response = await clientApi.posts.update(post.id, {
        ...post,
        status: 'published',
        published_at: new Date().toISOString(),
        blocks: blocks
      })

      showNotification('Post published successfully', 'success')
    } catch (error) {
      console.error('Error publishing post:', error)
      showNotification('Error publishing post', 'error')
    } finally {
      setSaving(false)
    }
  }

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type, show: true })
    setTimeout(() => {
      setNotification({ ...notification, show: false })
    }, 4000)
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 bg-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Post not found</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-md text-white z-50 ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' :
          'bg-blue-500'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
              <p className="text-sm text-gray-600 mt-1">ID: {post.id}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              {post.status === 'draft' && (
                <button
                  onClick={handlePublish}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Publish'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {(['content', 'seo', 'preview', 'revisions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={post.title}
                    onChange={(e) => {
                      handlePostChange('title', e.target.value)
                      if (!post.slug) {
                        handlePostChange('slug', generateSlug(e.target.value))
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="Post title"
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
                    Status
                  </label>
                  <select
                    value={post.status}
                    onChange={(e) => handlePostChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={post.category_id || ''}
                      onChange={(e) => handlePostChange('category_id', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      title="Select category"
                    >
                      <option value="">Select a category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={post.featured_image || ''}
                    onChange={(e) => handlePostChange('featured_image', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="https://example.com/image.jpg"
                  />
                  {post.featured_image && (
                    <div className="mt-2">
                      <img
                        src={post.featured_image}
                        alt="Featured image preview"
                        className="w-32 h-20 object-cover rounded-md border border-gray-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
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
                    Category: {post.category?.name} | Status: {post.status} | ID: {post.id}
                  </div>
                </div>

                {blocks.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Content Preview</h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <BlockRenderer blocks={blocks} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'revisions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Revision History</h3>
                  <div className="text-sm text-gray-500">
                    Total revisions: {revisionCount}
                  </div>
                </div>

                {revisions.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">No revisions yet. Save changes to create the first revision.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {revisions.map((revision) => (
                      <div key={revision.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  #{revision.revision_number}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Revision #{revision.revision_number}
                              </p>
                              <p className="text-xs text-gray-500">
                                Edited by {revision.author?.display_name || 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(revision.edited_at || revision.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
