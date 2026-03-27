'use client'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import SideNav from '../../components/SideNav'
import TopBar from '../../components/TopBar'
import Ticker from '../../components/Ticker'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function FirePage() {
  const [data, setData] = useState<any>({ risk_profile: 'moderate', goals: [] })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [goalInput, setGoalInput] = useState('')
  const [error, setError] = useState('')

  function update(key: string, value: any) { setData((p: any) => ({ ...p, [key]: value })) }
  function addGoal() {
    if (!goalInput.trim()) return
    setData((p: any) => ({ ...p, goals: [...(p.goals||[]), goalInput.trim()] }))
    setGoalInput('')
  }

  async function submit() {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/api/fire-plan`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Plan generation failed')
      const json = await res.json()
      setResult(json.plan)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const inputClass = "w-full bg-[#181818] border-none rounded-[10px] p-4 text-[#e5e2e1] outline-none transition-all text-sm"

  const fields = [
    { l: 'Current Age', k: 'age', ph: '28' },
    { l: 'Retirement Goal Age', k: 'target_age', ph: '45' },
    { l: 'Monthly Income (₹)', k: 'income', ph: '100000' },
    { l: 'Monthly Expenses (₹)', k: 'expenses', ph: '55000' },
    { l: 'Current Net Worth (₹)', k: 'current_investments', ph: '800000' },
    { l: 'Current Monthly SIP (₹)', k: 'current_sip', ph: '20000' },
  ]

  return (
    <div className="min-h-screen">
      <SideNav />
      <TopBar titleRed="FIRE" title="Planner" />
      <div className="lg:ml-64 pt-16">
        <Ticker />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            {/* form */}
            <section className="xl:col-span-5 space-y-8">
              <div className="space-y-2">
                <span className="text-[0.6875rem] font-semibold text-[#e63329] uppercase tracking-[0.2em]">Retirement Intelligence</span>
                <h2 className="text-[1.75rem] font-extrabold tracking-tight">Sovereign Parameters</h2>
                <p className="text-sm font-light opacity-60 max-w-md italic">Define the trajectory of your financial independence. These inputs fuel the Mentor AI logic.</p>
              </div>

              <div className="bg-[#111111] rounded-[16px] p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fields.map(f => (
                    <div key={f.k} className="space-y-2">
                      <label className="text-[0.6875rem] font-semibold uppercase tracking-widest opacity-60">{f.l}</label>
                      <input type="number" placeholder={f.ph} className={inputClass}
                        onFocus={e => (e.currentTarget.style.boxShadow='0 0 0 1px #e63329')}
                        onBlur={e => (e.currentTarget.style.boxShadow='none')}
                        onChange={e => update(f.k, +e.target.value)} />
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <label className="text-[0.6875rem] font-semibold uppercase tracking-widest opacity-60">Risk Profile</label>
                  <div className="flex p-1 bg-[#181818] rounded-[10px]">
                    {['conservative','moderate','aggressive'].map(r => (
                      <button key={r} onClick={() => update('risk_profile', r)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-[8px] capitalize transition-all ${data.risk_profile===r ? 'bg-[#1c1b1b] text-[#e63329]' : 'opacity-40 hover:opacity-100'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[0.6875rem] font-semibold uppercase tracking-widest opacity-60">Life Milestones & Goals</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {data.goals?.map((g: string, i: number) => (
                      <span key={i} className="flex items-center gap-2 bg-[#1c1b1b] px-3 py-1.5 rounded-full text-xs font-medium border border-white/5">
                        {g}
                        <span className="material-symbols-outlined cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
                          style={{ fontSize: 14 }}
                          onClick={() => setData((p: any) => ({ ...p, goals: p.goals.filter((_: any, j: number) => j !== i) }))}>
                          close
                        </span>
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <input value={goalInput} onChange={e => setGoalInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addGoal()}
                      placeholder="Type a goal and press Enter..."
                      className={inputClass}
                      onFocus={e => (e.currentTarget.style.boxShadow='0 0 0 1px #e63329')}
                      onBlur={e => (e.currentTarget.style.boxShadow='none')} />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 opacity-20 cursor-pointer hover:opacity-60 transition-opacity"
                      onClick={addGoal}>add_circle</span>
                  </div>
                </div>

                {error && <p className="text-[#f87171] text-sm">{error}</p>}

                <button onClick={submit} disabled={loading}
                  className="w-full bg-[#e63329] text-white font-bold py-4 rounded-[10px] transition-all duration-300 uppercase tracking-widest text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
                  onMouseEnter={e => !loading && ((e.currentTarget as HTMLElement).style.boxShadow='0px 0px 15px rgba(230,51,41,0.4)')}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow='none'}>
                  {loading ? 'Generating Intelligence Report...' : 'Generate Intelligence Report'}
                </button>
              </div>
            </section>

            {/* results */}
            <section className="xl:col-span-7 space-y-8">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#e63329] rounded-[12px] flex items-center justify-center">
                      <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    </div>
                    <h2 className="text-[1.75rem] font-extrabold tracking-tight">Intelligence Output</h2>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-widest opacity-40">Status</p>
                  <p className={`font-bold text-xs flex items-center gap-1 justify-end ${result ? 'text-[#adc6ff]' : 'text-[#e5e2e1]/40'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${result ? 'bg-[#adc6ff]' : 'bg-[#e5e2e1]/20'}`} />
                    {result ? 'Complete' : loading ? 'Processing...' : 'Ready'}
                  </p>
                </div>
              </div>

              {!result && !loading && (
                <div className="bg-[#111111] rounded-[16px] overflow-hidden">
                  <div className="grid grid-cols-2 border-b border-white/[0.05]">
                    {[{l:'FIRE Number',v:'₹?',sub:'Required corpus for independence'},{l:'Target Year',v:'20??',sub:'Your retirement timeline'}].map(s => (
                      <div key={s.l} className="p-8 border-r border-white/[0.05] last:border-0">
                        <p className="text-[0.6875rem] font-semibold uppercase tracking-widest opacity-60 mb-2">{s.l}</p>
                        <div className="text-[3.5rem] font-extrabold tracking-tighter text-[#353534] leading-none">{s.v}</div>
                        <p className="text-xs font-light opacity-40 mt-4 leading-relaxed">{s.sub}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-10 text-center opacity-30">
                    <span className="material-symbols-outlined text-5xl">psychology</span>
                    <p className="text-sm font-light mt-4">Fill in your parameters and generate your personalised intelligence report.</p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="bg-[#111111] rounded-[16px] p-16 flex flex-col items-center justify-center gap-6">
                  <div className="w-12 h-12 border-2 border-[#e63329]/30 border-t-[#e63329] rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
                  <p className="text-sm font-light opacity-60">Generating your sovereign intelligence report...</p>
                </div>
              )}

              {result && (
                <div className="bg-[#111111] rounded-[16px] overflow-hidden" style={{ animation: 'fadeUp 0.4s ease' }}>
                  <div className="p-10 space-y-8">
                    <div className="prose max-w-none">
                      <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="p-8 border-t border-white/[0.05] flex items-center gap-4 bg-[#4b8eff]/5">
                    <span className="material-symbols-outlined text-[#adc6ff]">info</span>
                    <p className="text-xs text-[#adc6ff] font-medium">Rebalancing every 6 months increases success probability. All projections are illustrative and not financial advice.</p>
                  </div>
                </div>
              )}

              {result && (
                <button onClick={() => setResult('')}
                  className="text-sm font-semibold opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">replay</span> Recalculate
                </button>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
