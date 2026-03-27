'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  end: number
  duration?: number
  decimals?: number
  suffix?: string
  prefix?: string
  className?: string
}

export default function CountUp({ end, duration = 1200, decimals = 0, suffix = '', prefix = '', className = '' }: Props) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>()
  const startRef = useRef<number>()

  useEffect(() => {
    startRef.current = undefined
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(eased * end)
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [end, duration])

  return (
    <span className={className}>
      {prefix}{value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  )
}
