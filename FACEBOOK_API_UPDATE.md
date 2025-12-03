# Facebook Graph API Integration - Complete Update

## Summary of Changes

This document describes the updates made to fix video thumbnail display and align the integration with the latest Facebook Graph API response structure.

---

## What Was Fixed

### 🎯 Main Issues Resolved

1. **No Facebook content showing** - Added Facebook Graph API token to `.env.local`
2. **Video thumbnails showing blank** - Updated API to properly extract `media.image.src` for video thumbnails
3. **API endpoint mismatch** - Aligned API fields with new Graph API cURL structure

### ✅ Key Improvements

- Removed deprecated `full_picture` field (no longer needed)
- Removed `subattachments` complexity (not used in current API response)
- Simplified data normalization logic
- Enhanced video badge with play icon
- Videos now correctly display thumbnails from `media.image.src`
- Video source URLs available via `media.source` for future playback features

---

## Changes Made

### 1. API Route Updates (`app/api/facebook/route.ts`)

**Before:**
```typescript
'attachments{media_type,media{source,image},subattachments{data{media_type,media{source,image}}}}'
```

**After:**
```typescript
'attachments{media,media_type}'
```

**What Changed:**
- Removed `full_picture` from requested fields (not available in new API)
- Removed `subattachments` recursion (simplified structure)
- Updated normalization to handle flat attachment structure
- Removed `full_picture` from TypeScript types

### 2. Component Updates (`components/FollowJourney.tsx`)

**Before:**
```typescript
const previewUrl = attachment?.media?.image?.src || post.full_picture;
```

**After:**
```typescript
const previewUrl = attachment?.media?.image?.src;
const videoSource = isVideo ? attachment?.media?.source : undefined;
```

**What Changed:**
- Removed `full_picture` fallback (no longer returned by API)
- Removed `subattachments` from types and flatten logic
- Added `videoSource` for future video playback
- Enhanced video badge with play icon SVG
- Videos only show badge when thumbnail exists

### 3. Environment Configuration (`.env.local`)

**Created new file:**
```env
FACEBOOK_GRAPH_TOKEN=EAAQAkW0CZAS4BQBti28WZB5gYYZAZA5UUZA0ZAGs2skj7VDA2mNmBPZCeFDiBnVIDYTqvbKliNnZAZCu8Gp94225JtKoOXu2NiuykvAR8FpHmvSr9YNnhOmK324iGK7eLFMCFAfVVz4yOFF6n4un07IZCZCRVWFQV2WPqczCWxpBBbZCcy5AZAy9FShI9S2cZC5qrA7CffzKTB2eu9Ry5wj99l7r46cRGkmUXmV5b66raxT0XK7CgZD
```

⚠️ **Security Note:** This token is shown for demonstration. In production:
- Never commit `.env.local` to Git (already in `.gitignore`)
- Rotate tokens regularly
- Use Facebook App access tokens with proper permissions

---

## Data Structure

### Graph API Response (Simplified)

```json
{
  "id": "108148588822478",
  "name": "UAPP",
  "posts": {
    "data": [
      {
        "id": "108148588822478_874727885489847",
        "message": "Post content...",
        "created_time": "2025-11-24T09:30:17+0000",
        "permalink_url": "https://www.facebook.com/reel/1373830150998053/",
        "attachments": {
          "data": [
            {
              "media": {
                "image": {
                  "height": 720,
                  "src": "https://scontent-iad3-1.xx.fbcdn.net/.../n.jpg",
                  "width": 405
                },
                "source": "https://scontent-iad3-2.xx.fbcdn.net/.../video.mp4"
              },
              "media_type": "video"
            }
          ]
        }
      }
    ]
  }
}
```

### Key Fields Explained

| Field | Description | Usage |
|-------|-------------|-------|
| `media.image.src` | Video thumbnail URL | Displayed in card preview |
| `media.source` | Video file URL | Available for future video player |
| `media_type` | Type (`video` or `photo`) | Shows video badge |
| `permalink_url` | Link to Facebook post | "View on Facebook" button |

---

## How Video Thumbnails Work

```
1. User scrolls to FollowJourney section
   ↓
2. Component fetches from /api/facebook
   ↓
3. API calls Graph API with token
   ↓
4. Graph API returns posts with attachments
   ↓
5. For each post:
   - Check attachments[0].media_type === 'video'
   - Extract attachments[0].media.image.src (thumbnail)
   - Extract attachments[0].media.source (video URL)
   ↓
6. Component renders:
   - <img src={media.image.src}> for thumbnail
   - "Video" badge with play icon if media_type === 'video'
   ↓
7. User clicks "View on Facebook"
   - Opens permalink_url in new tab
```

---

## Testing the Integration

### 1. Test API Endpoint Directly

```bash
# PowerShell
cd "d:\bluebay it\CMS_Nextjs-main"
npm run dev

# In another terminal (or after server starts)
Invoke-WebRequest -Uri "http://localhost:3000/api/facebook" | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected Response:**
```json
{
  "posts": [
    {
      "id": "...",
      "message": "...",
      "created_time": "...",
      "permalink_url": "...",
      "attachments": [
        {
          "media_type": "video",
          "media": {
            "image": {
              "src": "https://scontent-iad3-1.xx.fbcdn.net/...",
              "width": 405,
              "height": 720
            },
            "source": "https://scontent-iad3-2.xx.fbcdn.net/.../video.mp4"
          }
        }
      ]
    }
  ]
}
```

### 2. Test in Browser

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Scroll to "Latest Facebook Stories" section
4. Verify:
   - ✅ Posts are loading (not "Loading posts..." forever)
   - ✅ Video thumbnails are visible (not blank)
   - ✅ Video badge with play icon appears on videos
   - ✅ Carousel navigation works (prev/next buttons)
   - ✅ "View on Facebook" links work

### 3. Verify Video Thumbnails

**Check these posts should show video thumbnails:**
- Ma'at isn't perfection post
- Ganbaru isn't about being perfect post
- Michael Scott "I LOVE IT" energy post
- Over 100 African students placed post

All should display thumbnail images from `media.image.src` with video badges.

---

## Carousel Navigation Behavior

### Current Implementation

The carousel uses **client-side scrolling** with the current visible posts in memory. It does NOT load new content dynamically when scrolling.

**How it works:**
1. Component loads 12 posts on mount: `posts.limit(12)`
2. All 12 posts stored in component state
3. Navigation buttons scroll through these 12 posts
4. No additional API calls on scroll

### User's Request: "Load new post content for next card on slider"

This would require implementing **pagination**. Here's how:

#### Option A: Client-Side Pagination (Recommended)

```typescript
// Load MORE posts initially
const GRAPH_FIELDS = 'posts.limit(25){...}'  // Increase from 12 to 25+

// In component, show only 4-6 at a time
const [currentPage, setCurrentPage] = useState(0);
const POSTS_PER_PAGE = 4;
const visiblePosts = posts.slice(
  currentPage * POSTS_PER_PAGE, 
  (currentPage + 1) * POSTS_PER_PAGE
);

// Navigation loads next page
const handleScrollBy = (direction: 'previous' | 'next') => {
  if (direction === 'next') {
    setCurrentPage(prev => Math.min(prev + 1, Math.floor(posts.length / POSTS_PER_PAGE)));
  } else {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  }
};
```

**Pros:** Simple, no additional API calls, smooth UX
**Cons:** Limited to initial posts loaded

#### Option B: Server-Side Pagination (Advanced)

```typescript
// API supports pagination via cursors
// Graph API response includes:
{
  "posts": {
    "data": [...],
    "paging": {
      "cursors": {
        "after": "CURSOR_STRING"
      },
      "next": "https://graph.facebook.com/v24.0/..."
    }
  }
}

// Component would need to:
1. Track current cursor
2. Call /api/facebook?cursor=CURSOR on navigation
3. Append new posts to state
4. Show loading state during fetch
```

**Pros:** Can load unlimited posts, always fresh data
**Cons:** Requires API changes, slower UX (loading states), more API calls

### Recommendation

For this use case, **Option A (Client-Side Pagination)** is better because:
- Facebook posts don't change frequently
- Users typically view 4-12 posts max
- Avoids loading states and API rate limits
- Simpler implementation

---

## Troubleshooting

### Issue: "Missing Facebook Graph API token" (500 error)

**Solution:** Ensure `.env.local` exists with valid token
```bash
# Check file exists
Test-Path ".env.local"

# Check content
Get-Content ".env.local"

# Restart dev server after adding token
npm run dev
```

### Issue: Videos still showing blank

**Check:**
1. API response includes `media.image.src`:
   ```bash
   Invoke-WebRequest http://localhost:3000/api/facebook
   # Look for "media":{"image":{"src":"https://..."}}
   ```

2. Browser console for image load errors:
   - Open DevTools (F12)
   - Check Console tab
   - Look for 403/404 errors on Facebook CDN URLs

3. Facebook CDN URLs may expire - token refresh needed

### Issue: No posts showing

**Possible causes:**
1. Token expired - get new token from Graph API Explorer
2. API rate limit hit - wait and retry
3. Page has no posts - check Facebook page directly
4. Network error - check browser console

### Issue: Carousel not scrolling

**Check:**
1. Posts loaded: Look for 12+ posts in API response
2. Browser console errors
3. Try different screen size (works best on larger screens)

---

## Next Steps / Future Enhancements

### 1. Implement Pagination (High Priority)

Based on user's request to "load new post content for next card", implement client-side pagination:

```typescript
// In FollowJourney.tsx
const POSTS_PER_PAGE = 4;
const [currentPage, setCurrentPage] = useState(0);
const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
const visiblePosts = posts.slice(
  currentPage * POSTS_PER_PAGE,
  (currentPage + 1) * POSTS_PER_PAGE
);

// Update handleScrollBy
const handleScrollBy = (direction: 'previous' | 'next') => {
  setCurrentPage(prev => 
    direction === 'next' 
      ? Math.min(prev + 1, totalPages - 1)
      : Math.max(prev - 1, 0)
  );
};
```

### 2. Video Playback Modal

Add click handler to play videos in modal/lightbox:

```typescript
const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

// In card render
<div 
  onClick={() => isVideo && videoSource && setSelectedVideo(videoSource)}
  className="cursor-pointer"
>
  {/* thumbnail */}
</div>

{/* Modal */}
{selectedVideo && (
  <VideoModal 
    src={selectedVideo} 
    onClose={() => setSelectedVideo(null)} 
  />
)}
```

### 3. Caching Strategy

Add revalidation to reduce API calls:

```typescript
// In route.ts
export const revalidate = 300; // Cache for 5 minutes
```

### 4. Loading Skeleton

Replace "Loading posts..." with proper skeleton:

```tsx
{loading && (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-60 bg-gray-200 rounded-t-2xl" />
        <div className="h-32 bg-gray-100 rounded-b-2xl" />
      </div>
    ))}
  </div>
)}
```

### 5. Error Boundary

Wrap component in error boundary for better error handling.

---

## API Documentation Reference

### Facebook Graph API Explorer
https://developers.facebook.com/tools/explorer/

### Current Request (cURL equivalent)
```bash
curl "https://graph.facebook.com/v24.0/me?fields=id,name,posts{message,created_time,story,permalink_url,attachments{media,media_type}}&access_token=YOUR_TOKEN"
```

### Permissions Required
- `pages_read_engagement` - Read page content
- `pages_show_list` - List pages you manage

### Rate Limits
- Standard: 200 calls per hour per user
- Use `Cache-Control` headers to reduce calls

---

## File Locations

| File | Purpose | Changes Made |
|------|---------|--------------|
| `app/api/facebook/route.ts` | Server-side proxy | Updated fields, removed subattachments |
| `components/FollowJourney.tsx` | UI component | Removed full_picture, added video icon |
| `.env.local` | Environment variables | Added FACEBOOK_GRAPH_TOKEN |
| `public/response.json` | Sample API response | Reference for data structure |

---

## Important Notes

1. **Token Security:**
   - Never commit `.env.local` to version control
   - Use Facebook App tokens, not personal tokens
   - Rotate tokens every 60 days

2. **Facebook CDN URLs:**
   - Thumbnail URLs (`media.image.src`) may expire
   - Video URLs (`media.source`) may expire
   - Consider caching images if needed

3. **Data Freshness:**
   - API returns last 12 posts
   - No real-time updates (requires webhooks)
   - Consider adding manual refresh button

4. **Responsive Design:**
   - Carousel shows 1 card on mobile
   - 2 cards on tablet
   - 3 cards on desktop
   - 4 cards on XL screens

---

## Questions & Support

If you encounter issues:

1. Check this document's Troubleshooting section
2. Verify API response structure matches expected format
3. Check browser console for JavaScript errors
4. Verify token has not expired

For pagination implementation or video playback features, refer to "Next Steps" section above.

---

**Last Updated:** December 3, 2025
**Next.js Version:** 14.2.33
**Graph API Version:** v24.0
