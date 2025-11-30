"use client"

import React from 'react'
import { usePathname } from 'next/navigation'

export default function ConditionalPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ''

  // If the route is under /admin, do not add the top padding
  const className = pathname.startsWith('/admin') ? '' : 'pt-20'

  return <div className={className}>{children}</div>
}
