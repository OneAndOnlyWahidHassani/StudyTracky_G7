import { useState } from 'react'
import Nav from './components/Nav'
import TimerPage from './pages/TimerPage'
import CoursesPage from './pages/CoursesPage'
import SessionsPage from './pages/SessionsPage'
import QuizPage from './pages/QuizPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const [page, setPage] = useState('timer')
  const [theme, setTheme] = useState('dark')

  return (
    <div className={`app theme-${theme}`}>
      <Nav page={page} setPage={setPage} theme={theme} setTheme={setTheme} />
      <main className="main-content">
        {page === 'timer'     && <TimerPage />}
        {page === 'courses'   && <CoursesPage />}
        {page === 'sessions'  && <SessionsPage />}
        {page === 'quiz'      && <QuizPage />}
        {page === 'dashboard' && <DashboardPage />}
      </main>
    </div>
  )
}