'use client'
import { useEffect, useRef, useState } from 'react'

// Effect 1: 10 → 14 smooth count-up for 14Cr+
function CrCounter({ active }: { active: boolean }) {
  const [val, setVal] = useState(10)
  const ref = useRef(false)
  const raf = useRef<any>()

  useEffect(() => {
    if (!active) { ref.current = false; setVal(10); return }
    if (ref.current) return
    ref.current = true
    const start = performance.now()
    const from = 10, to = 14, dur = 1600
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

// Effect 2: 60s → 10s smooth countdown
function CountdownCounter({ active }: { active: boolean }) {
  const [val, setVal] = useState(60)
  const ref = useRef(false)
  const raf = useRef<any>()

  useEffect(() => {
    if (!active) { ref.current = false; setVal(60); return }
    if (ref.current) return
    ref.current = true
    const start = performance.now()
    const from = 60, to = 10, dur = 1800
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      // ease-in so it starts fast, slows near 10
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
      setVal(Math.round(from - eased * (from - to)))
      if (p < 1) raf.current = requestAnimationFrame(tick)
      else setVal(10)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [active])

  return <span>&lt; {val}<span style={{ fontSize: '1.5rem' }}>s</span></span>
}

// Effect 3: counts up ₹2L → ₹8L then snaps to ₹0
function SlamCounter({ active }: { active: boolean }) {
  const [display, setDisplay] = useState('₹0')
  const ref = useRef(false)
  const raf = useRef<any>()

  useEffect(() => {
    if (!active) { ref.current = false; setDisplay('₹0'); return }
    if (ref.current) return
    ref.current = true

    const upDur = 1200, holdDur = 400
    const from = 200000, peak = 847200
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      if (elapsed < upDur) {
        const p = elapsed / upDur
        const eased = 1 - Math.pow(1 - p, 2)
        const v = from + eased * (peak - from)
        setDisplay(`₹${(v / 100000).toFixed(1)}L`)
        raf.current = requestAnimationFrame(tick)
      } else if (elapsed < upDur + holdDur) {
        setDisplay(`₹${(peak / 100000).toFixed(1)}L`)
        raf.current = requestAnimationFrame(tick)
      } else {
        setDisplay('₹0')
      }
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [active])

  return <span>{display}</span>
}

// Effect 4: 1 → 2 → 3 → 4 → 5 → 6 with slight stutter
function StepCounter({ active }: { active: boolean }) {
  const [val, setVal] = useState(0)
  const ref = useRef(false)

  useEffect(() => {
    if (!active) { ref.current = false; setVal(0); return }
    if (ref.current) return
    ref.current = true

    // steps up with slight irregular timing for character
    const steps = [1, 2, 3, 4, 5, 6]
    const delays = [120, 180, 140, 200, 160, 220]
    let accumulated = 0
    const timers: ReturnType<typeof setTimeout>[] = []
    steps.forEach((v, i) => {
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
    id: 'slam',
    l: 'Commission Model',
    sub: 'we don\'t charge you — ever',
    render: (active: boolean) => <SlamCounter active={active} />,
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
          className={`py-12 px-8 flex flex-col gap-2 group relative overflow-hidden ${i < 3 ? 'border-r border-white/[0.07]' : ''}`}
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
