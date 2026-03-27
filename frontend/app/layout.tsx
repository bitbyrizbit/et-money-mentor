import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ET Money Mentor — AI Financial Intelligence',
  description: 'Upload your CAMS statement. Get your true XIRR, portfolio overlaps, expense drag and an AI rebalancing plan in under 10 seconds.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
