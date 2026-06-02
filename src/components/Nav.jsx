import { useState } from 'react'
import { SunIcon, MoonIcon } from './Icons'

const PAGES = [
  { id: 'timer', label: 'Timer' },
  { id: 'courses', label: 'Kurser' },
  { id: 'sessions', label: 'Sessioner' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'dashboard', label: 'Statistik' },
]



export default function Nav({ page, setPage, theme, setTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)

  function handleNav(id) {
    setPage(id)
    setMenuOpen(false)
  }

  return (
    <nav className="nav">
      <span className="nav-brand">StudyTracky</span>

      <button className="nav-burger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
        {PAGES.map(p => (
          <button
            key={p.id}
            className={`btn btn-ghost ${page === p.id ? 'nav-link-active' : ''}`}
            onClick={() => handleNav(p.id)}
          >
            {p.label}
          </button>
        ))}
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Byt till ljust tema' : 'Byt till mörkt tema'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </nav>
  )
}
