import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const EMAIL = 'karroomdj2005@gmail.com'
const SYMBOLS = '◆●▲■◇★◈'
const SOURCE = (EMAIL + ' ' + SYMBOLS + ' ' + EMAIL).split('')

interface Particle {
  ch: string
  r: number
  angle: number
  speed: number
  size: number
}

function buildParticles(): Particle[] {
  return SOURCE.map((ch, i) => {
    const t = i / SOURCE.length
    const band = Math.floor(t * 4)
    const baseR = 320 + band * 120 + Math.sin(i * 2.3) * 28
    return {
      ch,
      r: baseR,
      angle: (i / SOURCE.length) * Math.PI * 2 * (band + 1) * 0.7 + band * 0.8,
      speed: (0.006 - band * 0.001) * (0.8 + Math.random() * 0.4),
      size: 12 - band * 0.9,
    }
  })
}

const LOGO_CHARS = '∂∇∑∫λπαεδσ◆●▲★◇μωρβγ·'
const LOGO_SIZE = 120

const GITHUB_SVG = 'M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.09.682-.218.682-.484 0-.236-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z'

interface LogoParticle {
  homeX: number; homeY: number
  x: number; y: number
  vx: number; vy: number
  ch: string
  isLogo: boolean
}

function LogoOrb({ shape, href, label }: {
  shape: 'github' | 'linkedin'
  href: string
  label: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const particlesRef = useRef<LogoParticle[]>([])
  const rafRef = useRef(0)
  const [hovered, setHovered] = useState(false)
  const S = LOGO_SIZE

  useEffect(() => {
    const off = document.createElement('canvas')
    off.width = S; off.height = S
    const ctx = off.getContext('2d')!
    ctx.fillStyle = '#fff'
    if (shape === 'github') {
      const scale = S / 24
      ctx.save()
      ctx.scale(scale, scale)
      ctx.fill(new Path2D(GITHUB_SVG))
      ctx.restore()
    } else {
      ctx.font = `bold ${Math.round(S * 0.78)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('in', S / 2, S / 2)
    }
    const data = ctx.getImageData(0, 0, S, S).data
    const pts: LogoParticle[] = []
    const step = shape === 'github' ? 3 : 4
    for (let y = 0; y < S; y += step) {
      for (let x = 0; x < S; x += step) {
        const isLogo = data[(y * S + x) * 4 + 3] > 64
        pts.push({
          homeX: x, homeY: y, x, y, vx: 0, vy: 0,
          ch: LOGO_CHARS[Math.floor(Math.random() * LOGO_CHARS.length)],
          isLogo,
        })
      }
    }
    particlesRef.current = pts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const REPEL_R = 55, REPEL_F = 5, SPRING = 0.065, FRICTION = 0.80
    const tick = () => {
      ctx.clearRect(0, 0, S, S)
      const mx = mouseRef.current.x, my = mouseRef.current.y
      ctx.font = '8px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const p of particlesRef.current) {
        const dx = p.x - mx, dy = p.y - my
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < REPEL_R && d > 0) {
          const f = (1 - d / REPEL_R) * REPEL_F
          p.vx += (dx / d) * f
          p.vy += (dy / d) * f
        }
        p.vx += (p.homeX - p.x) * SPRING
        p.vy += (p.homeY - p.y) * SPRING
        p.vx *= FRICTION; p.vy *= FRICTION
        p.x += p.vx; p.y += p.vy
        const disp = Math.hypot(p.x - p.homeX, p.y - p.homeY)
        if (p.isLogo) {
          ctx.globalAlpha = Math.max(0.12, 0.9 - disp / 55)
          ctx.fillStyle = '#ffffff'
        } else {
          ctx.globalAlpha = Math.max(0, 1 - disp / 35)
          ctx.fillStyle = '#000000'
        }
        ctx.fillText(p.ch, p.x, p.y)
      }
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="flex flex-col items-center gap-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); mouseRef.current = { x: -9999, y: -9999 } }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block"
        style={{ width: S, height: S, cursor: 'crosshair' }}
      >
        {/* Link revealed from behind as particles scatter */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-mono tracking-[0.18em]"
            style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.5)' }}>
            {shape === 'github' ? 'GitHub ↗' : 'LinkedIn ↗'}
          </span>
        </div>
        {/* Canvas on top — transparent so text shows through when particles scatter */}
        <canvas
          ref={canvasRef}
          width={S}
          height={S}
          className="absolute inset-0"
          style={{ display: 'block' }}
          onMouseMove={e => {
            const r = e.currentTarget.getBoundingClientRect()
            mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
          }}
        />
      </a>
    </div>
  )
}

export default function Contact() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>(buildParticles())
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    const draw = () => {
      const w = canvas.width
      const h = canvas.height

      // Trail effect
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2

      for (const p of particlesRef.current) {
        p.angle += p.speed

        const sx = cx + Math.cos(p.angle) * p.r
        const sy = cy + Math.sin(p.angle) * p.r * 0.42

        // Depth / band determines color: inner orange → outer blue
        const t = Math.max(0, Math.min(1, (p.r - 90) / 200))
        const rr = Math.round(255 + t * (80 - 255))
        const gg = Math.round(140 + t * (180 - 140))
        const bb = Math.round(20 + t * 255)
        const alpha = 0.75 - t * 0.3

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.font = `${p.size}px "JetBrains Mono", monospace`
        ctx.fillStyle = `rgb(${rr},${gg},${bb})`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(p.ch, sx, sy)
        ctx.restore()
      }

      rafId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div
      ref={sectionRef}
      className="relative w-full min-h-screen bg-black flex items-center justify-center overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Dark center fade so foreground is readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 38% 38% at 50% 50%, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
      >
        <p
          className="font-mono uppercase tracking-[0.3em]"
          style={{ fontSize: '0.62rem', color: 'hsl(196,90%,60%)' }}
        >
          Contact
        </p>
        <h2 className="text-3xl text-white" style={{ fontWeight: 100, letterSpacing: '0.06em' }}>
          Let's build something.
        </h2>

        {/* Email */}
        <a
          href="mailto:karroomdj2005@gmail.com"
          className="font-mono text-white/70 hover:text-white transition-colors duration-200 tracking-wide"
          style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}
        >
          karroomdj2005@gmail.com
        </a>

        {/* Interactive logo orbs */}
        <div className="flex gap-16 mt-2">
          <LogoOrb
            shape="github"
            href="https://github.com/karimmufti"
            label="github.com/karimmufti"
          />
          <LogoOrb
            shape="linkedin"
            href="https://linkedin.com/in/kareem-muftee"
            label="linkedin.com/in/kareem-muftee"
          />
        </div>

        <p className="font-mono text-white/20 mt-6" style={{ fontSize: '0.55rem', letterSpacing: '0.2em' }}>
          © {new Date().getFullYear()} Kareem Muftee
        </p>
      </motion.div>
    </div>
  )
}
