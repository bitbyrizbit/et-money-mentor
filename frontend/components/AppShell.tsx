'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const Loader = dynamic(() => import('./Loader'), { ssr: false })
const SESSION_KEY = 'et_loader_done'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'pending' | 'loader' | 'content'>('pending')
  const [contentVisible, setContentVisible] = useState(false)
  const [scroll, setScroll] = useState(0)

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(SESSION_KEY)
    if (alreadySeen) {
      setMode('content')
      requestAnimationFrame(() => setContentVisible(true))
    } else {
      setMode('loader')
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      setScroll(total > 0 ? (el.scrollTop / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleLoaderDone() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setMode('content')
    requestAnimationFrame(() => setContentVisible(true))
  }

  if (mode === 'pending') {
    return (
      <div style={{ opacity: 0, pointerEvents: 'none' }} aria-hidden>
        {children}
      </div>
    )
  }

  return (
    <>
      <div style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9998,
        height: '2px', background: '#e63329',
        width: `${scroll}%`,
        transition: 'width 0.1s linear',
        pointerEvents: 'none',
        boxShadow: '0 0 8px rgba(230,51,41,0.6)',
      }} />
      {mode === 'loader' && <Loader onDone={handleLoaderDone} />}
      <div style={{
        opacity: contentVisible ? 1 : 0,
        transition: 'opacity 0.45s ease',
        pointerEvents: contentVisible ? 'auto' : 'none',
        visibility: mode === 'loader' && !contentVisible ? 'hidden' : 'visible',
      }}>
        {children}
      </div>
    </>
  )
}
