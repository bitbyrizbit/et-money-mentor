'use client'
import Link from 'next/link'

interface Props {
  title?: string
  titleRed?: string
}

export default function TopBar({ title = 'Money Mentor', titleRed }: Props) {
  return (
    <header
      className="fixed top-0 left-0 right-0 lg:left-64 flex justify-between items-center px-6 md:px-8 h-14 md:h-16 z-50"
      style={{ background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div className="flex items-center gap-2">
        <Link href="/" className="lg:hidden mr-2" style={{ textDecoration: 'none' }}>
          <div className="w-7 h-7 bg-[#e63329] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-black">ET</span>
          </div>
        </Link>
        <div className="text-lg md:text-xl font-extrabold text-[#e5e2e1] tracking-tight">
          {titleRed && <span className="text-[#e63329]">{titleRed} </span>}
          {title}
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-wider opacity-40">
        <span className="material-symbols-outlined text-[#e63329] text-sm">lock</span>
        Data never stored
      </div>
    </header>
  )
}
