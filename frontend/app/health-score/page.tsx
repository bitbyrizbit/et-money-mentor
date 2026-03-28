'use client'
import { useState } from 'react'
import Link from 'next/link'
import SideNav from '../../components/SideNav'
import TopBar from '../../components/TopBar'
import Ticker from '../../components/Ticker'
import CountUp from '../../components/CountUp'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const DIMS = [
  { key: 'emergency_preparedness', label: 'Emergency Resilience', icon: 'emergency_home', sub: 'Liquidity' },
  { key: 'insurance_coverage', label: 'Risk Mitigation', icon: 'verified_user', sub: 'Protection' },
  { key: 'investment_diversification', label: 'Asset Diversification', icon: 'pie_chart', sub: 'Allocation' },
  { key: 'debt_health', label: 'Debt Efficiency', icon: 'balance', sub: 'Solvency' },
  { key: 'tax_efficiency', label: 'Fiscal Precision', icon: 'receipt_long', sub: 'Tax Leakage' },
  { key: 'retirement_readiness', label: 'Longevity Planning', icon: 'update', sub: 'Corpus' },
]

export default function HealthScorePage() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<any>({ tax_regime: 'new', has_term: false, has_health: false })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  function update(key: string, value: any) {
    setData((p: any) => ({ ...p, [key]: value }))
  }

  async function submit() {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/health-score`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Scoring failed')
      setResult(await res.json())
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const inputClass = "w-full bg-[#181818] border-none rounded-[10px] p-4 text-[#e5e2e1] outline-none transition-all text-sm"

  const steps = [
    {
      title: 'Step 1: Basic Profile', tag: '1 of 3',
      fields: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[{l:'Age',k:'age',ph:'28'},{l:'Monthly Income (₹)',k:'income',ph:'80000'},{l:'Monthly Expenses (₹)',k:'expenses',ph:'45000'}].map(f => (
            <div key={f.k} className="space-y-2">
              <label className="text-[0.6875rem] font-semibold uppercase tracking-widest opacity-60">{f.l}</label>
              <input type="number" placeholder={f.ph} className={inputClass}
                style={{}} onFocus={e => (e.currentTarget.style.boxShadow='0 0 0 1px #e63329')} onBlur={e => (e.currentTarget.style.boxShadow='none')}
                onChange={e => update(f.k, +e.target.value)} />
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Step 2: Protection Coverage', tag: '2 of 3',
      fields: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[0.6875rem] font-semibold uppercase tracking-widest opacity-60">Emergency fund covers how many months?</label>
            <input type="number" placeholder="3" className={inputClass}
              onFocus={e => (e.currentTarget.style.boxShadow='0 0 0 1px #e63329')} onBlur={e => (e.currentTarget.style.boxShadow='none')}
              onChange={e => update('emergency_months', +e.target.value)} />
          </div>
          {[{k:'has_term',l:'I have term insurance',sk:'term_cover',sl:'Term cover amount (₹)'},{k:'has_health',l:'I have health insurance',sk:'health_cover',sl:'Health cover amount (₹)'}].map(item => (
            <div key={item.k} className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer" onClick={() => update(item.k, !data[item.k])}>
                <div className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center transition-all ${data[item.k] ? 'border-[#e63329] bg-[#e63329]' : 'border-white/20'}`}>
                  {data[item.k] && <span className="material-symbols-outlined text-white text-xs" style={{fontSize:12}}>check</span>}
                </div>
                <span className="text-sm font-medium">{item.l}</span>
              </label>
              {data[item.k] && (
                <input type="number" placeholder={item.sl} className={inputClass}
                  onFocus={e => (e.currentTarget.style.boxShadow='0 0 0 1px #e63329')} onBlur={e => (e.currentTarget.style.boxShadow='none')}
                  onChange={e => update(item.sk, +e.target.value)} />
              )}
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Step 3: Asset & Liability Mapping', tag: '3 of 3',
      fields: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[{l:'Total Investments (₹)',k:'investments',ph:'500000'},{l:'Outstanding Loans (₹)',k:'loans',ph:'0'},{l:'Monthly EMI (₹)',k:'emi',ph:'0'},{l:'Annual PF + NPS (₹)',k:'pf_nps',ph:'60000'}].map(f => (
              <div key={f.k} className="space-y-2">
                <label className="text-[0.6875rem] font-semibold uppercase tracking-widest opacity-60">{f.l}</label>
                <input type="number" placeholder={f.ph} className={inputClass}
                  onFocus={e => (e.currentTarget.style.boxShadow='0 0 0 1px #e63329')} onBlur={e => (e.currentTarget.style.boxShadow='none')}
                  onChange={e => update(f.k, +e.target.value)} />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-[0.6875rem] font-semibold uppercase tracking-widest opacity-60">Current Tax Regime</label>
            <div className="flex bg-[#181818] p-1.5 rounded-[10px]">
              {['new','old'].map(r => (
                <button key={r} onClick={() => update('tax_regime', r)}
                  className={`flex-1 py-3 text-xs font-bold uppercase rounded-[8px] transition-all ${data.tax_regime===r ? 'bg-[#1c1b1b] text-[#e63329]' : 'text-[#e5e2e1]/40 hover:text-[#e5e2e1]'}`}>
                  {r === 'new' ? 'New Regime' : 'Old Regime'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ]

  if (result) {
    const score = result.overall_score || 0
    const grade = result.grade || 'C'
    const scoreColor = score >= 75 ? '#adc6ff' : score >= 50 ? '#f59e0b' : '#e63329'

    return (
      <div className="min-h-screen">
        <SideNav />
        <TopBar titleRed="Money Health" title="Score" />
        <div className="lg:ml-64 pt-14 md:pt-16 pb-20 lg:pb-0">
          <Ticker />
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12" style={{ animation: 'fadeUp 0.5s ease' }}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
              <div className="lg:col-span-7">
                <span className="text-[0.6875rem] font-semibold text-[#e63329] uppercase tracking-[0.2em]">Diagnostic Result</span>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mt-1 mb-8">Money Health Score.</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {DIMS.map(dim => {
                    const d = result.dimensions?.[dim.key]
                    if (!d) return null
                    const color = d.score >= 70 ? '#adc6ff' : d.score >= 40 ? '#f59e0b' : '#e63329'
                    return (
                      <div key={dim.key} className="bg-[#111111] p-7 rounded-[16px] hover:bg-[#1c1b1b] transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-6">
                          <span className="material-symbols-outlined opacity-80" style={{ color }}>{dim.icon}</span>
                          <span className="text-xl font-bold"><CountUp end={d.score} /></span>
                        </div>
                        <h3 className="font-bold mb-1 text-sm">{dim.label}</h3>
                        <div className="w-full bg-[#080808] h-1.5 rounded-full mb-4">
                          <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: color, transition: 'width 1s ease' }} />
                        </div>
                        <div className="flex justify-between items-center text-[0.6875rem] font-semibold opacity-40 uppercase">
                          <span>{dim.sub}</span>
                          <span className="group-hover:translate-x-1 transition-transform cursor-pointer" style={{ color }}>{d.status}</span>
                        </div>
                        {d.action && <p className="text-[11px] text-[#e5e2e1]/40 mt-3 leading-relaxed">{d.action}</p>}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#1c1b1b] rounded-[16px] p-8 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <span className="material-symbols-outlined text-9xl">shield_with_heart</span>
                  </div>
                  <div className="relative z-10 space-y-4">
                    <h3 className="text-sm font-semibold tracking-widest uppercase opacity-60">Health Index Result</h3>
                    <div className="flex items-baseline gap-4">
                      <span className="text-[5.5rem] font-extrabold tracking-tighter leading-none" style={{ color: scoreColor }}>
                        <CountUp end={score} duration={1500} />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold">Grade {grade}</span>
                        <span className="text-xs opacity-40 uppercase font-semibold">Sovereign Class</span>
                      </div>
                    </div>
                    {result.savings_rate_pct != null && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-[#4b8eff]/20 text-[#adc6ff] px-3 py-1 rounded-full text-[0.6875rem] font-bold">SAVINGS RATE: {result.savings_rate_pct}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {result.top_priority && (
                  <div className="bg-[#111111] border-2 border-[#e63329] rounded-[16px] p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="bg-[#e63329]/10 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-[#e63329]">priority_high</span>
                      </div>
                      <span className="text-[0.6rem] font-black bg-[#e63329] text-white px-2 py-0.5 rounded uppercase">High Priority</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">Top Priority</h4>
                      <p className="text-sm text-[#e5e2e1]/60 font-light mt-1">{result.top_priority}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <button onClick={() => { setResult(null); setStep(0); setData({ tax_regime: 'new' }) }}
                    className="text-[0.875rem] font-semibold text-[#e5e2e1] opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">replay</span> Retake Assessment
                  </button>
                  <div className="flex gap-4">
                    <Link href="/fire">
                      <button className="px-8 py-4 bg-[#e63329] text-[#e5e2e1] font-extrabold uppercase tracking-widest rounded-[10px] text-sm transition-all hover:-translate-y-0.5"
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(230,51,41,0.4)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>
                        Next: FIRE Plan
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SideNav />
      <TopBar titleRed="Money Health" title="Score" />
      <div className="lg:ml-64 pt-14 md:pt-16 pb-20 lg:pb-0">
        <Ticker />
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <section className="mb-12">
            <span className="text-[0.6875rem] font-semibold text-[#e63329] uppercase tracking-[0.2em]">Diagnostic Phase</span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mt-1">Money Health Score.</h1>
            <p className="text-[#e5e2e1]/40 font-light max-w-2xl mt-4 italic text-sm">Quantitative analysis of your financial health. Complete the assessment to unlock your sovereign metrics.</p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-8">
              <div className="w-full bg-[#111111] h-1 rounded-full overflow-hidden">
                <div className="bg-[#e63329] h-full transition-all duration-700" style={{ width: `${((step + 1) / 3) * 100}%` }} />
              </div>

              <div className="bg-[#111111] rounded-2xl p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold tracking-tight">{steps[step].title}</h2>
                  <span className="text-xs font-semibold text-[#e63329] opacity-80 bg-[#e63329]/10 px-3 py-1 rounded-full">{steps[step].tag}</span>
                </div>
                {steps[step].fields}
                {error && <p className="text-[#f87171] text-sm">{error}</p>}
                <div className="flex gap-4 pt-2">
                  {step > 0 && (
                    <button onClick={() => setStep(s => s - 1)}
                      className="flex-1 py-4 bg-[#1c1b1b] border border-white/10 text-sm font-bold uppercase rounded-[10px] hover:bg-[#353534] transition-colors">
                      Back
                    </button>
                  )}
                  {step < steps.length - 1 ? (
                    <button onClick={() => setStep(s => s + 1)}
                      className="flex-1 py-4 bg-[#e63329] text-white font-extrabold uppercase tracking-widest rounded-[10px] transition-all hover:-translate-y-0.5"
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(230,51,41,0.4)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>
                      Next
                    </button>
                  ) : (
                    <button onClick={submit} disabled={loading}
                      className="flex-1 py-4 bg-[#e63329] text-white font-extrabold uppercase tracking-widest rounded-[10px] transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                      onMouseEnter={e => !loading && ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(230,51,41,0.4)')}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>
                      {loading ? 'Calculating...' : 'Generate Intelligence'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#1c1b1b] rounded-[16px] p-8 border border-white/5">
                <h3 className="text-sm font-semibold tracking-widest uppercase opacity-60 mb-6">6 Dimensions Analysed</h3>
                <div className="space-y-4">
                  {DIMS.map((dim, i) => (
                    <div key={dim.key} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i <= step * 2 + 1 ? 'bg-[#e63329]/10' : 'bg-white/5'}`}>
                        <span className={`material-symbols-outlined text-sm ${i <= step * 2 + 1 ? 'text-[#e63329]' : 'opacity-20'}`}>{dim.icon}</span>
                      </div>
                      <span className={`text-sm font-medium ${i <= step * 2 + 1 ? 'text-[#e5e2e1]' : 'opacity-30'}`}>{dim.label}</span>
                      {i <= step * 2 + 1 && <span className="material-symbols-outlined text-[#adc6ff] text-sm ml-auto">check_circle</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
