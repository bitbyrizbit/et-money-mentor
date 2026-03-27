'use client'
import { useEffect, useRef } from 'react'

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    let disposed = false
    let rafId: number
    let renderer: any, scene: any, camera: any
    let nodes: any[] = []
    let edges: any[] = []
    let mouse = { x: 0, y: 0 }
    let lastFrame = 0
    const FPS = 30
    const interval = 1000 / FPS

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    script.onload = () => {
      if (disposed) return
      const THREE = (window as any).THREE

      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(1) // force 1x — background doesn't need retina
      renderer.setClearColor(0x000000, 0)
      el.appendChild(renderer.domElement)

      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.set(0, 0, 28)

      // 24 nodes — enough for visual richness, not so many it lags
      const NODE_COUNT = 24
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0xe63329, transparent: true, opacity: 0.14 })
      const nodeGeo = new THREE.SphereGeometry(0.1, 6, 6)

      const positions: any[] = []
      for (let i = 0; i < NODE_COUNT; i++) {
        const pos = new THREE.Vector3(
          (Math.random() - 0.5) * 38,
          (Math.random() - 0.5) * 22,
          (Math.random() - 0.5) * 8
        )
        positions.push(pos)
        const mesh = new THREE.Mesh(nodeGeo, nodeMat.clone())
        mesh.position.copy(pos)
        ;(mesh as any)._origin = pos.clone()
        ;(mesh as any)._phase = Math.random() * Math.PI * 2
        scene.add(mesh)
        nodes.push(mesh)
      }

      // only connect nodes within range — fewer edges = better perf
      const edgeMat = new THREE.LineBasicMaterial({ color: 0xe63329, transparent: true, opacity: 0.05 })
      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          if (positions[i].distanceTo(positions[j]) < 8) {
            const geo = new THREE.BufferGeometry().setFromPoints([positions[i].clone(), positions[j].clone()])
            const line = new THREE.Line(geo, edgeMat.clone())
            ;(line as any)._i = i
            ;(line as any)._j = j
            scene.add(line)
            edges.push(line)
          }
        }
      }

      const onResize = () => {
        if (!renderer) return
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', onResize)

      let t = 0
      const animate = (timestamp: number) => {
        if (disposed) return
        rafId = requestAnimationFrame(animate)

        // throttle to 30fps
        if (timestamp - lastFrame < interval) return
        lastFrame = timestamp
        t += 0.006

        nodes.forEach((node) => {
          const phase = (node as any)._phase
          const origin = (node as any)._origin
          node.position.x = origin.x + Math.sin(t * 0.35 + phase) * 1.0
          node.position.y = origin.y + Math.cos(t * 0.28 + phase) * 0.7
          node.position.z = origin.z + Math.sin(t * 0.18 + phase) * 0.4
          node.material.opacity = 0.07 + Math.abs(Math.sin(t * 0.4 + phase)) * 0.10
        })

        // update edge geometry
        edges.forEach(edge => {
          const i = (edge as any)._i
          const j = (edge as any)._j
          const pts = [nodes[i].position.clone(), nodes[j].position.clone()]
          edge.geometry.setFromPoints(pts)
          edge.geometry.attributes.position.needsUpdate = true
        })

        // subtle camera drift
        camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.015
        camera.position.y += (mouse.y * 0.7 - camera.position.y) * 0.015
        camera.lookAt(0, 0, 0)

        renderer.render(scene, camera)
      }
      animate(0)

      return () => window.removeEventListener('resize', onResize)
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
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
