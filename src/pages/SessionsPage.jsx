import { getSessions, getCourses } from '../lib/storage'

function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString('sv-SE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function SessionsPage() {
  const sessions = getSessions().slice().reverse()
  const courses = getCourses()

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return (
    <div className="page">

      <h1>Sessionshistorik</h1>

      <p style={{ color: 'var(--text-muted)' }}>
        Totalt: {hours}h {minutes}min — {sessions.length} sessioner
      </p>

      {sessions.length === 0 ? (
        <p>Inga sessioner än. Starta timern!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sessions.map(session => {
            const course = courses.find(c => c.id === session.courseId)
            return (
              <div
                key={session.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'var(--bg-surface)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}
              >
                <div>
                  <div>
                    {course
                      ? <span style={{ color: course.color }}>● {course.name}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>Ingen kurs</span>
                    }
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {formatDate(session.startTime)}
                  </div>
                </div>
                <span style={{ color: '#4ade80', fontWeight: 'bold' }}>
                  {session.durationMinutes} min
                </span>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}