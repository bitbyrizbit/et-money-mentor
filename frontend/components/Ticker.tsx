export default function Ticker() {
  const items = [
    { label: 'MARKET INSIGHT:', text: "AVG INDIAN XIRR IS 8.2% VS NIFTY 50'S 12.3%" },
    { label: 'RISK ALERT:', text: "95% OF INDIANS DON'T HAVE A FINANCIAL PLAN" },
    { label: 'MENTOR TIP:', text: 'SWITCH TO DIRECT PLANS — SAVE ₹18L OVER 20 YEARS' },
    { label: 'FACT:', text: 'AVG PORTFOLIO OVERLAP IN 5-FUND PORTFOLIOS IS 62%' },
    { label: 'MARKET INSIGHT:', text: "AVG INDIAN XIRR IS 8.2% VS NIFTY 50'S 12.3%" },
    { label: 'RISK ALERT:', text: "95% OF INDIANS DON'T HAVE A FINANCIAL PLAN" },
    { label: 'MENTOR TIP:', text: 'SWITCH TO DIRECT PLANS — SAVE ₹18L OVER 20 YEARS' },
    { label: 'FACT:', text: 'AVG PORTFOLIO OVERLAP IN 5-FUND PORTFOLIOS IS 62%' },
  ]
  return (
    <div className="w-full h-7 overflow-hidden flex items-center border-b border-white/[0.03]"
      style={{ background: 'rgba(17,17,17,0.9)' }}>
      <div className="flex gap-10 whitespace-nowrap px-6 animate-marquee">
        {items.map((item, i) => (
          <p key={i} className="text-[0.6rem] md:text-[0.6875rem] font-bold uppercase tracking-widest flex items-center gap-2 flex-shrink-0">
            <span className="text-[#e63329]">{item.label}</span>
            <span className="text-[#e5e2e1]/70">{item.text}</span>
          </p>
        ))}
      </div>
    </div>
  )
}
