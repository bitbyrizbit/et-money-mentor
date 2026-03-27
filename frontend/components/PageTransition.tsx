'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTransition() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 500)
    return () => clearTimeout(t)
  }, [pathname])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        background: '#e63329',
        zIndex: 9998,
        transition: visible ? 'width 0.45s cubic-bezier(0.4,0,0.2,1)' : 'width 0.2s ease, opacity 0.2s ease',
        width: visible ? '100%' : '0%',
        opacity: visible ? 1 : 0,
        transformOrigin: 'left',
        pointerEvents: 'none',
        boxShadow: '0 0 12px rgba(230,51,41,0.6)',
      }}
    />
  )
}
