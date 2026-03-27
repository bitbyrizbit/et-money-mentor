'use client'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import Nav from '../../components/Nav'
import { IconFire, IconSpinner } from '../../components/Icons'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function FirePage() {
  const [data, setData] = useState<any>({ risk_profile: 'moderate', goals: [] })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [goalInput, setGoalInput] = useState('')
  const [error, setError] = useState('')

  function update(key: string, value: any) {
    setData((p: any) => ({ ...p, [key]: value }))
  }

  function addGoal() {
    if (!goalInput.trim()) return
    setData((p: any) => ({ ...p, goals: [...(p.goals || []), goalInput.trim()] }))
    setGoalInput('')
  }

  async function submit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/fire-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Plan generation failed')
      const json = await res.json()
      setResult(json.plan)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { label: 'Current Age', key: 'age', placeholder: '28' },
    { label: 'Target Retirement Age', key: 'target_age', placeholder: '45' },
    { label: 'Monthly Income (₹)', key: 'income', placeholder: '100000' },
    { label: 'Monthly Expenses (₹)', key: 'expenses', placeholder: '55000' },
    { label: 'Current Investments (₹)', key: 'current_investments', placeholder: '800000' },
    { label: 'Current Monthly SIP (₹)', key: 'current_sip', placeholder: '20000' },
  ]

  if (result) {
    return (
      <>
        <Nav />
        <main style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px', animation: 'fadeUp 0.5s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #f97316, #dc2626)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            }}>
              <IconFire size={20} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>Your FIRE Plan</h1>
              <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Personalised for Indian market conditions</p>
            </div>
          </div>
          <div className="card">
            <div className="prose"><ReactMarkdown>{result}</ReactMarkdown></div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button onClick={() => { setResult(''); setError('') }} className="btn btn-ghost">Recalculate</button>
            <Link href="/health-score" className="btn btn-red" style={{ textDecoration: 'none' }}>Check Health Score →</Link>
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
            FIRE <span style={{ color: 'var(--red)' }}>Planner</span>
          </h1>
          <p style={{ color: 'var(--muted-2)', fontSize: '14px' }}>Your retirement number. Your timeline. Built for India.</p>
        </div>

        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {fields.map(f => (
              <label key={f.key}>
                <div style={{ fontSize: '13px', color: 'var(--muted-2)', marginBottom: '6px' }}>{f.label}</div>
                <input
                  type="number"
                  placeholder={f.placeholder}
                  className="input"
                  onChange={e => update(f.key, +e.target.value)}
                />
              </label>
            ))}

            <div>
              <div style={{ fontSize: '13px', color: 'var(--muted-2)', marginBottom: '8px' }}>Risk Profile</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['conservative', 'moderate', 'aggressive'].map(r => (
                  <button key={r} onClick={() => update('risk_profile', r)} className="btn" style={{
                    flex: 1, fontSize: '12px', padding: '10px 8px', textTransform: 'capitalize',
                    background: data.risk_profile === r ? 'var(--red-dim)' : 'transparent',
                    border: `1px solid ${data.risk_profile === r ? 'rgba(230,51,41,0.4)' : 'var(--border)'}`,
                    color: data.risk_profile === r ? 'var(--text)' : 'var(--muted)',
                  }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', color: 'var(--muted-2)', marginBottom: '8px' }}>Life Goals <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addGoal()}
                  placeholder="e.g. child's education, house purchase"
                  className="input" style={{ fontSize: '13px' }}
                />
                <button onClick={addGoal} className="btn btn-ghost" style={{ padding: '10px 14px', whiteSpace: 'nowrap', fontSize: '13px' }}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {data.goals?.map((g: string, i: number) => (
                  <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 10px', borderRadius: '20px',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    fontSize: '12px', color: 'var(--muted-2)',
                  }}>
                    {g}
                    <button
                      onClick={() => setData((p: any) => ({ ...p, goals: p.goals.filter((_: any, j: number) => j !== i) }))}
                      style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', fontSize: '14px', lineHeight: 1 }}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

        <button onClick={submit} disabled={loading} className="btn btn-red" style={{ width: '100%' }}>
          {loading ? <><IconSpinner size={16} /> Building your plan...</> : 'Build My FIRE Plan →'}
        </button>
      </main>
    </>
  )
}
