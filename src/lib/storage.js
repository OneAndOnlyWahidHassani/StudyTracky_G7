const COURSES_KEY = 'studytracky_courses'
const SESSIONS_KEY = 'studytracky_sessions'

export function getCourses() {
    const data = localStorage.getItem(COURSES_KEY)
    if (!data) return []
    return JSON.parse(data)
}

export function saveCourse(course) {
  const courses = getCourses()
  courses.push(course)
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses))
}

export function deleteCourse(id) {
  const courses = getCourses().filter(c => c.id !== id)
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses))
}

export function getSessions() {
  const data = localStorage.getItem(SESSIONS_KEY)
  if (!data) return []
  return JSON.parse(data)
}

export function saveSession(session) {
  const sessions = getSessions()
  sessions.push(session)
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}