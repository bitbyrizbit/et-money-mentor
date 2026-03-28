'use client'
import { useEffect, useRef, useState } from 'react'

// Smooth count-up hook — stable, no jank
function useCountUp(from: number, to: number, duration: number, active: boolean) {
  const [val, setVal] = useState(from)
  const rafRef = useRef<number>()
  const startRef = useRef<number>()
  const runningRef = useRef(false)

  useEffect(() => {
    if (!active) {
      runningRef.current = false
      cancelAnimationFrame(rafRef.current!)
      setVal(from)
      return
    }
    if (runningRef.current) return
    runningRef.current = true
    startRef.current = undefined

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now
      const p = Math.min((now - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(from + eased * (to - from)))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current!)
  }, [active, from, to, duration])

  return val
}

// Effect 1: 10 → 14Cr+
function CrCounter({ active }: { active: boolean }) {
  const val = useCountUp(10, 14, 1800, active)
  return <span>{val}Cr+</span>
}

// Effect 2: 60s → 10s countdown (count-down version)
function CountdownCounter({ active }: { active: boolean }) {
  const val = useCountUp(60, 10, 1800, active)
  return (
    <span>
      &lt;&nbsp;{val}<span style={{ fontSize: '1.5rem', marginLeft: '2px' }}>s</span>
    </span>
  )
}

// Effect 3: Clean ₹0 — no unstable animation, just a bold static reveal
// with a subtle "savings saved" pulse on entry
function ZeroFeeDisplay({ active }: { active: boolean }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!active) { setShow(false); return }
    const t = setTimeout(() => setShow(true), 200)
    return () => clearTimeout(t)
  }, [active])

  return (
    <span
      style={{
        display: 'inline-block',
        opacity: show ? 1 : 0,
        transform: show ? 'scale(1)' : 'scale(0.85)',
        transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        letterSpacing: '-2px',
      }}
    >
      ₹0
    </span>
  )
}

// Effect 4: step counter 1→6 with timing gaps
function StepCounter({ active }: { active: boolean }) {
  const [val, setVal] = useState(0)
  const runRef = useRef(false)

  useEffect(() => {
    if (!active) { runRef.current = false; setVal(0); return }
    if (runRef.current) return
    runRef.current = true

    const delays = [100, 160, 130, 190, 150, 210]
    let acc = 0
    const timers: ReturnType<typeof setTimeout>[] = []
    ;[1, 2, 3, 4, 5, 6].forEach((v, i) => {
      acc += delays[i]
      timers.push(setTimeout(() => setVal(v), acc))
    })
    return () => timers.forEach(clearTimeout)
  }, [active])

  return <span>{val}</span>
}

const STATS = [
  {
    id: 'cr',
    label: 'Demat Accounts in India',
    sub: 'growing every day',
    render: (active: boolean) => <CrCounter active={active} />,
  },
  {
    id: 'countdown',
    label: 'Full Portfolio Analysis',
    sub: 'from PDF to AI insights',
    render: (active: boolean) => <CountdownCounter active={active} />,
  },
  {
    id: 'fee',
    label: 'Commission Model',
    sub: 'we don\'t charge you — ever',
    render: (active: boolean) => <ZeroFeeDisplay active={active} />,
  },
  {
    id: 'step',
    label: 'Intelligence Dimensions',
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
          setTimeout(() => setActive(true), 80)
        } else {
          setActive(false)
        }
      },
      { threshold: 0.35 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 md:grid-cols-4 border-y border-white/[0.07]"
      style={{ position: 'relative', zIndex: 1 }}
    >
      {STATS.map((s, i) => (
        <div
          key={s.id}
          className={`py-12 px-8 flex flex-col gap-2 group relative overflow-hidden${
            i < 3 ? ' border-r border-white/[0.07]' : ''
          }`}
        >
          {/* left accent bar on hover */}
          <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#e63329] -translate-x-full group-hover:translate-x-0 transition-transform duration-300 rounded-r" />
          {/* bg glow on hover */}
          <div className="absolute inset-0 bg-[#e63329]/[0.025] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div
            className="text-4xl md:text-5xl font-extrabold text-[#e63329] tracking-tighter relative z-10"
            style={{
              fontVariantNumeric: 'tabular-nums',
              minHeight: '3.5rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {s.render(active)}
          </div>
          <span className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[#e5e2e1]/60 relative z-10">
            {s.label}
          </span>
          <span className="text-[0.6rem] text-[#e5e2e1]/30 uppercase tracking-widest relative z-10">
            {s.sub}
          </span>
        </div>
      ))}
    </div>
  )
}