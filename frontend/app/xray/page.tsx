'use client'
import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import SideNav from '../../components/SideNav'
import TopBar from '../../components/TopBar'
import Ticker from '../../components/Ticker'
import CountUp from '../../components/CountUp'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function fmtVal(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

const DEMO_RESULT = {
  investor_name: "Rahul Sharma",
  total_value: 1842500,
  fund_count: 6,
  overall_xirr: 9.4,
  funds: [
    { name: "Axis Bluechip Fund - Direct Growth", value: 420000, xirr: 11.2, expense_ratio: 0.5, closing_units: 1240.5, is_regular: false },
    { name: "HDFC Top 100 Fund - Regular Growth", value: 380000, xirr: 8.1, expense_ratio: 1.5, closing_units: 890.2, is_regular: true },
    { name: "Mirae Asset Large Cap Fund - Regular", value: 310000, xirr: 9.8, expense_ratio: 1.5, closing_units: 760.1, is_regular: true },
    { name: "Kotak Emerging Equity Fund - Regular", value: 290000, xirr: 10.4, expense_ratio: 1.6, closing_units: 540.8, is_regular: true },
    { name: "SBI Small Cap Fund - Regular Growth", value: 250000, xirr: 14.2, expense_ratio: 1.8, closing_units: 320.4, is_regular: true },
    { name: "HDFC Top 100 Fund - Direct Growth", value: 192500, xirr: 9.9, expense_ratio: 0.5, closing_units: 420.6, is_regular: false },
  ],
  overlap: {
    portfolio_overlap_score: 58.3,
    pairs: [
      { fund_a: "Axis Bluechip Fund - Direct Growth", fund_b: "Mirae Asset Large Cap Fund - Regular", overlap_pct: 71.4, shared_stocks: ["Reliance", "HDFC Bank", "Infosys", "TCS"] },
      { fund_a: "HDFC Top 100 Fund - Regular Growth", fund_b: "HDFC Top 100 Fund - Direct Growth", overlap_pct: 98.1, shared_stocks: ["Reliance", "HDFC Bank", "ICICI Bank", "TCS", "SBI"] },
      { fund_a: "HDFC Top 100 Fund - Regular Growth", fund_b: "Mirae Asset Large Cap Fund - Regular", overlap_pct: 65.2, shared_stocks: ["HDFC Bank", "ICICI Bank", "Infosys", "L&T"] },
    ]
  },
  expense_drag: {
    weighted_expense_ratio: 1.28,
    total_invested: 1842500,
    annual_drag: 23584,
    expense_drag_20yr: 847200,
    switching_to_direct_gain: 621400,
  },
  benchmarks: { nifty_50: { '1y': 12.3 }, fd_rate: 7.1, savings_rate: 3.5 },
  ai_report: `## Portfolio Health: 5.5/10

### I. What's Working
Your SBI Small Cap Fund is delivering strong alpha at 14.2% XIRR. The overall portfolio of ₹18.4L reflects disciplined long-term investing behavior. Direct plan exposure in Axis Bluechip is a positive step in cost consciousness.

### II. The Hard Truth
You are running two funds that are 98.1% identical — HDFC Top 100 Regular and HDFC Top 100 Direct. The Regular plan costs you ₹23,584 every year in excess fees silently. At your corpus, switching entirely to Direct plans recovers ₹6.2L over 20 years. The 3 large-cap funds have 65–71% overlap and collectively over-represent the same 10 stocks.

### III. Rebalancing Plan
**Exit immediately:** HDFC Top 100 Regular Growth — merge into the Direct plan you already hold. **Consolidate:** Reduce to one large-cap fund (keep Axis Bluechip Direct). **Add:** One flexi-cap fund (Parag Parikh Flexi Cap Direct) for international diversification. **Retain:** Kotak Emerging Equity and SBI Small Cap.

### IV. The One Thing To Do This Week
Call your broker and switch HDFC Top 100 Regular to Direct. Takes 10 minutes. Saves ₹12,000 per year immediately.`,
}

export default function XRayPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') setFile(f)
  }, [])

  async function handleAnalyze() {
    if (!file) return
    setLoading(true); setError(''); setResult(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch(`${API}/api/xray`, { method: 'POST', body: form })
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Analysis failed') }
      setResult(await res.json()); setIsDemo(false)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const benchmarks = result?.benchmarks || DEMO_RESULT.benchmarks

  return (
    <div className="min-h-screen">
      <SideNav />
      <TopBar titleRed="Portfolio" title="X-Ray" />
      <div className="lg:ml-64 pt-16">
        <Ticker />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <header className="mb-12">
            <span className="text-[0.6875rem] font-semibold text-[#e63329] uppercase tracking-[0.2em]">Analysis Tool</span>
            <h1 className="text-[3.5rem] font-extrabold tracking-tighter leading-none mb-4 mt-1">Portfolio X-Ray</h1>
            <p className="text-[#e5e2e1]/60 max-w-2xl font-light text-lg">Deconstruct your mutual fund holdings. Identify hidden overlaps, calculate true XIRR, and eliminate expense drag with surgical precision.</p>
          </header>

          {!result && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
              <div className="lg:col-span-2">
                <div
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => document.getElementById('fi')?.click()}
                  className={`relative group cursor-pointer border-2 border-dashed rounded-2xl bg-[#111111] p-12 flex flex-col items-center justify-center text-center transition-colors ${dragOver ? 'border-[#e63329] bg-[#e63329]/5' : 'border-white/10 hover:border-[#e63329]'}`}
                >
                  <div className="w-16 h-16 rounded-full bg-[#1c1b1b] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[#e63329] text-3xl">upload_file</span>
                  </div>
                  {file ? (
                    <div><h3 className="text-xl font-bold mb-1">{file.name}</h3><p className="text-[#e5e2e1]/40 text-sm">{(file.size/1024).toFixed(0)} KB · PDF</p></div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-bold mb-2">Upload CAMS or KFintech Statement</h3>
                      <p className="text-[#e5e2e1]/40 text-sm">Drag and drop your consolidated account statement here.<br/>Supported format: .pdf</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 justify-center mt-8">
                    <button onClick={e => { e.stopPropagation(); handleAnalyze() }} disabled={!file || loading}
                      className="bg-[#e63329] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                      onMouseEnter={e => !(!file||loading) && ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(230,51,41,0.4)')}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>
                      {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{animation:'spin 0.8s linear infinite'}} />Analysing...</> : <><span>Analyse Portfolio</span><span className="material-symbols-outlined text-sm">arrow_forward</span></>}
                    </button>
                    <button onClick={e => { e.stopPropagation(); setResult(DEMO_RESULT); setIsDemo(true) }}
                      className="border border-[#5c403c] px-8 py-4 rounded-xl font-bold hover:bg-white/5 transition-all text-[#e5e2e1]">
                      Demo
                    </button>
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-widest opacity-40">
                    <span className="material-symbols-outlined text-base">lock_open</span>
                    Zero Storage Policy. Processed in memory.
                  </div>
                </div>
                <input id="fi" type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                {error && <div className="mt-4 p-4 bg-[#e63329]/10 border border-[#e63329]/30 rounded-xl text-[#f87171] text-sm flex gap-2 items-start"><span className="material-symbols-outlined text-base flex-shrink-0">error</span>{error}</div>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {[
                  { icon: 'calculate', color: 'text-[#adc6ff]', title: 'True XIRR', desc: 'Accounting for every rupee, including dividends and exact SIP timing.' },
                  { icon: 'layers', color: 'text-[#e63329]', title: 'Overlap Analysis', desc: 'Detect if your funds are secretly holding the same stocks.' },
                  { icon: 'trending_down', color: 'text-[#e63329]', title: 'Expense Drag', desc: 'Visualize how much wealth is being leaked to commissions.' },
                  { icon: 'auto_awesome', color: 'text-[#c6c6c8]', title: 'AI Rebalancing', desc: 'Specific insights to optimize your risk-adjusted returns.' },
                ].map(f => (
                  <div key={f.title} className="bg-[#111111] p-6 rounded-2xl border border-white/[0.03]">
                    <span className={`material-symbols-outlined ${f.color} mb-4 block`}>{f.icon}</span>
                    <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">{f.title}</h4>
                    <p className="text-xs text-[#e5e2e1]/40 font-light">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {result && (
            <section style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <span className="text-[0.6875rem] font-semibold text-[#e63329] uppercase tracking-[0.2em]">Analysis Report {isDemo && '· Demo Mode'}</span>
                  <h2 className="text-[1.75rem] font-extrabold tracking-tight mt-2">Executive Overview</h2>
                </div>
                <button onClick={() => { setResult(null); setFile(null); setIsDemo(false) }}
                  className="text-[0.6875rem] font-bold uppercase tracking-widest text-[#e5e2e1]/40 hover:text-[#e5e2e1] flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-sm">replay</span> New Analysis
                </button>
              </div>

              {/* stats grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                  { label: 'Portfolio Value', value: fmtVal(result.total_value), sub: `${result.fund_count} funds`, color: 'text-[#e5e2e1]' },
                  { label: 'True XIRR', value: `${result.overall_xirr}%`, sub: result.overall_xirr > 12 ? 'Above Benchmark' : `${(12.3 - result.overall_xirr).toFixed(1)}% below Nifty`, color: result.overall_xirr > 12 ? 'text-[#adc6ff]' : result.overall_xirr > 8 ? 'text-[#f59e0b]' : 'text-[#e63329]' },
                  { label: 'Expense Drag / Yr', value: fmtVal(result.expense_drag.annual_drag), sub: 'Silent wealth leak', color: 'text-[#e63329]' },
                  { label: 'Overlap Score', value: `${result.overlap.portfolio_overlap_score}%`, sub: result.overlap.portfolio_overlap_score > 50 ? 'High Concentration' : 'Well Diversified', color: result.overlap.portfolio_overlap_score > 50 ? 'text-[#e63329]' : 'text-[#adc6ff]' },
                ].map(s => (
                  <div key={s.label} className="bg-[#111111] p-8 rounded-2xl">
                    <span className="text-[0.6875rem] font-bold opacity-40 uppercase tracking-widest mb-4 block">{s.label}</span>
                    <div className={`text-2xl font-extrabold tracking-tight ${s.color}`}>{s.value}</div>
                    <div className="text-[0.6875rem] opacity-40 font-semibold mt-2 uppercase tracking-tighter">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* bento: benchmark + overlap */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                <div className="lg:col-span-2 bg-[#111111] p-8 rounded-2xl">
                  <h4 className="text-sm font-bold uppercase tracking-wider mb-8">XIRR Benchmark Comparison</h4>
                  {[
                    { label: 'Your Portfolio', val: result.overall_xirr || 0, highlight: true },
                    { label: 'Nifty 50 (1Y)', val: benchmarks?.nifty_50?.['1y'] || 12.3, highlight: false },
                    { label: 'Fixed Deposit', val: benchmarks?.fd_rate || 7.1, highlight: false },
                    { label: 'Savings Account', val: benchmarks?.savings_rate || 3.5, highlight: false },
                  ].map(b => (
                    <div key={b.label} className="relative pt-1 mb-6">
                      <div className="flex mb-2 items-center justify-between">
                        <div className={`text-xs font-semibold py-1 px-2 uppercase rounded-md ${b.highlight ? 'bg-[#4b8eff]/20 text-[#adc6ff]' : 'bg-[#1c1b1b] text-[#e5e2e1]'}`}>{b.label}</div>
                        <span className={`text-xs font-semibold ${b.highlight ? 'text-[#adc6ff]' : 'opacity-60'}`}>{b.val}%</span>
                      </div>
                      <div className="overflow-hidden h-3 rounded-full bg-[#1c1b1b]">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((b.val / 22) * 100, 100)}%`, background: b.highlight ? (result.overall_xirr > 12 ? '#adc6ff' : '#e63329') : '#3a3939' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#1c1b1b] p-8 rounded-2xl relative overflow-hidden">
                  <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Overlap Alert</h4>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-full border-4 border-[#e63329] flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {result.overlap.portfolio_overlap_score}%
                    </div>
                    <p className="text-xs text-[#e5e2e1]/60 leading-relaxed">
                      {result.overlap.pairs.filter((p: any) => p.overlap_pct > 60).length > 0
                        ? `${result.overlap.pairs.filter((p: any) => p.overlap_pct > 60).length} high-overlap fund pairs detected`
                        : 'Portfolio is well diversified'}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {result.overlap.pairs.filter((p: any) => p.overlap_pct > 40).slice(0, 3).map((p: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-[0.6875rem]">
                        <span className="opacity-40 truncate max-w-[140px]">{p.fund_a.split(' - ')[0].split(' ').slice(0,2).join(' ')}</span>
                        <span className={`font-bold ${p.overlap_pct > 70 ? 'text-[#e63329]' : 'text-[#f59e0b]'}`}>{p.overlap_pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* fund table */}
              <div className="bg-[#111111] rounded-2xl overflow-hidden mb-12">
                <div className="p-8 border-b border-white/[0.03] flex justify-between items-center">
                  <h4 className="text-sm font-bold uppercase tracking-wider">Fund Inventory</h4>
                  <span className="text-[0.6875rem] font-bold text-[#adc6ff] uppercase tracking-widest">{result.funds.length} Holdings</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#0e0e0e] text-[0.6875rem] font-bold opacity-40 uppercase tracking-widest">
                        {['Fund Name', 'Current Value', 'XIRR', 'Expense', 'Signal'].map(h => (
                          <th key={h} className="px-8 py-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-sm font-light">
                      {result.funds.map((f: any, i: number) => {
                        const signal = f.xirr > 12 ? { label: 'Strong Hold', color: 'bg-[#4b8eff]/10 text-[#adc6ff]' } :
                          f.is_regular ? { label: 'Switch To Direct', color: 'bg-[#e63329]/10 text-[#e63329]' } :
                          f.xirr > 8 ? { label: 'Active Watch', color: 'bg-[#4b8eff]/10 text-[#adc6ff]' } :
                          { label: 'Review', color: 'bg-white/5 text-[#e5e2e1]/60' }
                        return (
                          <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-6 font-semibold max-w-[240px]">
                              <div className="truncate">{f.name}</div>
                              {f.is_regular && <div className="text-[11px] text-[#e63329] mt-0.5">Regular plan · switch to Direct</div>}
                            </td>
                            <td className="px-8 py-6">{fmtVal(f.value)}</td>
                            <td className={`px-8 py-6 font-bold ${f.xirr > 12 ? 'text-[#adc6ff]' : f.xirr > 8 ? 'text-[#f59e0b]' : 'text-[#e63329]'}`}>{f.xirr != null ? `${f.xirr}%` : '—'}</td>
                            <td className={`px-8 py-6 ${f.expense_ratio > 1 ? 'text-[#e63329]' : 'opacity-60'}`}>{f.expense_ratio}%</td>
                            <td className="px-8 py-6"><span className={`px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase ${signal.color}`}>{signal.label}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* expense drag */}
              <div className="bg-[#111111] rounded-2xl p-8 mb-12">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Expense Intelligence</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {[
                    { l: 'Weighted Expense Ratio', v: `${result.expense_drag.weighted_expense_ratio}%`, red: true },
                    { l: 'Annual Wealth Leak', v: fmtVal(result.expense_drag.annual_drag), red: true },
                    { l: '20-Year Drag', v: fmtVal(result.expense_drag.expense_drag_20yr), red: true },
                  ].map(s => (
                    <div key={s.l} className="bg-[#1c1b1b] p-6 rounded-xl">
                      <div className="text-[0.6875rem] font-bold opacity-40 uppercase tracking-widest mb-2">{s.l}</div>
                      <div className="text-2xl font-extrabold text-[#e63329]">{s.v}</div>
                    </div>
                  ))}
                </div>
                {result.expense_drag.switching_to_direct_gain > 0 && (
                  <div className="p-4 bg-[#4b8eff]/10 border border-[#4b8eff]/20 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#adc6ff]">info</span>
                    <p className="text-xs text-[#adc6ff] font-medium">Switching to Direct plans saves <strong>{fmtVal(result.expense_drag.switching_to_direct_gain)}</strong> over 20 years.</p>
                  </div>
                )}
              </div>

              {/* AI assessment */}
              <div className="bg-[#1c1b1b] p-10 rounded-2xl border-l-4 border-[#e63329]">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-[#e63329] text-white text-[0.6rem] px-2 py-0.5 rounded-sm font-black uppercase">AI Analysis</span>
                  <h3 className="text-xl font-extrabold tracking-tight">The Sovereign Verdict</h3>
                </div>
                <div className="prose max-w-none">
                  <ReactMarkdown>{result.ai_report}</ReactMarkdown>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
