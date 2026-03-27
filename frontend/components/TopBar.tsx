'use client'
import Link from 'next/link'

interface Props {
  title?: string
  titleRed?: string
}

export default function TopBar({ title = 'Money Mentor', titleRed }: Props) {
  return (
    <header className="fixed top-0 w-full lg:w-[calc(100%-16rem)] lg:ml-64 flex justify-between items-center px-8 h-16 z-50"
      style={{ background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-2 text-xl font-extrabold text-[#e5e2e1]">
        {titleRed && <span className="text-[#e63329]">{titleRed}</span>}
        {' '}{title}
      </div>
      <div className="hidden md:flex items-center gap-3">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-wider opacity-60">Your data is never stored</span>
        <span className="material-symbols-outlined text-[#e63329] text-sm">lock</span>
      </div>
    </header>
  )
}
