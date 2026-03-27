'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const Loader = dynamic(() => import('./Loader'), { ssr: false })

const SESSION_KEY = 'et_loader_done'

export default function AppShell({ children }: { children: React.ReactNode }) {
  // true = loader already shown this session, skip it
  const [skip, setSkip] = useState(true)   // start true to avoid flash
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const already = sessionStorage.getItem(SESSION_KEY)
    if (already) {
      // already showed loader this session — go straight to content
      setSkip(true)
      setVisible(true)
    } else {
      // first load — show loader
      setSkip(false)
      setVisible(false)
    }
  }, [])

  function handleLoaderDone() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setSkip(true)
    setTimeout(() => setVisible(true), 60)
  }

  if (!mounted) {
    // SSR / hydration — render nothing visible yet, no flash
    return <div style={{ opacity: 0 }}>{children}</div>
  }

  return (
    <>
      {!skip && <Loader onDone={handleLoaderDone} />}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        {children}
      </div>
    </>
  )
}