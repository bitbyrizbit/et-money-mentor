export default function Ticker() {
  const items = [
    { label: 'MARKET INSIGHT:', text: 'AVERAGE INDIAN XIRR IS 8.2% VS NIFTY 50\'S 12.3%' },
    { label: 'RISK ALERT:', text: '95% OF INDIANS DON\'T HAVE A FINANCIAL PLAN' },
    { label: 'MENTOR TIP:', text: 'SWITCH TO DIRECT PLANS — SAVE ₹18L OVER 20 YEARS' },
    { label: 'FACT:', text: 'AVERAGE PORTFOLIO OVERLAP IN 5-FUND PORTFOLIOS IS 62%' },
    { label: 'MARKET INSIGHT:', text: 'AVERAGE INDIAN XIRR IS 8.2% VS NIFTY 50\'S 12.3%' },
    { label: 'RISK ALERT:', text: '95% OF INDIANS DON\'T HAVE A FINANCIAL PLAN' },
    { label: 'MENTOR TIP:', text: 'SWITCH TO DIRECT PLANS — SAVE ₹18L OVER 20 YEARS' },
    { label: 'FACT:', text: 'AVERAGE PORTFOLIO OVERLAP IN 5-FUND PORTFOLIOS IS 62%' },
  ]
  return (
    <div className="w-full bg-[#111111] border-b border-white/[0.03] h-8 overflow-hidden flex items-center">
      <div className="flex gap-12 whitespace-nowrap px-8 animate-marquee">
        {items.map((item, i) => (
          <p key={i} className="text-[0.6875rem] font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="text-[#e63329]">{item.label}</span>
            <span className="text-[#e5e2e1]/80">{item.text}</span>
          </p>
        ))}
      </div>
    </div>
  )
}
