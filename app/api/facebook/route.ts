import { NextResponse } from 'next/server'

const GRAPH_VERSION = 'v24.0'
const GRAPH_ENDPOINT = `https://graph.facebook.com/${GRAPH_VERSION}/me`
const GRAPH_FIELDS = [
  'id',
  'name',
  [
    'posts.limit(12){',
    [
      'id',
      'message',
      'story',
      'created_time',
      'permalink_url',
      'attachments{media,media_type}',
    ].join(','),
    '}',
  ].join(''),
].join(',')

type NormalizedMediaImage = {
  src: string
  width?: number
  height?: number
}

type NormalizedMedia = {
  image?: NormalizedMediaImage
  source?: string
}

type NormalizedAttachment = {
  media_type?: string
  media?: NormalizedMedia
}

type NormalizedGraphPost = {
  id: string
  message?: string
  story?: string
  created_time?: string
  permalink_url?: string
  attachments?: NormalizedAttachment[]
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function normalizeGraphPosts(payload: unknown): NormalizedGraphPost[] {
  function normalizeAttachment(raw: unknown): NormalizedAttachment | null {
    if (!raw || typeof raw !== 'object') {
      return null
    }

    const node = raw as {
      media_type?: unknown
      media?: unknown
    }

    const media = node.media && typeof node.media === 'object' ? node.media : undefined
    const image = media && 'image' in media ? (media as { image?: unknown }).image : undefined
    const imageObject = image && typeof image === 'object' ? image : undefined

    const normalized: NormalizedAttachment = {
      media_type: typeof node.media_type === 'string' ? node.media_type : undefined,
      media: media
        ? {
            image:
              imageObject && 'src' in imageObject && typeof (imageObject as { src?: unknown }).src === 'string'
                ? {
                    src: (imageObject as { src: string }).src,
                    width:
                      'width' in imageObject && typeof (imageObject as { width?: unknown }).width === 'number'
                        ? (imageObject as { width: number }).width
                        : undefined,
                    height:
                      'height' in imageObject && typeof (imageObject as { height?: unknown }).height === 'number'
                        ? (imageObject as { height: number }).height
                        : undefined,
                  }
                : undefined,
            source:
              'source' in media && typeof (media as { source?: unknown }).source === 'string'
                ? (media as { source: string }).source
                : undefined,
          }
        : undefined,
    }

    if (!normalized.media_type && !normalized.media) {
      return null
    }

    return normalized
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return []
  }

  const posts = (payload as { posts?: { data?: unknown[] } }).posts?.data
  if (!Array.isArray(posts)) {
    return []
  }

  const normalized: NormalizedGraphPost[] = []

  for (const raw of posts) {
    if (!raw || typeof raw !== 'object') {
      continue
    }

    const post = raw as {
      id?: unknown
      message?: unknown
      story?: unknown
      created_time?: unknown
      permalink_url?: unknown
      full_picture?: unknown
      attachments?: { data?: unknown[] }
    }

    if (typeof post.id !== 'string') {
      continue
    }

    const attachments = Array.isArray(post.attachments?.data) ? post.attachments?.data : []
    const normalizedAttachments: NormalizedAttachment[] = []

    for (const rawAttachment of attachments) {
      const normalizedAttachment = normalizeAttachment(rawAttachment)
      if (normalizedAttachment) {
        normalizedAttachments.push(normalizedAttachment)
      }
    }

    normalized.push({
      id: post.id,
      message: typeof post.message === 'string' ? post.message : undefined,
      story: typeof post.story === 'string' ? post.story : undefined,
      created_time: typeof post.created_time === 'string' ? post.created_time : undefined,
      permalink_url: typeof post.permalink_url === 'string' ? post.permalink_url : undefined,
      attachments: normalizedAttachments.length > 0 ? normalizedAttachments : undefined,
    })
  }

  return normalized
}

export async function GET() {
  const token =
    process.env.FACEBOOK_GRAPH_TOKEN || process.env.NEXT_PUBLIC_FACEBOOK_GRAPH_TOKEN || process.env.FB_GRAPH_TOKEN

  if (!token) {
    return NextResponse.json({ error: 'Missing Facebook Graph API token.' }, { status: 500 })
  }

  const query = new URLSearchParams({
    fields: GRAPH_FIELDS,
    access_token: token,
  })

  const response = await fetch(`${GRAPH_ENDPOINT}?${query.toString()}`, {
    method: 'GET',
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorBody = await response.text()
    return NextResponse.json({ error: 'Failed to fetch from Facebook Graph API.', details: errorBody }, { status: 502 })
  }

  const payload = await response.json()
  const posts = normalizeGraphPosts(payload)

  return NextResponse.json({ posts }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
