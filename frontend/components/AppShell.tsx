'use client'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const Loader = dynamic(() => import('./Loader'), { ssr: false })

const SESSION_KEY = 'et_loader_done'

export default function AppShell({ children }: { children: React.ReactNode }) {
  // Three states:
  // 'pending'  — haven't checked sessionStorage yet (SSR / hydration)
  // 'loader'   — first visit, show loader
  // 'content'  — skip loader, show content
  const [mode, setMode] = useState<'pending' | 'loader' | 'content'>('pending')
  const [contentVisible, setContentVisible] = useState(false)

  useEffect(() => {
    // Only runs client-side — safe to read sessionStorage
    const alreadySeen = sessionStorage.getItem(SESSION_KEY)
    if (alreadySeen) {
      // Returning visitor this session — skip loader entirely
      setMode('content')
      // Small tick so opacity transition fires
      requestAnimationFrame(() => setContentVisible(true))
    } else {
      // Genuine first load — show loader
      setMode('loader')
    }
  }, [])

  function handleLoaderDone() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setMode('content')
    requestAnimationFrame(() => setContentVisible(true))
  }

  // During SSR / before hydration — render children hidden so
  // Next.js doesn't produce a blank shell
  if (mode === 'pending') {
    return (
      <div style={{ opacity: 0, pointerEvents: 'none' }} aria-hidden>
        {children}
      </div>
    )
  }

  return (
    <>
      {mode === 'loader' && <Loader onDone={handleLoaderDone} />}
      <div
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: 'opacity 0.45s ease',
          // While loader is showing, keep children in DOM but hidden
          // so fonts / images pre-load — avoids layout shift after loader
          pointerEvents: contentVisible ? 'auto' : 'none',
          visibility: mode === 'loader' && !contentVisible ? 'hidden' : 'visible',
        }}
      >
        {children}
      </div>
    </>
  )
}