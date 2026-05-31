import { useState } from 'react'
import QuizCard from '../components/QuizCard'

// Samma nyckel som Wahid använder i SettingsModal för att spara inställningar
const SETTINGS_KEY = 'studytracky_settings'

function getSettings() {
  const data = localStorage.getItem(SETTINGS_KEY)
  if (!data) return {}
  return JSON.parse(data)
}

async function generateQuiz(topic) {
  const settings = getSettings()
  const apiKey = settings.apiKey

  if (!apiKey) {
    throw new Error('no_key')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Skapa 5 flervalsfrågor om ämnet: "${topic}".
Svara ENBART med ett JSON-array, ingen annan text.
Format:
[
  {
    "question": "frågetext",
    "options": ["svar A", "svar B", "svar C", "svar D"],
    "correctIndex": 0
  }
]
correctIndex ska vara 0, 1, 2 eller 3 — indexet för rätt svar i options-arrayen.`
        }
      ]
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'API-anropet misslyckades')
  }

  const data = await response.json()

  // Ta bort eventuella markdown-kodblock som Claude kan lägga till
  let text = data.content[0].text.trim()
  if (text.startsWith('```')) {
    text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
  }

  return JSON.parse(text)
}

export default function QuizPage() {
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [chosenIndexes, setChosenIndexes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  async function handleStart(e) {
    e.preventDefault()
    if (!topic.trim()) return

    setLoading(true)
    setError(null)
    setDone(false)
    setCurrentIndex(0)
    setChosenIndexes([])

    try {
      const qs = await generateQuiz(topic.trim())
      setQuestions(qs)
    } catch (err) {
      if (err.message === 'no_key') {
        setError('Ingen API-nyckel hittades. Lägg till din Claude API-nyckel i Inställningar.')
      } else {
        setError('Något gick fel: ' + err.message)
      }
    }

    setLoading(false)
  }

  function handleAnswer(i) {
    const newChosen = [...chosenIndexes, i]
    setChosenIndexes(newChosen)

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setDone(true)
      } else {
        setCurrentIndex(currentIndex + 1)
      }
    }, 1000)
  }

  const score = chosenIndexes.filter((chosen, i) => chosen === questions[i]?.correctIndex).length

  // Resultatskärm
  if (done) {
    return (
      <div className="page" style={{ alignItems: 'center', textAlign: 'center' }}>
        <h1>Quiz klart!</h1>
        <div style={{ padding: '32px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#e94560' }}>
            {score}/{questions.length}
          </div>
          <div style={{ color: 'var(--text-muted)' }}>rätta svar</div>
        </div>
        <p>{score === questions.length ? 'Perfekt! 🎉' : score >= 3 ? 'Bra jobbat!' : 'Öva mer!'}</p>
        <button className="btn btn-primary" onClick={() => { setQuestions([]); setDone(false) }}>
          Nytt quiz
        </button>
      </div>
    )
  }

  // Frågeskärm
  if (questions.length > 0) {
    const current = questions[currentIndex]
    const chosen = chosenIndexes.length > currentIndex ? chosenIndexes[currentIndex] : null
    return (
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Quiz — {topic}</h1>
          <span style={{ color: 'var(--text-muted)' }}>Fråga {currentIndex + 1} av {questions.length}</span>
        </div>

        <QuizCard
          question={current.question}
          options={current.options}
          onAnswer={handleAnswer}
          chosenIndex={chosen}
          correctIndex={current.correctIndex}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          {questions.map((_, i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: i < chosenIndexes.length
                  ? chosenIndexes[i] === questions[i].correctIndex ? '#4ade80' : '#e94560'
                  : i === currentIndex ? 'var(--text)' : 'var(--border)'
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  // Startsida - skriv in ämne
  return (
    <div className="page">
      <h1>Quiz</h1>
      <form
        onSubmit={handleStart}
        style={{ padding: '24px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <div className="form-group">
          <label className="form-label">Vad vill du bli testad på?</label>
          <input
            className="form-input"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="ex. Andra världskriget, JavaScript, Fotosyntesen..."
          />
        </div>
        {error && <p style={{ color: '#e94560' }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading || !topic.trim()}>
          {loading ? 'Genererar frågor...' : 'Generera quiz'}
        </button>
      </form>
    </div>
  )
}
