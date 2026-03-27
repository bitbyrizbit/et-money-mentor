'use client'
import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import Nav from '../../components/Nav'
import CountUp from '../../components/CountUp'
import { IconUpload, IconAlert, IconSpinner, IconLock, IconCheck, IconTrend, IconPlay } from '../../components/Icons'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function fmtVal(n: number) {
  if (n >= 10000000) return { val: (n / 10000000).toFixed(2), unit: 'Cr' }
  if (n >= 100000) return { val: (n / 100000).toFixed(2), unit: 'L' }
  return { val: n.toLocaleString('en-IN'), unit: '' }
}

// sample demo data shown when no real CAMS file is available
const DEMO_RESULT = {
  investor_name: "Rahul Sharma",
  total_value: 1842500,
  fund_count: 6,
  overall_xirr: 9.4,
  funds: [
    { name: "Axis Bluechip Fund - Direct Growth", value: 420000, xirr: 11.2, expense_ratio: 0.5, closing_units: 1240.5 },
    { name: "HDFC Top 100 Fund - Regular Growth", value: 380000, xirr: 8.1, expense_ratio: 1.5, closing_units: 890.2 },
    { name: "Mirae Asset Large Cap Fund - Regular", value: 310000, xirr: 9.8, expense_ratio: 1.5, closing_units: 760.1 },
    { name: "Kotak Emerging Equity Fund - Regular", value: 290000, xirr: 10.4, expense_ratio: 1.6, closing_units: 540.8 },
    { name: "SBI Small Cap Fund - Regular Growth", value: 250000, xirr: 14.2, expense_ratio: 1.8, closing_units: 320.4 },
    { name: "HDFC Top 100 Fund - Direct Growth", value: 192500, xirr: 9.9, expense_ratio: 0.5, closing_units: 420.6 },
  ],
  overlap: {
    portfolio_overlap_score: 58.3,
    pairs: [
      { fund_a: "Axis Bluechip Fund - Direct Growth", fund_b: "Mirae Asset Large Cap Fund - Regular", overlap_pct: 71.4, shared_stocks: ["Reliance", "HDFC Bank", "Infosys", "TCS"] },
      { fund_a: "HDFC Top 100 Fund - Regular Growth", fund_b: "Mirae Asset Large Cap Fund - Regular", overlap_pct: 65.2, shared_stocks: ["HDFC Bank", "ICICI Bank", "Infosys", "L&T"] },
      { fund_a: "HDFC Top 100 Fund - Regular Growth", fund_b: "HDFC Top 100 Fund - Direct Growth", overlap_pct: 98.1, shared_stocks: ["Reliance", "HDFC Bank", "ICICI Bank", "TCS", "SBI"] },
    ]
  },
  expense_drag: {
    weighted_expense_ratio: 1.28,
    total_invested: 1842500,
    annual_drag: 23584,
    expense_drag_20yr: 847200,
    switching_to_direct_gain: 621400,
    gross_corpus_20yr: 17840000,
    net_corpus_20yr: 16992800,
  },
  ai_report: `## Portfolio Health: 5.5/10

## What's Working
The inclusion of SBI Small Cap Fund has delivered strong alpha at 14.2% XIRR. The overall portfolio of ₹18.4L shows disciplined long-term investing behavior. Direct plan exposure in Axis Bluechip is a positive step in cost consciousness.

## The Hard Truth
You are running two funds that are 98.1% identical — HDFC Top 100 Regular and HDFC Top 100 Direct. This is not diversification, it is duplication. The Regular plan is silently costing you ₹23,584 every single year in excess fees. At your corpus size, switching entirely to Direct plans would recover ₹6.2L over 20 years. The 3 large-cap funds (Axis, HDFC Top 100, Mirae) have 65–71% overlap and are collectively over-representing the same 10 stocks.

## Rebalancing Plan
**Exit immediately:** HDFC Top 100 Regular Growth — merge into the Direct plan you already hold. **Consolidate:** Reduce to one large-cap fund (keep Axis Bluechip Direct, exit Mirae Regular). **Add:** One flexi-cap fund (Parag Parikh Flexi Cap Direct) for international diversification. **Retain:** Kotak Emerging Equity and SBI Small Cap — these are differentiated and performing.

## The One Thing To Do This Week
Call your broker and switch HDFC Top 100 Regular to Direct. Takes 10 minutes. Saves ₹12,000 per year starting immediately.`,
}

function StatCard({ label, value, unit, color, sub }: any) {
  const parsed = parseFloat(value)
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
        {!isNaN(parsed) ? (
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: 800, color, letterSpacing: '-1px' }}>
            <CountUp end={parsed} decimals={value.includes('.') ? 1 : 0} />
          </span>
        ) : (
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: 800, color, letterSpacing: '-1px' }}>{value}</span>
        )}
        {unit && <span style={{ fontSize: '16px', fontWeight: 600, color }}>{unit}</span>}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', opacity: 0.7 }}>{sub}</div>}
    </div>
  )
}

export default function XRayPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') setFile(f)
  }, [])

  async function handleAnalyze() {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch(`${API}/api/xray`, { method: 'POST', body: form })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Analysis failed')
      }
      setResult(await res.json())
      setIsDemo(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function loadDemo() {
    setResult(DEMO_RESULT)
    setIsDemo(true)
    setError('')
  }

  const tv = result ? fmtVal(result.total_value) : { val: '0', unit: '' }
  const ad = result ? fmtVal(result.expense_drag.annual_drag) : { val: '0', unit: '' }
  const d20 = result ? fmtVal(result.expense_drag.expense_drag_20yr) : { val: '0', unit: '' }

  return (
    <>
      <Nav />
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '36px', fontWeight: 800, letterSpacing: '-1px' }}>
              Portfolio <span style={{ color: 'var(--red)' }}>X-Ray</span>
            </h1>
            {isDemo && (
              <span style={{
                fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
                background: 'rgba(230,51,41,0.1)', border: '1px solid rgba(230,51,41,0.3)',
                color: 'var(--red)',
              }}>Demo Mode</span>
            )}
          </div>
          <p style={{ color: 'var(--muted-2)', fontSize: '14px' }}>
            Upload your CAMS or KFintech consolidated statement for a complete portfolio diagnosis.
          </p>
        </div>

        {!result && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div className="card">
              <div
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => document.getElementById('fi')?.click()}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--red)' : 'var(--border)'}`,
                  borderRadius: '12px', padding: '52px 24px',
                  textAlign: 'center', cursor: 'pointer',
                  background: dragOver ? 'var(--red-dim)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: 'var(--surface-2)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', color: 'var(--muted)',
                }}>
                  <IconUpload size={24} />
                </div>
                {file ? (
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '15px' }}>{file.name}</p>
                    <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>{(file.size / 1024).toFixed(0)} KB · PDF</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>Drop your CAMS PDF here</p>
                    <p style={{ color: 'var(--muted)', fontSize: '13px' }}>or click to browse · PDF only</p>
                  </div>
                )}
              </div>
              <input id="fi" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={handleAnalyze} disabled={!file || loading}
                  className="btn btn-red" style={{ flex: 1 }}
                >
                  {loading ? <><IconSpinner size={16} /> Analysing portfolio...</> : 'Analyse Portfolio →'}
                </button>
                <button onClick={loadDemo} className="btn btn-ghost" style={{ gap: '6px' }}>
                  <IconPlay size={13} /> Demo
                </button>
              </div>

              {error && (
                <div style={{
                  marginTop: '14px', padding: '12px 16px', borderRadius: '10px',
                  background: 'rgba(230,51,41,0.08)', border: '1px solid rgba(230,51,41,0.2)',
                  color: '#f87171', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start',
                }}>
                  <IconAlert size={16} />
                  {error}
                </div>
              )}

              <div style={{
                marginTop: '16px', padding: '14px 16px', borderRadius: '10px',
                background: 'var(--surface-2)', display: 'flex', alignItems: 'flex-start', gap: '10px',
              }}>
                <IconLock size={14} style={{ color: 'var(--muted)', marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
                  Your statement is processed in memory and <strong style={{ color: 'var(--muted-2)' }}>never stored or logged</strong>.{' '}
                  <strong style={{ color: 'var(--muted-2)' }}>Get your CAMS statement:</strong>{' '}
                  camsonline.com → Mailback Requests → Consolidated Account Statement → email to yourself.
                </p>
              </div>
            </div>

            {/* what you get preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { icon: <IconTrend size={16} up />, title: 'True XIRR', desc: 'Not the NAV return. Your actual annualised return accounting for every SIP timing.' },
                { icon: <IconAlert size={16} />, title: 'Overlap Analysis', desc: 'Find which of your funds are secretly investing in the same 10 stocks.' },
                { icon: <IconTrend size={16} up={false} />, title: 'Expense Drag', desc: 'Exactly how much fees are costing you this year and over 20 years.' },
                { icon: <IconCheck size={16} />, title: 'AI Rebalancing Plan', desc: 'Which funds to exit, consolidate, and add — with specific reasoning.' },
              ].map((f, i) => (
                <div key={i} className="card" style={{ padding: '18px 20px' }}>
                  <div style={{ color: 'var(--red)', marginBottom: '10px' }}>{f.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>{f.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeUp 0.4s ease' }}>

            {/* headline stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <StatCard
                label="Portfolio Value"
                value={tv.val}
                unit={`₹${tv.unit ? '' : ''}${tv.unit}`}
                color="var(--text)"
              />
              <StatCard
                label="True XIRR"
                value={result.overall_xirr != null ? result.overall_xirr.toString() : 'N/A'}
                unit="%"
                color={result.overall_xirr > 12 ? 'var(--green-bright)' : result.overall_xirr > 8 ? 'var(--yellow-bright)' : '#f87171'}
                sub={result.overall_xirr != null ? (result.overall_xirr > 12 ? 'Beating Nifty 50' : result.overall_xirr > 8 ? `${(12.3 - result.overall_xirr).toFixed(1)}% below Nifty 50` : `${(12.3 - result.overall_xirr).toFixed(1)}% below Nifty 50`) : ''}
              />
            </div>

            {/* benchmark bar */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700 }}>XIRR Benchmark</h2>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Your returns vs alternatives</span>
              </div>
              {[
                { label: 'Your Portfolio', val: result.overall_xirr || 0, color: result.overall_xirr > 12 ? 'var(--green-bright)' : 'var(--red)' },
                { label: 'Nifty 50 (10yr avg)', val: 12.3, color: 'var(--muted-2)' },
                { label: 'Fixed Deposit', val: 7.0, color: 'var(--muted)' },
                { label: 'Savings Account', val: 3.5, color: 'var(--border-bright)' },
              ].map(b => (
                <div key={b.label} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: b.label === 'Your Portfolio' ? 'var(--text)' : 'var(--muted-2)', fontWeight: b.label === 'Your Portfolio' ? 600 : 400 }}>{b.label}</span>
                    <span style={{ color: b.color, fontWeight: 600 }}>{b.val}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--surface-2)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '4px',
                      width: `${Math.min((b.val / 16) * 100, 100)}%`,
                      background: b.color,
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* expense + overlap */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="card">
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Expense Drag</h2>
                {[
                  { label: 'Lost this year', val: `₹${fmtVal(result.expense_drag.annual_drag).val}${fmtVal(result.expense_drag.annual_drag).unit}`, bad: true },
                  { label: 'Lost over 20 years', val: `₹${fmtVal(result.expense_drag.expense_drag_20yr).val}${fmtVal(result.expense_drag.expense_drag_20yr).unit}`, bad: true },
                  { label: 'Switch to Direct → Save', val: `₹${fmtVal(result.expense_drag.switching_to_direct_gain).val}${fmtVal(result.expense_drag.switching_to_direct_gain).unit}`, bad: false },
                ].map(s => (
                  <div key={s.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.label}</span>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: s.bad ? '#f87171' : 'var(--green-bright)' }}>{s.val}</span>
                  </div>
                ))}
                <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--muted)' }}>
                  Weighted expense ratio: <strong style={{ color: 'var(--text)' }}>{result.expense_drag.weighted_expense_ratio}%</strong>
                </div>
              </div>

              <div className="card">
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Portfolio Overlap</h2>
                <div style={{ textAlign: 'center', margin: '8px 0 16px' }}>
                  <div style={{
                    fontFamily: 'Syne, sans-serif', fontSize: '48px', fontWeight: 800, letterSpacing: '-2px',
                    color: result.overlap.portfolio_overlap_score > 50 ? '#f87171' : 'var(--green-bright)',
                  }}>
                    <CountUp end={result.overlap.portfolio_overlap_score} decimals={1} suffix="%" />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {result.overlap.portfolio_overlap_score > 60 ? 'High overlap — you are overdiversified on paper' :
                     result.overlap.portfolio_overlap_score > 40 ? 'Moderate overlap — some consolidation recommended' :
                     'Good diversification across holdings'}
                  </div>
                </div>
                {result.overlap.pairs.filter((p: any) => p.overlap_pct > 40).slice(0, 2).map((p: any, i: number) => (
                  <div key={i} style={{
                    padding: '8px 10px', borderRadius: '8px',
                    background: 'var(--surface-2)', marginBottom: '6px', fontSize: '12px',
                  }}>
                    <div style={{ color: 'var(--muted-2)', marginBottom: '3px', lineHeight: 1.4 }}>
                      {p.fund_a.split(' - ')[0]} ↔ {p.fund_b.split(' - ')[0]}
                    </div>
                    <span style={{ color: p.overlap_pct > 70 ? '#f87171' : 'var(--yellow-bright)', fontWeight: 700 }}>{p.overlap_pct}% overlap</span>
                  </div>
                ))}
              </div>
            </div>

            {/* fund table */}
            <div className="card">
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, marginBottom: '18px' }}>Holdings Breakdown</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Fund', 'Value', 'XIRR', 'Expense', 'Signal'].map(h => (
                        <th key={h} style={{ textAlign: h === 'Fund' ? 'left' : 'right', paddingBottom: '12px', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.funds.map((f: any, i: number) => {
                      const fv = fmtVal(f.value)
                      const signal = f.xirr > 12 ? { label: 'Strong', color: 'var(--green-bright)' } :
                                     f.xirr > 8 ? { label: 'Okay', color: 'var(--yellow-bright)' } :
                                     f.expense_ratio > 1.5 ? { label: 'Costly', color: '#f87171' } :
                                     { label: 'Review', color: 'var(--muted-2)' }
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '13px 16px 13px 0', maxWidth: '280px' }}>
                            <div style={{ fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>{f.name}</div>
                            {f.name.toLowerCase().includes('regular') && (
                              <div style={{ fontSize: '11px', color: '#f87171', marginTop: '2px' }}>Regular plan · switch to Direct</div>
                            )}
                          </td>
                          <td style={{ textAlign: 'right', padding: '13px 0', fontFamily: 'Syne, sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}>₹{fv.val}{fv.unit}</td>
                          <td style={{ textAlign: 'right', padding: '13px 0 13px 16px', fontWeight: 700, color: f.xirr > 12 ? 'var(--green-bright)' : f.xirr > 8 ? 'var(--yellow-bright)' : '#f87171', whiteSpace: 'nowrap' }}>
                            {f.xirr != null ? `${f.xirr}%` : '—'}
                          </td>
                          <td style={{ textAlign: 'right', padding: '13px 0 13px 16px', color: f.expense_ratio > 1 ? '#f87171' : 'var(--muted-2)', whiteSpace: 'nowrap' }}>{f.expense_ratio}%</td>
                          <td style={{ textAlign: 'right', padding: '13px 0 13px 16px' }}>
                            <span style={{
                              fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
                              background: `${signal.color}18`, color: signal.color,
                            }}>{signal.label}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI report */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: 'var(--red)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '11px', color: 'white',
                }}>AI</div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px' }}>Portfolio Assessment</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {isDemo ? 'Sample analysis for Rahul Sharma' : `Analysis for ${result.investor_name || 'your portfolio'}`}
                  </div>
                </div>
              </div>
              <div className="prose">
                <ReactMarkdown>{result.ai_report}</ReactMarkdown>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setResult(null); setFile(null); setIsDemo(false) }} className="btn btn-ghost">
                ← Analyse Another
              </button>
              <Link href="/health-score" className="btn btn-red" style={{ textDecoration: 'none' }}>
                Check Money Health Score →
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
