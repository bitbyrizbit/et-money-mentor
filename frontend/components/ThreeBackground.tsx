'use client'
import { useEffect, useRef } from 'react'

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    let disposed = false
    let rafId: number
    let renderer: any
    let mouse = { x: 0, y: 0 }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'

    script.onload = () => {
      if (disposed) return
      const THREE = (window as any).THREE

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setClearColor(0x000000, 0)
      el.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.set(0, 0, 28)

      // floating market value text sprites
      const VALUES = [
        '₹42,85,210', 'XIRR 18.4%', '₹54,200', 'Overlap 64%',
        'NIFTY 50', '₹1.2Cr', 'SIP ₹25,000', 'CAGR 14.2%',
        '₹8.5L', 'Direct Plan', 'ELSS', '80C ₹1.5L',
        'Expense 0.5%', '₹18L drag', 'FIRE ₹6Cr', 'NPS ₹50,000',
        '₹3,42,000', 'Alpha 3.2%', 'Beta 0.87', 'Sharpe 1.4',
      ]

      const sprites: any[] = []

      VALUES.forEach((val, idx) => {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 64
        const ctx = canvas.getContext('2d')!
        ctx.clearRect(0, 0, 256, 64)
        ctx.fillStyle = 'rgba(230, 51, 41, 0.18)'
        ctx.font = '600 18px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(val, 128, 32)

        const tex = new THREE.CanvasTexture(canvas)
        const geo = new THREE.PlaneGeometry(4.2, 1.05)
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 1,
          depthWrite: false,
        })
        const mesh = new THREE.Mesh(geo, mat)

        // spread across scene
        mesh.position.set(
          (Math.random() - 0.5) * 44,
          (Math.random() - 0.5) * 26,
          (Math.random() - 0.5) * 8 - 2
        )
        mesh.userData = {
          baseY: mesh.position.y,
          baseX: mesh.position.x,
          phase: Math.random() * Math.PI * 2,
          speed: 0.15 + Math.random() * 0.2,
          drift: (Math.random() - 0.5) * 0.003,
        }
        scene.add(mesh)
        sprites.push(mesh)
      })

      const onResize = () => {
        if (!renderer) return
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', onResize)

      let t = 0

      const animate = () => {
        if (disposed) return
        rafId = requestAnimationFrame(animate)
        t += 0.005

        sprites.forEach(sprite => {
          const { baseY, baseX, phase, speed, drift } = sprite.userData
          sprite.position.y = baseY + Math.sin(t * speed + phase) * 0.6
          sprite.position.x = baseX + Math.cos(t * speed * 0.7 + phase) * 0.4
          // slow rightward drift, wrap around
          sprite.position.x += drift
          if (sprite.position.x > 24) sprite.position.x = -24
          if (sprite.position.x < -24) sprite.position.x = 24
          // subtle opacity pulse
          sprite.material.opacity = 0.55 + Math.sin(t * speed + phase) * 0.25
        })

        camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.015
        camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.015
        camera.lookAt(0, 0, 0)

        renderer.render(scene, camera)
      }

      animate()

      return () => window.removeEventListener('resize', onResize)
    }

    script.onerror = () => {
      console.warn('Three.js background failed to load')
    }

    document.head.appendChild(script)

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      if (renderer) {
        renderer.dispose()
        renderer.domElement?.parentNode?.removeChild(renderer.domElement)
      }
      script.parentNode?.removeChild(script)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
