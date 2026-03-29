'use client'
import { useEffect, useRef, useState } from 'react'

function SlotCounter({ target, suffix, active }: { target: string; suffix: string; active: boolean }) {
  const [display, setDisplay] = useState('0')
  const startedRef = useRef(false)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (!active) { startedRef.current = false; setDisplay('0'); return }
    if (startedRef.current) return
    startedRef.current = true
    const chars = '0123456789'
    const num = parseFloat(target)
    const scrambleDuration = 1000
    const settleDuration = 600
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      if (elapsed < scrambleDuration) {
        const scrambled = target.split('').map(c => /\d/.test(c) ? chars[Math.floor(Math.random() * 10)] : c).join('')
        setDisplay(scrambled)
        rafRef.current = requestAnimationFrame(tick)
      } else if (elapsed < scrambleDuration + settleDuration) {
        const p = (elapsed - scrambleDuration) / settleDuration
        setDisplay(Math.floor((1 - Math.pow(1 - p, 3)) * num).toString())
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(target)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [active, target])

  return <span>{display}{suffix}</span>
}

function CountdownSnap({ active }: { active: boolean }) {
  const [display, setDisplay] = useState('60')
  const startedRef = useRef(false)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (!active) { startedRef.current = false; setDisplay('60'); return }
    if (startedRef.current) return
    startedRef.current = true
    const start = performance.now()
    const duration = 1600
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const val = Math.round(60 - (1 - Math.pow(1 - p, 3)) * 50)
      setDisplay(val < 10 ? `< ${val}` : val.toString())
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
      else setDisplay('< 10')
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [active])

  return <span>{display}<span style={{ fontSize: '1.8rem' }}>s</span></span>
}

function SlamCounter({ active }: { active: boolean }) {
  const [display, setDisplay] = useState('₹0')
  const startedRef = useRef(false)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (!active) { startedRef.current = false; setDisplay('₹0'); return }
    if (startedRef.current) return
    startedRef.current = true
    const peak = 847200
    const upDur = 1200
    const holdDur = 400
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      if (elapsed < upDur) {
        setDisplay(`₹${((1 - Math.pow(1 - elapsed / upDur, 2)) * peak / 100000).toFixed(1)}L`)
        rafRef.current = requestAnimationFrame(tick)
      } else if (elapsed < upDur + holdDur) {
        setDisplay(`₹${(peak / 100000).toFixed(1)}L`)
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay('₹0')
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [active])

  return <span>{display}</span>
}

function BinaryFlicker({ active }: { active: boolean }) {
  const [display, setDisplay] = useState('0')
  const startedRef = useRef(false)

  useEffect(() => {
    if (!active) { startedRef.current = false; setDisplay('0'); return }
    if (startedRef.current) return
    startedRef.current = true
    const seq = ['0','1','0','1','0','1','1','0','1','1','0','1','1','1','0','1','1','1','1','0','1','1','1','1','1','0','6']
    let i = 0
    const iv = setInterval(() => { setDisplay(seq[i]); i++; if (i >= seq.length) clearInterval(iv) }, 65)
    return () => clearInterval(iv)
  }, [active])

  return <span>{display}</span>
}

const STATS = [
  { id: 'slot', render: (a: boolean) => <SlotCounter target="14" suffix="Cr+" active={a} />, l: 'Demat Accounts in India', sub: 'and growing every day' },
  { id: 'countdown', render: (a: boolean) => <CountdownSnap active={a} />, l: 'Full Portfolio Analysis', sub: 'from PDF to AI insights' },
  { id: 'slam', render: (a: boolean) => <SlamCounter active={a} />, l: 'Commission Model', sub: 'we never charge you' },
  { id: 'binary', render: (a: boolean) => <BinaryFlicker active={a} />, l: 'Intelligence Dimensions', sub: 'for a complete picture' },
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
        <div key={s.id} className={`py-12 px-8 flex flex-col gap-2 group relative overflow-hidden ${i < 3 ? 'border-r border-white/[0.07]' : ''}`}>
          <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-[#e63329] -translate-x-full group-hover:translate-x-0 transition-transform duration-300 rounded-r" />
          <div className="absolute inset-0 bg-[#e63329]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-4xl md:text-5xl font-extrabold text-[#e63329] tracking-tighter relative z-10" style={{ fontVariantNumeric: 'tabular-nums', minHeight: '3.2rem', display: 'flex', alignItems: 'center' }}>
            {s.render(active)}
          </div>
          <span className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[#e5e2e1]/60 relative z-10">{s.l}</span>
          <span className="text-[0.6rem] text-[#e5e2e1]/30 uppercase tracking-widest relative z-10">{s.sub}</span>
        </div>
      ))}
    </div>
  )
}
