import { useState } from 'react'
import CourseForm from './CourseForm'
import { getCourses, deleteCourse } from './storage'

export default function CoursesPage() {
  const [courses, setCourses] = useState(getCourses())
  const [showForm, setShowForm] = useState(false)

  function handleDelete(id) {
    deleteCourse(id)
    setCourses(getCourses())
  }

  function handleSaved() {
    setCourses(getCourses())
    setShowForm(false)
  }

  return (
    <div className="page">

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Mina kurser</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Stäng' : '+ Ny kurs'}
        </button>
      </div>

      {showForm && <CourseForm onSaved={handleSaved} />}

      {courses.length === 0 ? (
        <p>Inga kurser ännu. Lägg till en!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {courses.map(course => (
            <div
              key={course.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: 'var(--bg-surface)',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: course.color }} />
              <span style={{ flex: 1 }}>{course.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{course.weeklyGoalHours}h/vecka</span>
              <button className="btn btn-secondary" onClick={() => handleDelete(course.id)}>Ta bort</button>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}