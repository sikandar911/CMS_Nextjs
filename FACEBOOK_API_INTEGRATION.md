# Facebook Graph API Integration - FollowJourney Component

## Overview
The `FollowJourney` component has been updated to display **dynamic Facebook posts** from the Graph API with proper video thumbnail support. All static fallback data has been removed.

## Key Changes

### 1. **FollowJourney Component** (`components/FollowJourney.tsx`)
- **Removed**: All hardcoded FALLBACK_POSTS
- **Added**: Dynamic data fetching from `/api/facebook` endpoint
- **Initial State**: `posts = []` (empty until API data loads)
- **Loading State**: Shows "Loading posts..." message
- **Error Handling**: Displays meaningful error messages
- **Data Source**: Fetches from `GET /api/facebook` with `cache: 'no-store'`

### 2. **Graph API Response Handling**
The component now properly extracts and displays:
- ✅ **Video Thumbnails**: From `attachments[].media.image.src`
- ✅ **Post Messages**: Full text with line breaks preserved
- ✅ **Created Dates**: Formatted as "DD MMM YYYY" (GB locale)
- ✅ **Media Type Detection**: Videos flagged with "Video" badge
- ✅ **Facebook Links**: "View on Facebook" CTA with external link

### 3. **Data Structure**
```typescript
type GraphPost = {
  id: string
  message?: string
  story?: string
  created_time?: string
  permalink_url?: string
  full_picture?: string
  attachments?: {
    media_type?: 'video' | 'photo' | 'album'
    media?: {
      image?: { src: string; width?: number; height?: number }
      source?: string
    }
    subattachments?: GraphAttachment[] // For nested media
  }[]
}
```

## Video Display Flow

1. **API Response** → Facebook Graph API returns posts with `attachments.data[].media.image.src`
2. **Normalization** → `getPrimaryAttachment()` extracts the first attachment with valid image
3. **Video Detection** → Checks if `media_type === 'video'`
4. **Thumbnail Rendering** → Displays `media.image.src` as `<img>` with video badge overlay
5. **User Action** → Clicking "View on Facebook" opens the full video on Facebook

## Server-Side Proxy Route

**File**: `app/api/facebook/route.ts`

### Purpose
Secure server-side proxy that:
- Keeps Facebook access token private (not exposed to browser)
- Normalizes Graph API response into clean JSON
- Handles nested subattachments recursively
- Returns `Cache-Control: no-store` (no caching)

### Configuration
```typescript
export const runtime = 'nodejs'           // Use Node.js runtime (required for server-side fetch)
export const dynamic = 'force-dynamic'    // Disable static optimization
export const revalidate = 0               // No caching
```

### Graph API Query
```
GET /v24.0/me?fields=
  id,
  name,
  posts.limit(12){
    id,
    message,
    story,
    created_time,
    permalink_url,
    full_picture,
    attachments{
      media_type,
      media{source,image},
      subattachments{data{media_type,media{source,image}}}
    }
  }
```

## Setup Instructions

### 1. Add Facebook Token to `.env.local`
```bash
# Create/edit .env.local in project root
FACEBOOK_GRAPH_TOKEN=your_access_token_here
```

The API checks for tokens in this order:
1. `FACEBOOK_GRAPH_TOKEN` (recommended)
2. `NEXT_PUBLIC_FACEBOOK_GRAPH_TOKEN`
3. `FB_GRAPH_TOKEN`

### 2. Start Development Server
```bash
npm run dev
# Server runs on http://localhost:3000 (or 3001 if 3000 is in use)
```

### 3. View the Component
- Navigate to `http://localhost:3000`
- Scroll down to "Latest Facebook Stories" section
- You should see 12 recent posts from your Facebook page
- Videos show thumbnail + "Video" badge
- Click "View on Facebook" to open post on Facebook

## Testing

### Test the API Endpoint Directly
```bash
curl http://localhost:3000/api/facebook
# Returns: { "posts": [...] }
```

### Verify Video Display
1. Check Network tab: `/api/facebook` returns JSON with `attachments[].media.image.src`
2. Check DOM: Videos display `<img>` with `src="https://...jpg"` (Facebook-hosted thumbnail)
3. Check Badge: Video posts show "Video" label in top-right corner
4. Check Link: Clicking "View on Facebook" opens the actual video URL

## Error Handling

### Missing Token
```
Error: Missing Facebook Graph API token.
Status: 500
```
→ Add `FACEBOOK_GRAPH_TOKEN` to `.env.local`

### Invalid Token
```
Error: Failed to fetch from Facebook Graph API.
Details: "Invalid OAuth Token"
Status: 502
```
→ Verify token is valid and hasn't expired

### No Posts
```
"No posts available"
```
→ Page might not have published posts, or API permissions missing

## Performance Considerations

- ✅ **No Caching**: `cache: 'no-store'` ensures fresh data on every load
- ✅ **Lazy Loading**: Images load on scroll with `loading="lazy"`
- ✅ **Responsive**: Carousel adapts to mobile/tablet/desktop
- ✅ **Snap Scroll**: Smooth carousel navigation with snap points

## Future Enhancements

1. **Add Caching** (60–300s TTL) to reduce API calls:
   ```typescript
   export const revalidate = 60 // Cache for 60 seconds
   ```

2. **Pagination** for posts > 12:
   ```typescript
   const hasMore = posts.length >= 12
   const nextCursor = cursors?.after // From Graph pagination
   ```

3. **Video Playback**: Click thumbnail to play inline video:
   ```typescript
   const [playing, setPlaying] = useState(null)
   // Show video player modal on click
   ```

4. **Engagement Metrics**: Display likes/comments:
   ```
   fields: "...,posts.limit(12){...,likes.summary(true),comments.summary(true)}"
   ```

## Files Modified

- ✅ `components/FollowJourney.tsx` — Complete rewrite for dynamic data
- ✅ `app/api/facebook/route.ts` — Already implemented (server proxy)
- ✅ `app/page.tsx` — Already has `<FollowJourney />` component

## Browser Compatibility

✅ Chrome/Edge 90+
✅ Firefox 88+
✅ Safari 14+
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

**Videos show blank image?**
→ Check if `media.image.src` exists in API response. If not, request `full_picture` fallback.

**Carousel navigation broken?**
→ Verify `ref={sliderRef}` is attached to scroll container.

**Loading state stuck?**
→ Check Network tab for `/api/facebook` response status and content.

**Facebook links 404?**
→ Verify `permalink_url` is included in Graph query fields.

---

**Last Updated**: December 3, 2025
**Component**: `FollowJourney`
**Status**: ✅ Dynamic data integration complete
