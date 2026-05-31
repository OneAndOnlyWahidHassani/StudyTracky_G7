import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { getSessions, getCourses } from '../lib/storage'

const DAY_NAMES = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör']

export default function DashboardPage() {
  const sessions = getSessions()
  const courses = getCourses()

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const totalHours = (totalMinutes / 60).toFixed(1)

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const thisWeekSessions = sessions.filter(s => new Date(s.startTime) > oneWeekAgo)
  const weekMinutes = thisWeekSessions.reduce((sum, s) => sum + s.durationMinutes, 0)

  // Bygg data för stapeldiagram – senaste 7 dagarna
  const DAY_NAMES = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör']
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (6 - i))
    return { day: DAY_NAMES[d.getDay()], minutes: 0, date: d }
  })
  for (const s of sessions) {
    const sd = new Date(s.startTime)
    sd.setHours(0, 0, 0, 0)
    const slot = dailyData.find(d => d.date.getTime() === sd.getTime())
    if (slot) slot.minutes += s.durationMinutes
  }

  // Bygg data för cirkeldiagram – tid per kurs
  const minutesPerCourse = {}
  for (const session of sessions) {
    const key = session.courseId || '__ingen__'
    minutesPerCourse[key] = (minutesPerCourse[key] || 0) + session.durationMinutes
  }
  const pieData = Object.entries(minutesPerCourse).map(([courseId, mins]) => {
    const course = courses.find(c => c.id === courseId)
    return {
      name: course ? course.name : 'Ingen kurs',
      value: mins,
      color: course ? course.color : '#e94560'
    }
  })

  const formatMinutes = (mins) =>
    mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`

  const chartCardStyle = {
    padding: '20px',
    background: 'var(--bg-surface)',
    borderRadius: '8px',
    border: '1px solid var(--border)'
  }

  const tooltipStyle = {
    backgroundColor: 'var(--bg-surface, #1a1a2e)',
    border: '1px solid var(--border, #333)',
    borderRadius: '6px',
    color: 'var(--text, #eee)'
  }

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

      {/* Stapeldiagram – studietid per dag */}
      <div style={chartCardStyle}>
        <h2 style={{ fontSize: '1rem', marginBottom: '16px' }}>Studietid senaste 7 dagarna</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dailyData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #333)" />
            <XAxis dataKey="day" tick={{ fill: 'var(--text-muted, #aaa)', fontSize: 12 }} />
            <YAxis
              tickFormatter={v => v >= 60 ? `${Math.floor(v / 60)}h` : `${v}m`}
              tick={{ fill: 'var(--text-muted, #aaa)', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [formatMinutes(value), 'Studietid']}
            />
            <Bar dataKey="minutes" fill="#e94560" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cirkeldiagram – tid per kurs */}
      {pieData.length > 0 && (
        <div style={chartCardStyle}>
          <h2 style={{ fontSize: '1rem', marginBottom: '16px' }}>Fördelning per kurs</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={true}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [formatMinutes(value), 'Studietid']}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: 'var(--text-muted, #aaa)', fontSize: '0.85rem' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  )
}
