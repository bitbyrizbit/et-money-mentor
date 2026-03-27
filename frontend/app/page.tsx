'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import StatsBar from '../components/StatsBar'

const SpinningCoin = dynamic(() => import('../components/SpinningCoin'), { ssr: false })
const ThreeBackground = dynamic(() => import('../components/ThreeBackground'), { ssr: false })

export default function Home() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const tools = [
    { href: '/xray', icon: 'analytics', tag: 'Most Popular', title: 'Portfolio X-Ray', accent: 'Deep Asset Audit', desc: 'Uncover hidden risks, overlapping exposures and true XIRR across your entire mutual fund portfolio.', cta: 'START AUDIT' },
    { href: '/health-score', icon: 'monitoring', tag: '5 Minutes', title: 'Money Health Score', accent: 'Instant Diagnostic', desc: 'A comprehensive 360° evaluation of your financial resilience, liquidity, and growth trajectory.', cta: 'CALCULATE SCORE' },
    { href: '/fire', icon: 'psychology', tag: 'India-First', title: 'FIRE Planner', accent: 'Sovereign Exit Strategy', desc: 'Localised models built for Indian inflation, tax regimes, and your exact retirement timeline.', cta: 'PLAN RETIREMENT' },
  ]

  return (
    <>
      <ThreeBackground />
      <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease', position: 'relative', zIndex: 1 }}>

        {/* nav */}
        <header className="fixed top-0 w-full flex justify-between items-center px-8 h-16 z-50"
          style={{ background: 'rgba(8,8,8,0.75)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-[#e5e2e1]" style={{ textDecoration: 'none' }}>
              <div
                className="bg-[#e63329] w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(230,51,41,0.55)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
              >
                <span className="text-white text-sm font-black tracking-tighter">ET</span>
              </div>
              <span className="tracking-tight">Money Mentor</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wider opacity-60">Your data is never stored</span>
            <span className="material-symbols-outlined text-[#e63329] text-sm">lock</span>
          </div>
        </header>

        {/* ticker */}
        <div className="fixed top-16 w-full border-y border-white/[0.03] h-8 z-40 overflow-hidden flex items-center"
          style={{ background: 'rgba(17,17,17,0.9)', backdropFilter: 'blur(10px)' }}>
          <div className="flex gap-12 whitespace-nowrap px-8 animate-marquee">
            {[
              { l: 'MARKET INSIGHT:', t: "AVERAGE INDIAN XIRR IS 8.2% — VS NIFTY 50'S 12.3%" },
              { l: 'RISK ALERT:', t: "95% OF INDIANS DON'T HAVE A FINANCIAL PLAN" },
              { l: 'MENTOR TIP:', t: 'SWITCHING TO DIRECT PLANS SAVES ₹18L OVER 20 YEARS' },
              { l: 'FACT:', t: 'AVERAGE PORTFOLIO OVERLAP IN 5-FUND PORTFOLIOS IS 62%' },
              { l: 'MARKET INSIGHT:', t: "AVERAGE INDIAN XIRR IS 8.2% — VS NIFTY 50'S 12.3%" },
              { l: 'RISK ALERT:', t: "95% OF INDIANS DON'T HAVE A FINANCIAL PLAN" },
              { l: 'MENTOR TIP:', t: 'SWITCHING TO DIRECT PLANS SAVES ₹18L OVER 20 YEARS' },
              { l: 'FACT:', t: 'AVERAGE PORTFOLIO OVERLAP IN 5-FUND PORTFOLIOS IS 62%' },
            ].map((item, i) => (
              <p key={i} className="text-[0.6875rem] font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="text-[#e63329]">{item.l}</span>
                <span className="text-[#e5e2e1]/80">{item.t}</span>
              </p>
            ))}
          </div>
        </div>

        <main className="pt-32 pb-24 max-w-7xl mx-auto px-8">
          {/* hero */}
          <section className="mb-32 flex flex-col items-center text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.07] text-[0.6875rem] text-[#e5e2e1]/60 mb-10"
              style={{
                background: 'rgba(17,17,17,0.6)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(8px)',
                transition: 'opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" style={{ animation: 'pulseRing 1.8s ease-out infinite' }} />
              Built for ET AI Hackathon 2026
            </div>

            <h1
              className="text-[3.5rem] md:text-[5rem] font-extrabold tracking-[-2px] leading-[1.1] max-w-4xl mb-8"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(16px)',
                transition: 'opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s',
              }}
            >
              Your{' '}
              <span className="inline-flex items-center">
                <span className="text-[#c8920a]">m</span>
                <SpinningCoin size={68} />
                <span className="text-[#c8920a]">ney</span>
              </span>
              {' '}deserves<br />
              <span className="text-[#e63329]">honest intelligence.</span>
            </h1>

            <p
              className="text-lg md:text-xl font-light text-[#e5e2e1]/50 max-w-2xl leading-relaxed mb-10"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(14px)',
                transition: 'opacity 0.5s ease 0.22s, transform 0.5s ease 0.22s',
              }}
            >
              Financial advisors charge ₹25,000/year and serve only HNIs.
              We give you the same intelligence — free, instant, brutally honest.
            </p>

            <div
              className="flex gap-4"
              style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.3s' }}
            >
              <Link href="/xray">
                <button
                  className="bg-[#e63329] text-white px-8 py-4 rounded-[10px] font-bold transition-all hover:-translate-y-0.5 active:scale-95"
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(230,51,41,0.4)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
                >
                  Analyze My Portfolio
                </button>
              </Link>
              <Link href="/xray">
                <button className="border border-[#5c403c] text-[#e5e2e1] px-8 py-4 rounded-[10px] font-bold hover:bg-[#111111] transition-all">
                  View Demo
                </button>
              </Link>
            </div>
          </section>

          {/* feature cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
            {tools.map((t, i) => (
              <Link key={t.href} href={t.href} style={{ textDecoration: 'none' }}>
                <div
                  className="group relative rounded-2xl p-8 overflow-hidden transition-all hover:-translate-y-1 cursor-pointer h-full flex flex-col"
                  style={{
                    background: 'rgba(17,17,17,0.85)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(12px)',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'none' : 'translateY(20px)',
                    transition: `opacity 0.5s ease ${i * 0.1 + 0.3}s, transform 0.5s ease ${i * 0.1 + 0.3}s, border-color 0.2s, box-shadow 0.2s`,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'rgba(230,51,41,0.3)'
                    el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.6)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'rgba(255,255,255,0.06)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  <div className="card-hover-line absolute top-0 left-0 h-0.5 bg-[#e63329]" />
                  <div className="absolute top-6 right-6 px-2 py-1 bg-[#e63329]/10 rounded-full">
                    <span className="text-[0.6rem] font-bold text-[#e63329] uppercase tracking-widest">{t.tag}</span>
                  </div>
                  <div className="w-12 h-12 bg-[#e63329]/10 rounded-xl flex items-center justify-center mb-8">
                    <span className="material-symbols-outlined text-[#e63329]">{t.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t.title}</h3>
                  <p className="text-[#e63329] text-sm font-semibold mb-4 uppercase tracking-tighter">{t.accent}</p>
                  <p className="text-sm font-light text-[#e5e2e1]/50 mb-8 leading-relaxed flex-1">{t.desc}</p>
                  <div className="inline-flex items-center gap-2 text-[#e63329] font-bold text-sm group-hover:gap-3 transition-all">
                    {t.cta} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-20 bg-[#e63329]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </section>

          <StatsBar />
        </main>

        <footer className="border-t border-white/[0.07] py-16 px-8" style={{ background: 'rgba(8,8,8,0.9)' }}>
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
            <div className="text-[#e63329] font-bold text-xl">ET Money Mentor</div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
              {['Privacy Protocol', 'Security Standards', 'Terms of Intelligence'].map(l => (
                <span key={l} className="text-[0.6875rem] font-semibold uppercase tracking-widest text-[#e5e2e1]/40 hover:text-[#e5e2e1] transition-colors cursor-pointer">{l}</span>
              ))}
            </div>
            <p className="text-sm font-light text-[#e5e2e1]/30 max-w-xl">
              ET Money Mentor. Built for ET AI Hackathon 2026. Not SEBI registered. For informational purposes only.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
