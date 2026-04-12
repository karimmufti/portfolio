import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Work from './components/Work'
import Contact from './components/Contact'

type OverlayPhase = 'hidden' | 'expanding' | 'fading'

// Must match SPHERE_TOP_PCT in Hero.tsx
const SPHERE_TOP_PCT = 57

export default function App() {
  const [siteVisible, setSiteVisible] = useState(false)
  const [overlayPhase, setOverlayPhase] = useState<OverlayPhase>('hidden')
  const [goingHome, setGoingHome] = useState(false)

  const goHome = () => setGoingHome(true)

  const handleHomeFaded = () => {
    setSiteVisible(false)
    setGoingHome(false)
    window.scrollTo(0, 0)
  }

  // Lock body scroll until the site is revealed
  useEffect(() => {
    const locked = !siteVisible
    document.body.style.overflow = locked ? 'hidden' : ''
    document.documentElement.style.overflow = locked ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [siteVisible])

  const handleEnter = () => setOverlayPhase('expanding')

  const handleExpanded = () => {
    setSiteVisible(true)
    setOverlayPhase('fading')
  }

  return (
    <main className="bg-black text-white">
      {/* ── Phase 1: Hero only (no scroll) ── */}
      {!siteVisible && <Hero onEnter={handleEnter} />}

      {/* ── Phase 2: Full scrollable site ── */}
      {siteVisible && (
        <>
          <Nav onHome={goHome} />
          <section id="about"><About /></section>
          <section id="work"><Work /></section>
          <section id="skills"><Skills /></section>
          <section id="contact"><Contact /></section>
        </>
      )}

      {/* ── Global transition overlay ── */}
      <AnimatePresence>
        {overlayPhase === 'expanding' && (
          <motion.div
            key="circle-expand"
            className="pointer-events-none"
            style={{
              position: 'fixed',
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#000',
              top: `${SPHERE_TOP_PCT}vh`,
              left: '50vw',
              x: '-50%',
              y: '-50%',
              zIndex: 9999,
            }}
            initial={{ scale: 1 }}
            animate={{ scale: 280 }}
            transition={{ duration: 0.72, ease: [0.4, 0, 1, 1] }}
            onAnimationComplete={handleExpanded}
          />
        )}

        {overlayPhase === 'fading' && (
          <motion.div
            key="black-fade"
            className="pointer-events-none"
            style={{
              position: 'fixed',
              inset: 0,
              background: '#000',
              zIndex: 9999,
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={() => setOverlayPhase('hidden')}
          />
        )}
        {goingHome && (
          <motion.div
            key="home-fade"
            className="pointer-events-none"
            style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeIn' }}
            onAnimationComplete={handleHomeFaded}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
