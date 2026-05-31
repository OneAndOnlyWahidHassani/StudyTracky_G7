import { useState } from 'react'
import { saveCourse } from '../lib/storage'

const COLORS = ['#e94560', '#4ade80', '#60a5fa', '#f59e0b', '#a78bfa']

export default function CourseForm({ onSaved }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [goal, setGoal] = useState(5)

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return

    saveCourse({
      id: crypto.randomUUID(),
      name: name.trim(),
      color: color,
      weeklyGoalHours: goal
    })

    setName('')
    onSaved()
  }

   return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      <div className="form-group">
        <label className="form-label">Kursnamn</label>
        <input
          className="form-input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="ex. Matematik"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Välj färg</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {COLORS.map(c => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: c,
                border: color === c ? '3px solid white' : '2px solid transparent',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Veckомål (timmar)</label>
        <input
          className="form-input"
          type="number"
          min="1"
          max="40"
          value={goal}
          onChange={e => setGoal(Number(e.target.value))}
        />
      </div>

      <button type="submit" className="btn btn-primary">Lägg till kurs</button>

    </form>
  )
}