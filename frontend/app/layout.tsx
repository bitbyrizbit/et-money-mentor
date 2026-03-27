import type { Metadata } from 'next'
import './globals.css'
import AppShell from '../components/AppShell'

export const metadata: Metadata = {
  title: 'ET Money Mentor — AI Financial Intelligence',
  description: 'Upload your CAMS statement. Get your true XIRR, portfolio overlaps, expense drag and an AI rebalancing plan in under 10 seconds.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;600;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
