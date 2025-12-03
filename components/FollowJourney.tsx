'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SocialFollowCards from './SocialFollowCards';

type GraphMedia = {
  image?: {
    src?: string;
    width?: number;
    height?: number;
  };
  source?: string;
};

type GraphAttachment = {
  media_type?: string;
  media?: GraphMedia;
};

type GraphPost = {
  id: string;
  message?: string;
  story?: string;
  created_time?: string;
  permalink_url?: string;
  attachments?: GraphAttachment[];
};

const API_ENDPOINT = '/api/facebook';

function flattenAttachments(attachments?: GraphAttachment[]): GraphAttachment[] {
  if (!attachments) {
    return [];
  }

  return attachments.filter((attachment): attachment is GraphAttachment => attachment !== null && attachment !== undefined);
}

function normalizePosts(payload: unknown): GraphPost[] {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return [];
  }

  const posts = (payload as { posts?: GraphPost[] }).posts;
  if (!Array.isArray(posts)) {
    return [];
  }

  return posts.filter((post): post is GraphPost => typeof post === 'object' && post !== null && typeof post.id === 'string');
}

function getPrimaryAttachment(post: GraphPost): GraphAttachment | undefined {
  const attachments = flattenAttachments(post.attachments);
  if (attachments.length === 0) {
    return undefined;
  }

  const withPreview = attachments.find((attachment) => attachment.media?.image?.src);
  return withPreview ?? attachments[0];
}

function formatDate(value?: string): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function sanitizeMessage(message?: string, story?: string): string {
  const text = message || story || 'Stay tuned for more from UAPP.';
  return text.trim();
}

export default function FollowJourney() {
  const [posts, setPosts] = useState<GraphPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Show up to 12 posts (include all kinds of posts, even those without permalink_url)
  const visiblePosts = useMemo(() => posts.slice(0, 12), [posts]);

  useEffect(() => {
    let ignore = false;

    async function loadPosts() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_ENDPOINT, { cache: 'no-store' });

        if (!response.ok) {
          throw new Error(`Graph API error ${response.status}`);
        }

        const data = await response.json();
        if (ignore) {
          return;
        }

        const normalized = normalizePosts(data);
        if (normalized.length > 0) {
          setPosts(normalized);
        } else {
          setError('No posts available');
        }
      } catch (requestError) {
        console.error('Failed to load Facebook posts', requestError);
        if (!ignore) {
          setError(`Unable to load Facebook updates: ${requestError instanceof Error ? requestError.message : 'Unknown error'}`);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      ignore = true;
    };
  }, []);

  const updateScrollState = useCallback(() => {
    const node = sliderRef.current;
    if (!node) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = node;
    setCanScrollPrev(scrollLeft > 8);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  useEffect(() => {
    const node = sliderRef.current;
    if (!node) {
      return;
    }

    updateScrollState();

    const handleScroll = () => updateScrollState();
    node.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      node.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [visiblePosts.length, updateScrollState]);

  useEffect(() => {
    const timer = window.setTimeout(() => updateScrollState(), 150);
    return () => window.clearTimeout(timer);
  }, [visiblePosts.length, updateScrollState]);

  const handleScrollBy = useCallback((direction: 'previous' | 'next') => {
    const node = sliderRef.current;
    if (!node) {
      return;
    }

    const amount = direction === 'next' ? node.clientWidth : -node.clientWidth;
    node.scrollBy({ left: amount, behavior: 'smooth' });
  }, []);

  const resolvePreview = useCallback((post: GraphPost) => {
    const attachment = getPrimaryAttachment(post);
    const previewUrl = attachment?.media?.image?.src;
    const isVideo = (attachment?.media_type ?? '').toLowerCase() === 'video';
    const videoSource = isVideo ? attachment?.media?.source : undefined;
    return { previewUrl, isVideo, videoSource };
  }, []);

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 items-center text-center mb-10">
          <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm">
            <span className="text-sm font-semibold tracking-wide text-[#045B5C]">Follow Our Student Journey</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Latest Facebook Stories</h2>
          <p className="text-sm text-gray-600 sm:text-base">
            See real student journeys, upcoming events, and community milestones direct from our Facebook updates.
          </p>
          {error && <p className="text-xs text-amber-600 sm:text-sm">{error}</p>}
          {loading && <p className="text-xs text-gray-500 sm:text-sm">Loading posts...</p>}
          </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-gray-50 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-gray-50 to-transparent" />

          <div className="absolute left-0 top-1/2 hidden -translate-y-1/2 pl-2 sm:flex">
            <button
              type="button"
              onClick={() => handleScrollBy('previous')}
              disabled={!canScrollPrev}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="View previous Facebook update"
            >
              <svg className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M12.707 15.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L9.414 10l3.293 3.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 pr-2 sm:flex">
            <button
              type="button"
              onClick={() => handleScrollBy('next')}
              disabled={!canScrollNext}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="View next Facebook update"
            >
              <svg className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M7.293 4.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L10.586 10 7.293 6.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div
            ref={sliderRef}
            className="grid auto-cols-[85%] grid-flow-col snap-x snap-mandatory gap-6 overflow-x-auto pb-6 px-0 sm:auto-cols-[50%] lg:auto-cols-[33.5%] xl:auto-cols-[25%]"
            aria-live="polite"
            aria-label="Facebook updates"
          >
            {visiblePosts.length > 0 ? (
              visiblePosts.map((post) => {
                const { previewUrl, isVideo, videoSource } = resolvePreview(post);
                const caption = sanitizeMessage(post.message, post.story);

                return (
                  <article
                    key={post.id}
                    className="flex h-full w-full snap-center flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative overflow-hidden rounded-t-2xl bg-gray-900">
                      {previewUrl ? (
                        <div className="w-full overflow-hidden aspect-[9/16]">
                          <img
                            src={previewUrl}
                            alt={caption.slice(0, 80) || 'Facebook post preview'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="flex w-full aspect-[9/16] items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500">
                          <span className="text-sm font-semibold">UAPP Update</span>
                        </div>
                      )}

                      {isVideo && previewUrl ? (
                        post.permalink_url ? (
                          <a
                            href={post.permalink_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute right-3 top-3 inline-flex items-center rounded-full bg-black/70 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white"
                            aria-label="Open video on Facebook"
                          >
                            <svg className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                            Video
                          </a>
                        ) : (
                          <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-black/70 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                            <svg className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                            Video
                          </span>
                        )
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col gap-4 p-5">
                      <p className="text-sm text-gray-800 whitespace-pre-line line-clamp-4">{caption}</p>

                      <div className="mt-auto flex flex-col gap-2 text-sm text-gray-500">
                        <time dateTime={post.created_time}>{formatDate(post.created_time)}</time>
                        <Link
                          href={post.permalink_url ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#045B5C] transition hover:text-[#034b4c]"
                        >
                          View on Facebook
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                            <path
                              fillRule="evenodd"
                              d="M12.293 3.293a1 1 0 011.414 0l3 3a1 1 0 01-.707 1.707H15v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1h7V2.707a1 1 0 01.293-.707zM6 6v8h8V9h-2a1 1 0 110-2h2V6H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : !loading ? (
              <article className="flex h-full w-full snap-center flex-col rounded-2xl border border-dashed border-gray-200 bg-white/60 p-5 text-center text-sm text-gray-500">
                No posts available at the moment
              </article>
            ) : (
              <article className="flex h-full w-full snap-center flex-col rounded-2xl border border-dashed border-gray-200 bg-white/60 p-5 text-center text-sm text-gray-500">
                Loading Facebook stories...
              </article>
            )}
          </div>
        </div>

        {/* Social follow cards: LinkedIn, Twitter, Instagram */}
        <SocialFollowCards />
      </div>
    </section>
  );
}
