'use client'
import { useEffect, useRef, useState } from 'react'

// Effect 1: 10 → 14 smooth count-up
function CrCounter({ active }: { active: boolean }) {
  const [val, setVal] = useState(10)
  const started = useRef(false)
  const raf = useRef<any>()

  useEffect(() => {
    if (!active) { started.current = false; setVal(10); return }
    if (started.current) return
    started.current = true
    const from = 10, to = 14, dur = 1600
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(from + eased * (to - from)))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [active])

  return <span>{val}Cr+</span>
}

// Effect 2: 60 → 10 strict one-way countdown, never goes back up
function CountdownCounter({ active }: { active: boolean }) {
  const [val, setVal] = useState(60)
  const started = useRef(false)
  const raf = useRef<any>()

  useEffect(() => {
    if (!active) { started.current = false; setVal(60); return }
    if (started.current) return
    started.current = true
    const from = 60, to = 10, dur = 1800
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const eased = p * p  // ease-in only — starts fast, slows at 10
      const current = Math.round(from - eased * (from - to))
      setVal(current)
      if (p < 1) raf.current = requestAnimationFrame(tick)
      else setVal(to)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [active])

  return <span>&lt;&nbsp;{val}<span style={{ fontSize: '1.5rem' }}>s</span></span>
}

// Effect 3: static ₹0 — no animation, clean and confident
function ZeroCounter() {
  return <span>₹0</span>
}

// Effect 4: 1 → 2 → 3 → 4 → 5 → 6 stepping up cleanly
function StepCounter({ active }: { active: boolean }) {
  const [val, setVal] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!active) { started.current = false; setVal(0); return }
    if (started.current) return
    started.current = true

    const delays = [100, 180, 160, 200, 170, 220]
    let accumulated = 0
    const timers: ReturnType<typeof setTimeout>[] = []
    ;[1, 2, 3, 4, 5, 6].forEach((v, i) => {
      accumulated += delays[i]
      const t = setTimeout(() => setVal(v), accumulated)
      timers.push(t)
    })
    return () => timers.forEach(clearTimeout)
  }, [active])

  return <span>{val}</span>
}

const STATS = [
  {
    id: 'cr',
    l: 'Demat Accounts in India',
    sub: 'growing every day',
    render: (active: boolean) => <CrCounter active={active} />,
  },
  {
    id: 'countdown',
    l: 'Full Portfolio Analysis',
    sub: 'from PDF to AI insights',
    render: (active: boolean) => <CountdownCounter active={active} />,
  },
  {
    id: 'zero',
    l: 'Commission Model',
    sub: "we don't charge you — ever",
    render: (_: boolean) => <ZeroCounter />,
  },
  {
    id: 'step',
    l: 'Intelligence Dimensions',
    sub: 'for a complete financial picture',
    render: (active: boolean) => <StepCounter active={active} />,
  },
]

export default function StatsBar() {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(false)
          setTimeout(() => setActive(true), 100)
        } else {
          setActive(false)
        }
      },
      { threshold: 0.4 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 border-y border-white/[0.07]" style={{ position: 'relative', zIndex: 1 }}>
      {STATS.map((s, i) => (
        <div
          key={s.id}
          className={`py-8 px-5 md:py-12 md:px-8 flex flex-col gap-2 group relative overflow-hidden ${i < 3 ? 'border-r border-white/[0.07]' : ''}`}
        >
          <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#e63329] -translate-x-full group-hover:translate-x-0 transition-transform duration-300 rounded-r" />
          <div className="absolute inset-0 bg-[#e63329]/[0.025] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div
            className="text-4xl md:text-5xl font-extrabold text-[#e63329] tracking-tighter relative z-10"
            style={{ fontVariantNumeric: 'tabular-nums', minHeight: '3.5rem', display: 'flex', alignItems: 'center' }}
          >
            {s.render(active)}
          </div>
          <span className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[#e5e2e1]/60 relative z-10">{s.l}</span>
          <span className="text-[0.6rem] text-[#e5e2e1]/30 uppercase tracking-widest relative z-10">{s.sub}</span>
        </div>
      ))}
    </div>
  )
}
