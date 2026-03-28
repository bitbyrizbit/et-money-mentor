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

      // node network
      const NODE_COUNT = 38
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0xe63329, transparent: true, opacity: 0.15 })
      const nodeGeo = new THREE.SphereGeometry(0.12, 6, 6)

      const nodes: any[] = []
      const positions: any[] = []

      for (let i = 0; i < NODE_COUNT; i++) {
        const pos = new THREE.Vector3(
          (Math.random() - 0.5) * 38,
          (Math.random() - 0.5) * 22,
          (Math.random() - 0.5) * 12
        )
        positions.push(pos)
        const mat = new THREE.MeshBasicMaterial({ color: 0xe63329, transparent: true, opacity: 0.15 })
        const mesh = new THREE.Mesh(nodeGeo, mat)
        mesh.position.copy(pos)
        mesh.userData = {
          origin: pos.clone(),
          phase: Math.random() * Math.PI * 2,
        }
        scene.add(mesh)
        nodes.push(mesh)
      }

      // edges
      const edges: any[] = []
      const edgeMat = new THREE.LineBasicMaterial({ color: 0xe63329, transparent: true, opacity: 0.05 })
      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          if (positions[i].distanceTo(positions[j]) < 9) {
            const geo = new THREE.BufferGeometry().setFromPoints([positions[i].clone(), positions[j].clone()])
            const mat = new THREE.LineBasicMaterial({ color: 0xe63329, transparent: true, opacity: 0.05 })
            const line = new THREE.Line(geo, mat)
            line.userData = { i, j }
            scene.add(line)
            edges.push(line)
          }
        }
      }

      // ET watermark plane
      const etCanvas = document.createElement('canvas')
      etCanvas.width = 1024
      etCanvas.height = 512
      const ctx = etCanvas.getContext('2d')!
      ctx.clearRect(0, 0, 1024, 512)
      ctx.fillStyle = 'rgba(230, 51, 41, 0.04)'
      ctx.font = '900 420px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('ET', 512, 256)

      const etTex = new THREE.CanvasTexture(etCanvas)
      const etGeo = new THREE.PlaneGeometry(28, 14)
      const etMat = new THREE.MeshBasicMaterial({
        map: etTex,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      })
      const etMesh = new THREE.Mesh(etGeo, etMat)
      etMesh.position.set(0, 0, -4)
      scene.add(etMesh)

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
        t += 0.008

        nodes.forEach(node => {
          const { origin, phase } = node.userData
          node.position.x = origin.x + Math.sin(t * 0.4 + phase) * 1.2
          node.position.y = origin.y + Math.cos(t * 0.3 + phase) * 0.8
          node.position.z = origin.z + Math.sin(t * 0.2 + phase) * 0.5
          node.material.opacity = 0.06 + Math.abs(Math.sin(t * 0.5 + phase)) * 0.12
        })

        edges.forEach(edge => {
          const { i, j } = edge.userData
          const pts = [nodes[i].position.clone(), nodes[j].position.clone()]
          edge.geometry.setFromPoints(pts)
          edge.geometry.attributes.position.needsUpdate = true
        })

        etMesh.rotation.z = Math.sin(t * 0.15) * 0.015
        etMesh.position.x = mouse.x * 0.6
        etMesh.position.y = mouse.y * 0.4

        camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.02
        camera.position.y += (mouse.y * 0.8 - camera.position.y) * 0.02
        camera.lookAt(0, 0, 0)

        renderer.render(scene, camera)
      }

      animate()

      return () => {
        window.removeEventListener('resize', onResize)
      }
    }

    script.onerror = () => {
      // Three.js failed to load — background just won't show, no crash
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
