import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin - Dynamic Blog Site',
  description: 'Admin panel for blog management',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
