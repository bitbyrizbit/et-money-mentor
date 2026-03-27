'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { IconXray, IconHeart, IconFire, IconArrow, IconLock } from '../components/Icons'

const TICKER = [
  { label: 'Average Indian investor XIRR', value: '8.2%', note: 'vs 12.3% Nifty 50' },
  { label: 'Expense drag over 20 years', value: '₹18L', note: 'on a ₹10L corpus' },
  { label: 'Indians without a financial plan', value: '95%', note: 'per SEBI survey 2024' },
  { label: 'Avg overlap in 5-fund portfolios', value: '62%', note: 'you own the same stocks twice' },
]

export default function Home() {
  const [tick, setTick] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const t = setInterval(() => setTick(p => (p + 1) % TICKER.length), 3200)
    return () => clearInterval(t)
  }, [])

  const tools = [
    {
      href: '/xray',
      icon: <IconXray size={20} />,
      tag: 'Most Popular',
      title: 'Portfolio X-Ray',
      desc: 'Upload your CAMS PDF. Get true XIRR, overlap analysis, expense drag, live benchmark comparison and an AI rebalancing plan in under 10 seconds.',
      cta: 'Run X-Ray',
    },
    {
      href: '/health-score',
      icon: <IconHeart size={20} />,
      tag: '5 minutes',
      title: 'Money Health Score',
      desc: 'A comprehensive financial wellness score across 6 dimensions — emergency fund, insurance, investments, debt, tax, retirement — with actionable fixes.',
      cta: 'Get Scored',
    },
    {
      href: '/fire',
      icon: <IconFire size={20} />,
      tag: 'India-first',
      title: 'FIRE Planner',
      desc: 'Your exact retirement corpus. Month-by-month SIP plan. Asset allocation roadmap. Tax optimisation. Built for Indian market realities.',
      cta: 'Plan Retirement',
    },
  ]

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '58px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0,
        background: 'rgba(8,8,8,0.92)',
        backdropFilter: 'blur(20px)',
        zIndex: 100,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '28px', height: '28px', background: 'var(--red)', borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '11px', color: 'white', letterSpacing: '-0.5px',
            transition: 'box-shadow 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(230,51,41,0.5)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
          >ET</div>
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', letterSpacing: '-0.3px' }}>Money Mentor</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted)' }}>
          <IconLock size={12} /> Your data is never stored
        </div>
      </nav>

      {/* live ticker */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        padding: '9px 40px',
        display: 'flex', alignItems: 'center', gap: '14px',
        overflow: 'hidden',
      }}>
        <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1.2px', whiteSpace: 'nowrap', fontWeight: 600 }}>
          Did you know
        </span>
        <div style={{ width: '1px', height: '14px', background: 'var(--border)' }} />
        <div key={tick} style={{ fontSize: '13px', animation: 'fadeUp 0.3s ease' }}>
          <span style={{ color: 'var(--red)', fontWeight: 700 }}>{TICKER[tick].value}</span>
          <span style={{ color: 'var(--muted-2)', margin: '0 6px' }}>—</span>
          <span style={{ color: 'var(--muted-2)' }}>{TICKER[tick].label}</span>
          <span style={{ color: 'var(--muted)', marginLeft: '8px', fontSize: '12px' }}>{TICKER[tick].note}</span>
        </div>
      </div>

      {/* hero */}
      <section style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '72px 40px 56px', textAlign: 'center',
        opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '5px 14px', borderRadius: '20px',
          border: '1px solid var(--border)',
          fontSize: '12px', color: 'var(--muted-2)', marginBottom: '32px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--green-bright)', display: 'inline-block',
            animation: 'pulse-ring 1.8s ease-out infinite',
          }} />
          Built for ET AI Hackathon 2026
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 6.5vw, 76px)',
          fontWeight: 800,
          lineHeight: 1.0,
          letterSpacing: '-2.5px',
          marginBottom: '20px',
          maxWidth: '800px',
        }}>
          Your money deserves<br />
          <span style={{ color: 'var(--red)' }}>honest intelligence.</span>
        </h1>

        <p style={{
          fontSize: '16px', color: 'var(--muted-2)', maxWidth: '480px',
          lineHeight: 1.7, marginBottom: '48px', fontWeight: 400,
        }}>
          Financial advisors charge ₹25,000/year and serve only HNIs.
          We give you the same intelligence — free, instant, brutally honest.
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(272px, 1fr))',
          gap: '14px', width: '100%', maxWidth: '940px', textAlign: 'left',
        }}>
          {tools.map((t, i) => (
            <Link key={t.href} href={t.href} style={{ textDecoration: 'none' }}>
              <div
                className="card"
                style={{
                  display: 'flex', flexDirection: 'column', height: '100%',
                  cursor: 'pointer',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'none' : 'translateY(14px)',
                  transition: `opacity 0.4s ease ${i * 0.08 + 0.3}s, transform 0.4s ease ${i * 0.08 + 0.3}s, border-color 0.2s, box-shadow 0.2s`,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--border-bright)'
                  el.style.transform = 'translateY(-3px)'
                  el.style.boxShadow = '0 20px 48px rgba(0,0,0,0.5)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--border)'
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'var(--red-dim)', color: 'var(--red)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{t.icon}</div>
                  <span style={{
                    fontSize: '11px', padding: '3px 9px', borderRadius: '20px',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    color: 'var(--muted)', fontWeight: 500,
                  }}>{t.tag}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '17px', marginBottom: '10px', letterSpacing: '-0.3px' }}>{t.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--muted-2)', lineHeight: 1.65, flex: 1 }}>{t.desc}</p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  marginTop: '22px', color: 'var(--red)', fontSize: '13px', fontWeight: 600,
                }}>
                  {t.cta} <IconArrow size={13} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* stats row */}
      <div style={{
        borderTop: '1px solid var(--border)',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      }}>
        {[
          { n: '14Cr+', l: 'Demat accounts in India' },
          { n: '< 10s', l: 'Full portfolio analysis' },
          { n: '₹0', l: 'Cost to use, forever' },
          { n: '6', l: 'Financial health dimensions' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '24px 32px',
            borderRight: i < 3 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--red)', letterSpacing: '-0.5px', marginBottom: '4px' }}>{s.n}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      <footer style={{
        padding: '18px 40px', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '12px', color: 'var(--muted)',
      }}>
        <span>ET Money Mentor · ET AI Hackathon 2026</span>
        <span>Not SEBI registered · For informational purposes only</span>
      </footer>
    </main>
  )
}
