'use client'
import { useEffect, useRef, useState } from 'react'

export default function Loader({ onDone }: { onDone: () => void }) {
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  const [phase, setPhase] = useState<
    'idle' | 'split' | 'reveal' | 'hold' | 'erase' | 'contract' | 'glow' | 'exit'
  >('idle')

  useEffect(() => {
    let dead = false
    const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))

    const run = async () => {
      await wait(400)
      if (dead) return
      setPhase('split')       // ET slides apart

      await wait(520)
      if (dead) return
      setPhase('reveal')      // conomic + imes blur-reveal

      await wait(900)
      if (dead) return
      setPhase('hold')

      await wait(600)
      if (dead) return
      setPhase('erase')       // conomic + imes blur-fadeout

      await wait(420)
      if (dead) return
      setPhase('contract')    // E and T slide back together

      await wait(500)
      if (dead) return
      setPhase('glow')        // ET pulses red

      await wait(520)
      if (dead) return
      setPhase('exit')

      await wait(520)
      if (dead) return
      onDoneRef.current()
    }

    run()
    return () => { dead = true }
  }, [])

  const isSplit    = ['split','reveal','hold','erase'].includes(phase)
  const showSuffix = ['reveal','hold'].includes(phase)
  const isErasing  = ['erase','contract'].includes(phase)
  const isGlow     = ['glow','exit'].includes(phase)
  const isExit     = phase === 'exit'

  // gap between E and T when split — enough room for "conomic" / "imes"
  const OFFSET = 152

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#080808',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        opacity: isExit ? 0 : 1,
        transition: isExit ? 'opacity 0.48s ease' : 'none',
      }}
    >
      <style>{`
        @keyframes suffixIn {
          0%   { opacity:0; transform:translateX(-8px); filter:blur(6px); }
          100% { opacity:1; transform:translateX(0);    filter:blur(0);   }
        }
        @keyframes suffixOut {
          0%   { opacity:1; transform:translateX(0);    filter:blur(0);   }
          100% { opacity:0; transform:translateX(-8px); filter:blur(6px); }
        }
        @keyframes suffixIn2 {
          0%   { opacity:0; transform:translateX(8px);  filter:blur(6px); }
          100% { opacity:1; transform:translateX(0);    filter:blur(0);   }
        }
        @keyframes suffixOut2 {
          0%   { opacity:1; transform:translateX(0);   filter:blur(0);   }
          100% { opacity:0; transform:translateX(8px); filter:blur(6px); }
        }
        @keyframes etGlow {
          0%   { filter:drop-shadow(0 0 0px rgba(230,51,41,0));   }
          50%  { filter:drop-shadow(0 0 28px rgba(230,51,41,0.75)); }
          100% { filter:drop-shadow(0 0 0px rgba(230,51,41,0));   }
        }
        @keyframes lineDraw {
          from { transform:scaleX(0); opacity:0; }
          to   { transform:scaleX(1); opacity:1; }
        }
        @keyframes subIn {
          from { opacity:0; transform:translateY(5px); }
          to   { opacity:1; transform:translateY(0);   }
        }
      `}</style>

      {/* wordmark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          animation: isGlow && !isExit ? 'etGlow 0.7s ease forwards' : 'none',
        }}
      >
        {/* ── E + conomic ── */}
        <div
          style={{
            display: 'flex', alignItems: 'baseline',
            transform: isSplit ? `translateX(-${OFFSET}px)` : 'translateX(0)',
            transition: 'transform 0.48s cubic-bezier(0.4,0,0.2,1)',
            position: 'relative',
          }}
        >
          <span style={{
            fontSize: '72px', fontWeight: 800,
            color: '#e63329', lineHeight: 1, letterSpacing: '-2px',
          }}>E</span>

          <span style={{
            fontSize: '72px', fontWeight: 800,
            color: 'rgba(255,255,255,0.88)',
            lineHeight: 1, letterSpacing: '-2px',
            display: 'inline-block',
            position: 'absolute',
            left: 'calc(100% + 2px)',
            whiteSpace: 'nowrap',
            animation: showSuffix
              ? 'suffixIn 0.48s cubic-bezier(0.22,1,0.36,1) forwards'
              : isErasing
                ? 'suffixOut 0.36s ease forwards'
                : 'none',
            opacity: 0,
            pointerEvents: 'none',
          }}>
            conomic
          </span>
        </div>

        {/* word gap when expanded */}
        <div style={{
          width: isSplit ? '20px' : '0px',
          transition: 'width 0.48s cubic-bezier(0.4,0,0.2,1)',
          flexShrink: 0,
        }} />

        {/* ── T + imes ── */}
        <div
          style={{
            display: 'flex', alignItems: 'baseline',
            transform: isSplit ? `translateX(${OFFSET}px)` : 'translateX(0)',
            transition: 'transform 0.48s cubic-bezier(0.4,0,0.2,1)',
            position: 'relative',
          }}
        >
          <span style={{
            fontSize: '72px', fontWeight: 800,
            color: '#e63329', lineHeight: 1, letterSpacing: '-2px',
          }}>T</span>

          <span style={{
            fontSize: '72px', fontWeight: 800,
            color: 'rgba(255,255,255,0.88)',
            lineHeight: 1, letterSpacing: '-2px',
            display: 'inline-block',
            position: 'absolute',
            left: 'calc(100% + 2px)',
            whiteSpace: 'nowrap',
            animation: showSuffix
              ? 'suffixIn2 0.48s cubic-bezier(0.22,1,0.36,1) 0.06s forwards'
              : isErasing
                ? 'suffixOut2 0.36s ease forwards'
                : 'none',
            opacity: 0,
            pointerEvents: 'none',
          }}>
            imes
          </span>
        </div>
      </div>

      {/* red underline */}
      <div style={{
        height: '3px',
        width: '80px',
        background: 'linear-gradient(90deg, #e63329, rgba(230,51,41,0.25))',
        borderRadius: '2px',
        marginTop: '16px',
        transformOrigin: 'left center',
        animation: isGlow && !isExit
          ? 'lineDraw 0.4s cubic-bezier(0.4,0,0.2,1) 0.1s forwards'
          : 'none',
        opacity: 0,
      }} />

      {/* subtitle */}
      <div style={{
        position: 'absolute', bottom: '36px',
        fontSize: '11px', fontWeight: 500,
        color: 'rgba(255,255,255,0.16)',
        letterSpacing: '4px', textTransform: 'uppercase',
        fontFamily: 'Inter, system-ui, sans-serif',
        animation: showSuffix ? 'subIn 0.5s ease 0.3s forwards' : 'none',
        opacity: 0,
        transition: isErasing || isExit ? 'opacity 0.3s' : 'none',
      }}>
        Money Mentor
      </div>
    </div>
  )
}