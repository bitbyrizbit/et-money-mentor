'use client'
import { useEffect, useRef } from 'react'

const SYMBOLS = ['₹', '₿', '$', '€', '¥']

function createFaceCanvas(symbol: string, size: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')!
  const cx = size / 2
  const cy = size / 2
  const r = size / 2

  const gBase = ctx.createRadialGradient(cx * 0.6, cy * 0.55, 0, cx, cy, r)
  gBase.addColorStop(0.00, '#fff8c0')
  gBase.addColorStop(0.10, '#f5d050')
  gBase.addColorStop(0.35, '#c8920a')
  gBase.addColorStop(0.65, '#9a6a00')
  gBase.addColorStop(1.00, '#5a3800')
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = gBase
  ctx.fill()

  // outer rim shadow
  ctx.beginPath()
  ctx.arc(cx, cy, r - 1, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(40,20,0,0.8)'
  ctx.lineWidth = r * 0.065
  ctx.stroke()

  // rim highlight
  ctx.beginPath()
  ctx.arc(cx, cy, r - r * 0.038, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,220,80,0.55)'
  ctx.lineWidth = r * 0.022
  ctx.stroke()

  // milled edge dots
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2
    const dr = r * 0.945
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * dr, cy + Math.sin(a) * dr, r * 0.018, 0, Math.PI * 2)
    ctx.fillStyle = i % 2 === 0 ? 'rgba(40,20,0,0.7)' : 'rgba(255,210,60,0.4)'
    ctx.fill()
  }

  // concentric engraved rings
  ;[0.82, 0.70, 0.56].forEach(rf => {
    const rr = r * rf
    ctx.beginPath()
    ctx.arc(cx, cy, rr, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(50,28,0,0.65)'
    ctx.lineWidth = r * 0.018
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx + r * 0.012, cy + r * 0.012, rr, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,215,60,0.28)'
    ctx.lineWidth = r * 0.009
    ctx.stroke()
  })

  // embossed symbol
  const fs = r * 0.72
  ctx.font = `900 ${fs}px Inter, system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(30,15,0,0.9)'
  ctx.fillText(symbol, cx + r * 0.022, cy + r * 0.028)
  ctx.fillStyle = 'rgba(80,45,0,0.8)'
  ctx.fillText(symbol, cx + r * 0.011, cy + r * 0.014)
  ctx.fillStyle = '#b07c00'
  ctx.fillText(symbol, cx, cy)
  ctx.fillStyle = 'rgba(255,230,90,0.7)'
  ctx.fillText(symbol, cx - r * 0.012, cy - r * 0.014)

  // specular highlight
  const gSpec = ctx.createRadialGradient(cx * 0.52, cy * 0.44, 0, cx * 0.7, cy * 0.6, r * 0.72)
  gSpec.addColorStop(0.00, 'rgba(255,255,230,0.62)')
  gSpec.addColorStop(0.45, 'rgba(255,240,140,0.18)')
  gSpec.addColorStop(1.00, 'rgba(255,220,60,0)')
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = gSpec
  ctx.fill()

  const gDot = ctx.createRadialGradient(cx * 0.62, cy * 0.48, 0, cx * 0.62, cy * 0.48, r * 0.14)
  gDot.addColorStop(0, 'rgba(255,255,240,0.7)')
  gDot.addColorStop(1, 'rgba(255,255,240,0)')
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = gDot
  ctx.fill()

  return c
}

export default function SpinningCoin({ size = 72 }: { size?: number }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const symbolIndex = useRef(0)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    let renderer: any, scene: any, camera: any, coin: any
    let rafId: number
    let disposed = false
    let faceTex: any, backTex: any
    let lastHalf = 0

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'

    script.onload = () => {
      if (disposed) return
      const THREE = (window as any).THREE

      const W = size
      const H = size
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(dpr)
      renderer.setClearColor(0x000000, 0)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.15
      el.appendChild(renderer.domElement)

      scene = new THREE.Scene()

      camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
      camera.position.set(0, 0.3, 3.1)
      camera.lookAt(0, 0, 0)

      // Lights
      scene.add(new THREE.AmbientLight(0xffe0a0, 0.45))

      const key = new THREE.DirectionalLight(0xfff5e0, 2.8)
      key.position.set(-2.5, 3.5, 3)
      scene.add(key)

      const fill = new THREE.DirectionalLight(0xffd060, 0.9)
      fill.position.set(3, 1, 2)
      scene.add(fill)

      const rim = new THREE.DirectionalLight(0xffcc30, 1.4)
      rim.position.set(2, -1.5, -2)
      scene.add(rim)

      scene.add(new THREE.DirectionalLight(0xff9900, 0.3).position.set(0, -3, 1))

      // Geometry
      const coinGeo = new THREE.CylinderGeometry(1, 1, 0.13, 128, 1)

      // Face textures
      const texSize = 512
      const faceCanvas = createFaceCanvas(SYMBOLS[0], texSize)
      faceTex = new THREE.CanvasTexture(faceCanvas)
      faceTex.anisotropy = renderer.capabilities.getMaxAnisotropy()

      const backCanvas = document.createElement('canvas')
      backCanvas.width = texSize
      backCanvas.height = texSize
      const bctx = backCanvas.getContext('2d')!
      bctx.save(); bctx.scale(-1, 1); bctx.drawImage(faceCanvas, -texSize, 0); bctx.restore()
      backTex = new THREE.CanvasTexture(backCanvas)
      backTex.anisotropy = renderer.capabilities.getMaxAnisotropy()

      // Edge texture
      const edgeC = document.createElement('canvas')
      edgeC.width = 512; edgeC.height = 64
      const ec = edgeC.getContext('2d')!
      const gEdge = ec.createLinearGradient(0, 0, 0, 64)
      gEdge.addColorStop(0.00, '#ffe070')
      gEdge.addColorStop(0.22, '#c8920a')
      gEdge.addColorStop(0.50, '#7a5200')
      gEdge.addColorStop(0.78, '#c8920a')
      gEdge.addColorStop(1.00, '#ffe070')
      ec.fillStyle = gEdge
      ec.fillRect(0, 0, 512, 64)
      for (let i = 0; i < 96; i++) {
        const x = (i / 96) * 512
        ec.strokeStyle = i % 2 === 0 ? 'rgba(255,220,80,0.3)' : 'rgba(40,20,0,0.45)'
        ec.lineWidth = 2
        ec.beginPath(); ec.moveTo(x, 0); ec.lineTo(x, 64); ec.stroke()
      }
      const edgeTex = new THREE.CanvasTexture(edgeC)
      edgeTex.wrapS = THREE.RepeatWrapping
      edgeTex.repeat.set(4, 1)

      const matFace = new THREE.MeshStandardMaterial({ map: faceTex, metalness: 0.88, roughness: 0.22 })
      const matBack = new THREE.MeshStandardMaterial({ map: backTex, metalness: 0.88, roughness: 0.22 })
      const matEdge = new THREE.MeshStandardMaterial({ map: edgeTex, metalness: 0.95, roughness: 0.15, color: new THREE.Color('#d4a010') })

      // CylinderGeometry groups: 0=side, 1=top cap, 2=bottom cap
      coin = new THREE.Mesh(coinGeo, [matEdge, matFace, matBack])
      coin.rotation.x = Math.PI / 2
      scene.add(coin)

      // Env map
      try {
        const pmrem = new THREE.PMREMGenerator(renderer)
        const envScene = new THREE.Scene()
        envScene.background = new THREE.Color(0x1a1000)
        ;[[0xffd060, -3, 5, 3],[0xff8800, 3, -2, 2],[0xffffff, 0, 0, -4]].forEach(([col, x, y, z]: any) => {
          const pl = new THREE.PointLight(col, 1.5, 20)
          pl.position.set(x, y, z)
          envScene.add(pl)
        })
        const envMap = pmrem.fromScene(envScene).texture
        scene.environment = envMap
        matFace.envMap = envMap
        matBack.envMap = envMap
        matEdge.envMap = envMap
        pmrem.dispose()
      } catch (_) {}

      const animate = () => {
        if (disposed) return
        rafId = requestAnimationFrame(animate)

        coin.rotation.z += 0.024  // ~1.8s per full rotation

        // swap symbol at edge-on moment (every π radians)
        const half = Math.floor(coin.rotation.z / Math.PI)
        if (half !== lastHalf) {
          lastHalf = half
          symbolIndex.current = (symbolIndex.current + 1) % SYMBOLS.length

          const newFace = createFaceCanvas(SYMBOLS[symbolIndex.current], texSize)
          faceTex.image = newFace
          faceTex.needsUpdate = true

          const nb = document.createElement('canvas')
          nb.width = texSize; nb.height = texSize
          const nbc = nb.getContext('2d')!
          nbc.save(); nbc.scale(-1, 1); nbc.drawImage(newFace, -texSize, 0); nbc.restore()
          backTex.image = nb
          backTex.needsUpdate = true
        }

        // subtle tilt wobble
        coin.rotation.x = Math.PI / 2 + Math.sin(Date.now() * 0.0007) * 0.055

        renderer.render(scene, camera)
      }

      animate()
    }

    document.head.appendChild(script)

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      if (renderer) {
        renderer.dispose()
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement)
        }
      }
      if (script.parentNode) script.parentNode.removeChild(script)
    }
  }, [size])

  return (
    <span style={{
      display: 'inline-block',
      width: `${size}px`,
      height: `${size}px`,
      verticalAlign: 'middle',
      marginBottom: '-5px',
      flexShrink: 0,
    }}>
      <div ref={mountRef} style={{ width: `${size}px`, height: `${size}px` }} />
    </span>
  )
}