const PAGES = [
  { id: 'timer', label: 'Timer' },
  { id: 'courses', label: 'Kurser' },
  { id: 'sessions', label: 'Sessioner' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'dashboard', label: 'Statistik' },
]

export default function Nav({ page, setPage, theme, setTheme }) {
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <nav className="nav">
      <span className="nav-brand">StudyTracky</span>
      <div className="nav-links">
        {PAGES.map(p => (
          <button
            key={p.id}
            className={`btn btn-ghost ${page === p.id ? 'nav-link-active' : ''}`}
            onClick={() => setPage(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <button
        className="btn btn-ghost btn-icon"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Byt till ljust tema' : 'Byt till mörkt tema'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </nav>
  )
}
