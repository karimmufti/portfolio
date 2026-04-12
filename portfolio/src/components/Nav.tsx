import { useEffect, useState } from 'react'

interface Props { onHome: () => void }

export default function Nav({ onHome }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 transition-all duration-500 ${
        scrolled ? 'bg-black/70 backdrop-blur-md border-b border-white/5' : ''
      }`}
    >
      <button
        onClick={onHome}
        className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-white/60 hover:text-white transition-colors duration-200"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        Kareem Muftee
      </button>
      <div className="flex gap-8">
        {(['About', 'Work', 'Contact'] as const).map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors duration-200"
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  )
}
