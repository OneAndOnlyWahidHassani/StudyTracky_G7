import { getSessions, getCourses } from '../lib/storage'

export default function DashboardPage() {
  const sessions = getSessions()
  const courses = getCourses()

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const totalHours = (totalMinutes / 60).toFixed(1)

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const thisWeekSessions = sessions.filter(s => new Date(s.startTime) > oneWeekAgo)
  const weekMinutes = thisWeekSessions.reduce((sum, s) => sum + s.durationMinutes, 0)

  // Räkna minuter per kurs
  const minutesPerCourse = {}
  for (const session of sessions) {
    const key = session.courseId || 'ingen'
    minutesPerCourse[key] = (minutesPerCourse[key] || 0) + session.durationMinutes
  }
  const maxMinutes = Math.max(...Object.values(minutesPerCourse), 1)

  const statCardStyle = {
    padding: '20px',
    background: 'var(--bg-surface)',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    textAlign: 'center'
  }

  return (
    <div className="page">

      <h1>Statistik</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e94560' }}>{sessions.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sessioner totalt</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e94560' }}>{totalHours}h</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Studietid totalt</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e94560' }}>{courses.length}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kurser</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e94560' }}>
            {Math.floor(weekMinutes / 60)}h {weekMinutes % 60}m
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Denna vecka</div>
        </div>
      </div>

      {Object.keys(minutesPerCourse).length > 0 && (
        <div style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '16px' }}>Tid per kurs</h2>
          {Object.entries(minutesPerCourse).map(([courseId, mins]) => {
            const course = courses.find(c => c.id === courseId)
            const barWidth = (mins / maxMinutes) * 100
            return (
              <div key={courseId} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span style={{ color: course ? course.color : 'var(--text-muted)' }}>
                    {course ? course.name : 'Ingen kurs'}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {Math.floor(mins / 60)}h {mins % 60}m
                  </span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: '4px', height: '8px' }}>
                  <div style={{
                    background: course ? course.color : '#e94560',
                    borderRadius: '4px',
                    height: '8px',
                    width: barWidth + '%'
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
