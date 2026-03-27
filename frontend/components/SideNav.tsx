'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/xray', icon: 'monitoring', label: 'Portfolio X-Ray' },
  { href: '/health-score', icon: 'security', label: 'Health Score' },
  { href: '/fire', icon: 'psychology', label: 'FIRE Planner' },
]

export default function SideNav() {
  const path = usePathname()
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#111111] flex flex-col py-8 z-40 hidden lg:flex border-r border-white/[0.03]">
      <div className="px-8 mb-12">
        <Link href="/" className="block">
          <div className="text-[#e63329] font-black text-lg tracking-tighter">ET Money Mentor</div>
          <div className="text-[0.6875rem] font-semibold uppercase tracking-widest opacity-40 mt-1">Sovereign Analyst</div>
        </Link>
      </div>
      <nav className="flex-1 flex flex-col">
        {NAV.map(item => {
          const active = path === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-8 py-4 transition-all text-sm font-semibold
                ${active
                  ? 'text-[#e63329] border-r-2 border-[#e63329] bg-[#1c1b1b] translate-x-0.5'
                  : 'text-[#e5e2e1] opacity-50 hover:bg-[#1c1b1b] hover:opacity-100'
                }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-8 pt-8 border-t border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1c1b1b] flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">lock</span>
          </div>
          <div className="text-[0.6875rem] font-semibold uppercase tracking-widest opacity-40">Secured Access</div>
        </div>
      </div>
    </aside>
  )
}
