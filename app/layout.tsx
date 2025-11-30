import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ConfirmProvider } from '@/components/WarningModal'
import LayoutWrapper from '@/components/LayoutWrapper'
import ConditionalPadding from '@/components/ConditionalPadding'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dynamic Blog Site',
  description: 'A modern blog platform built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfirmProvider>
          {/* add top padding so fixed header doesn't overlap page content (disabled for /admin) */}
          <LayoutWrapper>
            <ConditionalPadding>{children}</ConditionalPadding>
          </LayoutWrapper>
        </ConfirmProvider>
      </body>
    </html>
  )
}