'use client'
import { useState } from 'react'
import Link from 'next/link'
import Nav from '../../components/Nav'
import CountUp from '../../components/CountUp'
import { IconShield, IconHeart, IconTrend, IconAlert, IconCheck, IconSpinner } from '../../components/Icons'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const DIMS = [
  { key: 'emergency_preparedness', label: 'Emergency Fund', Icon: IconShield },
  { key: 'insurance_coverage', label: 'Insurance', Icon: IconHeart },
  { key: 'investment_diversification', label: 'Investments', Icon: IconTrend },
  { key: 'debt_health', label: 'Debt Health', Icon: IconAlert },
  { key: 'tax_efficiency', label: 'Tax Efficiency', Icon: IconCheck },
  { key: 'retirement_readiness', label: 'Retirement', Icon: IconShield },
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
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/health-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Scoring failed')
      setResult(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    {
      title: 'Basic Info',
      subtitle: 'Tell us about your income and expenses',
      fields: [
        { label: 'Age', key: 'age', type: 'number', placeholder: '28' },
        { label: 'Monthly Take-Home Income (₹)', key: 'income', type: 'number', placeholder: '80000' },
        { label: 'Monthly Expenses (₹)', key: 'expenses', type: 'number', placeholder: '45000' },
      ]
    },
    {
      title: 'Protection',
      subtitle: 'Emergency buffer and insurance coverage',
      fields: [
        { label: 'Emergency fund covers how many months?', key: 'emergency_months', type: 'number', placeholder: '3' },
      ]
    },
    {
      title: 'Wealth & Debt',
      subtitle: 'Your investments, loans and tax strategy',
      fields: [
        { label: 'Total investments — MF + stocks + FD + PF (₹)', key: 'investments', type: 'number', placeholder: '500000' },
        { label: 'Outstanding loans total (₹)', key: 'loans', type: 'number', placeholder: '0' },
        { label: 'Monthly EMI total (₹)', key: 'emi', type: 'number', placeholder: '0' },
        { label: 'Annual PF + NPS contribution (₹)', key: 'pf_nps', type: 'number', placeholder: '60000' },
      ]
    }
  ]

  if (result) {
    const score = result.overall_score || 0
    const grade = result.grade || 'C'
    const scoreColor = score >= 75 ? 'var(--green-bright)' : score >= 50 ? 'var(--yellow-bright)' : '#f87171'

    return (
      <>
        <Nav />
        <main style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px', animation: 'fadeUp 0.5s ease' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '88px', fontWeight: 800, color: scoreColor, letterSpacing: '-4px', lineHeight: 1 }}>
              <CountUp end={score} duration={1500} />
            </div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: scoreColor, marginTop: '8px' }}>
              Grade {grade}
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '8px' }}>Your Money Health Score</p>
            {result.savings_rate_pct != null && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '6px 14px', borderRadius: '20px', background: 'var(--surface)', border: '1px solid var(--border)', fontSize: '13px' }}>
                Savings rate: <strong style={{ color: 'var(--text)' }}>{result.savings_rate_pct}%</strong>
                {result.monthly_surplus > 0 && <> · Surplus: <strong style={{ color: 'var(--green-bright)' }}>₹{result.monthly_surplus.toLocaleString('en-IN')}/mo</strong></>}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {DIMS.map(dim => {
              const d = result.dimensions?.[dim.key]
              if (!d) return null
              const color = d.score >= 70 ? 'var(--green-bright)' : d.score >= 40 ? 'var(--yellow-bright)' : '#f87171'
              return (
                <div key={dim.key} className="card" style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ color: 'var(--muted)' }}><dim.Icon size={15} /></div>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{dim.label}</span>
                    </div>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', color }}>
                      <CountUp end={d.score} duration={1200} />
                    </span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--surface-2)', borderRadius: '4px', marginBottom: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '4px', width: `${d.score}%`, background: color, transition: 'width 1s ease' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{d.action}</p>
                </div>
              )
            })}
          </div>

          {result.top_priority && (
            <div style={{
              padding: '20px 24px', borderRadius: '14px',
              background: 'rgba(230,51,41,0.06)', border: '1px solid rgba(230,51,41,0.2)',
              marginBottom: '20px',
            }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--red)', fontSize: '13px', marginBottom: '8px' }}>
                Top Priority
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.6 }}>{result.top_priority}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => { setResult(null); setStep(0); setData({ tax_regime: 'new' }) }} className="btn btn-ghost">
              Retake
            </button>
            <Link href="/fire" className="btn btn-red" style={{ textDecoration: 'none' }}>
              Build FIRE Plan →
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main style={{ maxWidth: '520px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>
            Money Health <span style={{ color: 'var(--red)' }}>Score</span>
          </h1>
          <p style={{ color: 'var(--muted-2)', fontSize: '14px' }}>3 steps · 2 minutes · 6 financial dimensions</p>
        </div>

        {/* progress */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{
                height: '3px', borderRadius: '4px',
                background: i <= step ? 'var(--red)' : 'var(--border)',
                transition: 'background 0.3s',
                marginBottom: '6px',
              }} />
              <div style={{ fontSize: '11px', color: i <= step ? 'var(--muted-2)' : 'var(--muted)' }}>{s.title}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>{steps[step].title}</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{steps[step].subtitle}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {steps[step].fields.map(f => (
              <label key={f.key}>
                <div style={{ fontSize: '13px', color: 'var(--muted-2)', marginBottom: '6px' }}>{f.label}</div>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  className="input"
                  value={data[f.key] || ''}
                  onChange={e => update(f.key, f.type === 'number' ? +e.target.value : e.target.value)}
                />
              </label>
            ))}

            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { key: 'has_term', label: 'I have term insurance', subKey: 'term_cover', subLabel: 'Cover amount (₹)' },
                  { key: 'has_health', label: 'I have health insurance', subKey: 'health_cover', subLabel: 'Cover amount (₹)' },
                ].map(item => (
                  <div key={item.key}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: data[item.key] ? '10px' : '0' }}>
                      <div
                        onClick={() => update(item.key, !data[item.key])}
                        style={{
                          width: '20px', height: '20px', borderRadius: '6px',
                          border: `2px solid ${data[item.key] ? 'var(--red)' : 'var(--border)'}`,
                          background: data[item.key] ? 'var(--red)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
                        }}>
                        {data[item.key] && <IconCheck size={12} />}
                      </div>
                      <span style={{ fontSize: '14px' }}>{item.label}</span>
                    </label>
                    {data[item.key] && (
                      <input
                        type="number"
                        placeholder={item.subLabel}
                        className="input"
                        onChange={e => update(item.subKey, +e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{ fontSize: '13px', color: 'var(--muted-2)', marginBottom: '8px' }}>Tax Regime</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['old', 'new'].map(r => (
                    <button key={r} onClick={() => update('tax_regime', r)} className="btn" style={{
                      flex: 1, fontSize: '13px',
                      background: data.tax_regime === r ? 'var(--red-dim)' : 'transparent',
                      border: `1px solid ${data.tax_regime === r ? 'rgba(230,51,41,0.4)' : 'var(--border)'}`,
                      color: data.tax_regime === r ? 'var(--text)' : 'var(--muted)',
                    }}>
                      {r === 'old' ? 'Old Regime' : 'New Regime'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '10px' }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn btn-ghost">Back</button>
          )}
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="btn btn-red" style={{ flex: 1 }}>
              Next →
            </button>
          ) : (
            <button onClick={submit} disabled={loading} className="btn btn-red" style={{ flex: 1 }}>
              {loading ? <><IconSpinner size={16} /> Calculating...</> : 'Get My Score →'}
            </button>
          )}
        </div>
      </main>
    </>
  )
}
