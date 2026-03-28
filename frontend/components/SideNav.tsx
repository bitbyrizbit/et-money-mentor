'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/xray', icon: 'analytics', label: 'X-Ray' },
  { href: '/health-score', icon: 'monitoring', label: 'Health' },
  { href: '/fire', icon: 'psychology', label: 'FIRE' },
]

export default function SideNav() {
  const path = usePathname()
  return (
    <>
      {/* Desktop side nav */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#111111] flex-col py-8 z-40 hidden lg:flex border-r border-white/[0.03]">
        <div className="px-8 mb-12">
          <Link href="/" className="block" style={{ textDecoration: 'none' }}>
            <div className="text-[#e63329] font-black text-lg tracking-tighter">ET Money Mentor</div>
            <div className="text-[0.6rem] font-semibold uppercase tracking-widest opacity-40 mt-1">Sovereign Analyst</div>
          </Link>
        </div>
        <nav className="flex-1 flex flex-col">
          {NAV.map(item => {
            const active = path === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-8 py-4 transition-all text-sm font-semibold ${
                  active
                    ? 'text-[#e63329] border-r-2 border-[#e63329] bg-[#1c1b1b]'
                    : 'text-[#e5e2e1] opacity-50 hover:bg-[#1c1b1b] hover:opacity-100'
                }`}
                style={{ textDecoration: 'none' }}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                {item.label === 'X-Ray' ? 'Portfolio X-Ray' : item.label === 'Health' ? 'Money Health Score' : 'FIRE Planner'}
              </Link>
            )
          })}
        </nav>
        <div className="px-8 pt-8 border-t border-white/[0.05]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-sm opacity-30">lock</span>
            <div className="text-[0.6rem] font-semibold uppercase tracking-widest opacity-30">Zero Storage</div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/[0.07]"
        style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)' }}>
        <Link href="/" className="flex-1 flex flex-col items-center py-3 gap-1" style={{ textDecoration: 'none' }}>
          <span className={`material-symbols-outlined text-lg ${path === '/' ? 'text-[#e63329]' : 'opacity-30'}`}>home</span>
          <span className={`text-[0.55rem] font-bold uppercase tracking-wider ${path === '/' ? 'text-[#e63329]' : 'opacity-30'}`}>Home</span>
        </Link>
        {NAV.map(item => (
          <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center py-3 gap-1" style={{ textDecoration: 'none' }}>
            <span className={`material-symbols-outlined text-lg ${path === item.href ? 'text-[#e63329]' : 'opacity-30'}`}>{item.icon}</span>
            <span className={`text-[0.55rem] font-bold uppercase tracking-wider ${path === item.href ? 'text-[#e63329]' : 'opacity-30'}`}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
