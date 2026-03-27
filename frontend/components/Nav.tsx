'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const path = usePathname()

  const links = [
    { href: '/xray', label: 'X-Ray' },
    { href: '/health-score', label: 'Health Score' },
    { href: '/fire', label: 'FIRE Planner' },
  ]

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: '58px',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0,
      background: 'rgba(8,8,8,0.92)',
      backdropFilter: 'blur(20px)',
      zIndex: 100,
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div
          style={{
            width: '28px', height: '28px', background: 'var(--red)', borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '11px', color: 'white',
            transition: 'box-shadow 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(230,51,41,0.5)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
        >ET</div>
        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', letterSpacing: '-0.3px' }}>Money Mentor</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {links.map(l => (
          <Link key={l.href} href={l.href} style={{
            padding: '6px 13px', borderRadius: '8px', fontSize: '13px',
            fontWeight: 500, textDecoration: 'none',
            background: path === l.href ? 'var(--surface-2)' : 'transparent',
            color: path === l.href ? 'var(--text)' : 'var(--muted)',
            border: path === l.href ? '1px solid var(--border)' : '1px solid transparent',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            if (path !== l.href) (e.currentTarget as HTMLElement).style.color = 'var(--muted-2)'
          }}
          onMouseLeave={e => {
            if (path !== l.href) (e.currentTarget as HTMLElement).style.color = 'var(--muted)'
          }}
          >{l.label}</Link>
        ))}
      </div>
    </nav>
  )
}
