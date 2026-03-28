'use client'
import { useEffect, useRef } from 'react'

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let disposed = false
    let rafId: number
    let lastFrame = 0
    const FPS = 30
    const interval = 1000 / FPS

    let W = window.innerWidth
    let H = window.innerHeight
    let scrollY = 0

    canvas.width = W
    canvas.height = H

    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }
    const onScroll = () => { scrollY = window.scrollY }

    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { passive: true })

    // ── Candlestick streams ──────────────────────────────────────────────────
    // Multiple vertical "streams" of candlestick bars scrolling upward
    // Each stream is a column of OHLC bars — like a live market feed

    const RED = 'rgba(230,51,41,'
    const GREEN = 'rgba(34,197,94,'
    const DIM = 'rgba(255,255,255,'

    type Candle = {
      open: number
      close: number
      high: number
      low: number
      bullish: boolean
    }

    function makeCandle(prev: number): Candle {
      const change = (Math.random() - 0.48) * 0.12 // slight bearish bias for drama
      const open = prev
      const close = Math.max(0.05, Math.min(0.95, open + change))
      const wick = Math.random() * 0.06
      const high = Math.max(open, close) + wick
      const low = Math.min(open, close) - wick
      return { open, close, high: Math.min(0.98, high), low: Math.max(0.02, low), bullish: close >= open }
    }

    type Stream = {
      x: number
      barH: number
      gap: number
      barW: number
      candles: Candle[]
      offset: number          // pixel offset — scrolls upward
      speed: number
      opacity: number
      totalH: number
    }

    const STREAM_COUNT = 9

    function initStream(i: number): Stream {
      const barH = 18 + Math.random() * 14
      const gap = 4 + Math.random() * 4
      const step = barH + gap
      const totalH = H * 2.5
      const count = Math.ceil(totalH / step) + 4
      const candles: Candle[] = []
      let price = 0.3 + Math.random() * 0.4
      for (let k = 0; k < count; k++) {
        const c = makeCandle(price)
        candles.push(c)
        price = c.close
      }
      return {
        x: (W / (STREAM_COUNT - 1)) * i + (Math.random() - 0.5) * 40,
        barH,
        gap,
        barW: 6 + Math.random() * 6,
        candles,
        offset: Math.random() * totalH,
        speed: 0.25 + Math.random() * 0.35,
        opacity: 0.04 + Math.random() * 0.08,
        totalH,
      }
    }

    const streams: Stream[] = Array.from({ length: STREAM_COUNT }, (_, i) => initStream(i))

    // ── Floating price labels ────────────────────────────────────────────────
    type PriceLabel = {
      x: number
      y: number
      val: string
      opacity: number
      vy: number
      age: number
      maxAge: number
    }

    const labels: PriceLabel[] = []
    let labelTimer = 0

    function spawnLabel() {
      const prices = [
        '₹847.30', '₹2,340', '+2.4%', '-1.8%', '₹18,240', 'NIFTY 24,892',
        'XIRR 12.3%', '₹4.2Cr', 'SIP ₹5K', '+₹1.2L', 'CAGR 18%', '₹0 Fee',
      ]
      labels.push({
        x: 60 + Math.random() * (W - 120),
        y: H + 10,
        val: prices[Math.floor(Math.random() * prices.length)],
        opacity: 0,
        vy: -(0.18 + Math.random() * 0.22),
        age: 0,
        maxAge: 280 + Math.random() * 120,
      })
    }

    // ── Grid lines — horizontal market levels ───────────────────────────────
    const GRID_LINES = 6

    // ── Main render ─────────────────────────────────────────────────────────
    const draw = (timestamp: number) => {
      if (disposed) return
      rafId = requestAnimationFrame(draw)

      if (timestamp - lastFrame < interval) return
      lastFrame = timestamp

      ctx.clearRect(0, 0, W, H)

      // Scroll parallax — move camera down as user scrolls
      const parallax = scrollY * 0.12

      // ── Horizontal grid lines (subtle market levels) ──
      for (let g = 0; g < GRID_LINES; g++) {
        const y = (H / GRID_LINES) * g + (parallax * 0.3) % (H / GRID_LINES)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.strokeStyle = `rgba(255,255,255,0.018)`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // ── Candlestick streams ──
      streams.forEach(s => {
        s.offset += s.speed
        if (s.offset > s.totalH) s.offset = 0

        const step = s.barH + s.gap

        s.candles.forEach((c, idx) => {
          const rawY = idx * step - s.offset + parallax
          const y = rawY % (s.totalH)

          if (y < -s.barH * 2 || y > H + s.barH) return

          const color = c.bullish ? GREEN : RED
          const bodyTop = Math.min(c.open, c.close)
          const bodyBot = Math.max(c.open, c.close)
          const bodyH = Math.max(1.5, (bodyBot - bodyTop) * s.barH)
          const bodyY = y + bodyTop * s.barH

          // wick
          ctx.beginPath()
          ctx.moveTo(s.x, y + c.high * s.barH)
          ctx.lineTo(s.x, y + c.low * s.barH)
          ctx.strokeStyle = `${color}${s.opacity * 0.7})`
          ctx.lineWidth = 1
          ctx.stroke()

          // body
          ctx.fillStyle = `${color}${s.opacity})`
          ctx.fillRect(s.x - s.barW / 2, bodyY, s.barW, bodyH)
        })
      })

      // ── Floating price labels ──
      labelTimer++
      if (labelTimer > 55) {
        labelTimer = 0
        if (labels.length < 8) spawnLabel()
      }

      ctx.font = '500 10px Inter, system-ui, sans-serif'
      ctx.textAlign = 'left'

      for (let li = labels.length - 1; li >= 0; li--) {
        const lb = labels[li]
        lb.y += lb.vy
        lb.age++

        // fade in/out
        if (lb.age < 30) lb.opacity = lb.age / 30 * 0.22
        else if (lb.age > lb.maxAge - 40) lb.opacity = Math.max(0, lb.opacity - 0.006)
        else lb.opacity = Math.min(0.22, lb.opacity + 0.008)

        if (lb.opacity <= 0 || lb.age > lb.maxAge) {
          labels.splice(li, 1)
          continue
        }

        ctx.fillStyle = `${DIM}${lb.opacity})`
        ctx.fillText(lb.val, lb.x, lb.y)
      }

      // ── Subtle vignette ──
      const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.85)
      vg.addColorStop(0, 'rgba(8,8,8,0)')
      vg.addColorStop(1, 'rgba(8,8,8,0.65)')
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, W, H)
    }

    rafId = requestAnimationFrame(draw)

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 1,
      }}
    />
  )
}