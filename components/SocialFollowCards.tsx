'use client';

import Link from 'next/link';
import React from 'react';

export default function SocialFollowCards() {
  const cards = [
    {
      key: 'linkedin',
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/uapp-global',
      bg: 'bg-blue-700',
      svg: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.29c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.79 1.75-1.75 1.75zm13.5 10.29h-3v-4.5c0-1.07-.02-2.44-1.49-2.44-1.49 0-1.72 1.16-1.72 2.36v4.58h-3v-9h2.88v1.23h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.59v4.74z" />
        </svg>
      ),
    },
    {
      key: 'twitter',
      name: 'Twitter',
      href: 'https://twitter.com/UAPP_Global',
      bg: 'bg-sky-500',
      svg: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-8.38 4.482c-4.083-.205-7.702-2.159-10.126-5.134a4.822 4.822 0 00-.665 2.475c0 1.708.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616c-.054 2.385 1.67 4.615 4.13 5.104a4.935 4.935 0 01-2.224.084c.626 1.956 2.444 3.379 4.6 3.42A9.867 9.867 0 010 19.54a13.94 13.94 0 007.548 2.212c9.058 0 14.01-7.506 14.01-14.01 0-.213-.005-.425-.014-.636A10.012 10.012 0 0024 4.557z" />
        </svg>
      ),
    },
    {
      key: 'instagram',
      name: 'Instagram',
      href: 'https://www.instagram.com/uapp.uk/',
      bg: 'bg-pink-500',
      svg: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.337 3.608 1.312.975.975 1.25 2.242 1.312 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.337 2.633-1.312 3.608-.975.975-2.242 1.25-3.608 1.312-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.337-3.608-1.312-.975-.975-1.25-2.242-1.312-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.337-2.633 1.312-3.608.975-.975 2.242-1.25 3.608-1.312C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.77.131 4.602.401 3.6 1.403 2.598 2.406 2.328 3.573 2.27 4.855 2.211 6.135 2.199 6.545 2.199 12s.013 5.865.072 7.145c.058 1.282.328 2.449 1.33 3.452 1.002 1.002 2.17 1.272 3.452 1.33 1.28.059 1.689.072 7.146.072s5.865-.013 7.145-.072c1.282-.058 2.449-.328 3.452-1.33 1.002-1.002 1.272-2.17 1.33-3.452.059-1.28.072-1.689.072-7.145s-.013-5.865-.072-7.145c-.058-1.282-.328-2.449-1.33-3.452C20.449.401 19.282.131 18 .072 16.719.013 16.309 0 12 0z" />
          <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zM18.406 4.594a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Follow Us</h3>
          <p className="text-sm text-gray-600">Stay connected with our community</p>
        </div>

        <div className="mt-4 flex w-full gap-4 overflow-x-auto py-2">
          {cards.map((c) => (
            <Link
              key={c.key}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-[220px] items-center gap-3 rounded-2xl border border-gray-100 bg-white/90 px-4 py-3 shadow-sm hover:shadow-md"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-md text-white ${c.bg}`}>
                {c.svg}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                <span className="text-xs text-gray-500">Follow on {c.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
