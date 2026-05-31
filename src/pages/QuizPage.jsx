import { useState } from 'react'
import QuizCard from '../components/QuizCard'

const SETTINGS_KEY = 'studytracky_settings'
const QUIZ_KEY = 'studytracky_quiz_results'

function getResults() {
  return JSON.parse(localStorage.getItem(QUIZ_KEY) || '[]')
}

// Sparar ett nytt resultat eller uppdaterar ett befintligt (vid omtagning)
function storeResult(result, existingId) {
  const all = getResults()
  if (existingId) {
    const i = all.findIndex(r => r.id === existingId)
    if (i !== -1) all[i] = result
  } else {
    all.unshift(result)
  }
  localStorage.setItem(QUIZ_KEY, JSON.stringify(all))
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('sv-SE', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

async function generateQuiz(topic) {
  const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
  if (!settings.apiKey) throw new Error('no_key')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
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
      }]
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'API-anropet misslyckades')
  }

  const data = await response.json()
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
  const [savedResults, setSavedResults] = useState(getResults)
  const [expandedId, setExpandedId] = useState(null)
  const [currentResultId, setCurrentResultId] = useState(null)

  async function handleStart(e) {
    e.preventDefault()
    if (!topic.trim()) return

    setLoading(true)
    setError(null)
    setDone(false)
    setCurrentIndex(0)
    setChosenIndexes([])
    setCurrentResultId(null)

    try {
      const qs = await generateQuiz(topic.trim())
      setQuestions(qs)
    } catch (err) {
      setError(err.message === 'no_key'
        ? 'Ingen API-nyckel hittades. Lägg till din Claude API-nyckel i Inställningar.'
        : 'Något gick fel: ' + err.message)
    }

    setLoading(false)
  }

  function handleAnswer(i) {
    const newChosen = [...chosenIndexes, i]
    setChosenIndexes(newChosen)

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        const finalScore = newChosen.filter((chosen, idx) => chosen === questions[idx].correctIndex).length
        const newId = currentResultId || crypto.randomUUID()
        storeResult({ id: newId, topic, date: new Date().toISOString(), score: finalScore, total: questions.length, questions, chosenIndexes: newChosen }, currentResultId)
        setCurrentResultId(newId)
        setSavedResults(getResults())
        setDone(true)
      } else {
        setCurrentIndex(currentIndex + 1)
      }
    }, 1000)
  }

  function goBack() {
    setQuestions([])
    setDone(false)
    setCurrentResultId(null)
  }

  const score = chosenIndexes.filter((chosen, i) => chosen === questions[i]?.correctIndex).length

  // Resultatskärm
  if (done) {
    return (
      <div className="page">
        <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', fontSize: '0.85rem' }} onClick={goBack}>
          ← Tillbaka
        </button>
        <h1>Quiz klart — {topic}</h1>

        <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#e94560' }}>{score}/{questions.length}</div>
          <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>rätta svar</div>
          <p>{score === questions.length ? 'Perfekt! 🎉' : score >= 3 ? 'Bra jobbat!' : 'Öva mer!'}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => { setCurrentIndex(0); setChosenIndexes([]); setDone(false) }}>
            Försök igen
          </button>
          <button className="btn btn-secondary" onClick={goBack}>
            Nytt quiz
          </button>
        </div>

        <h2 style={{ fontSize: '1rem' }}>Granska svar</h2>

        {questions.map((q, i) => (
          <div key={i}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Fråga {i + 1}</p>
            <QuizCard
              question={q.question}
              options={q.options}
              onAnswer={() => {}}
              chosenIndex={chosenIndexes[i]}
              correctIndex={q.correctIndex}
            />
          </div>
        ))}
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
            <div key={i} style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: i < chosenIndexes.length
                ? chosenIndexes[i] === questions[i].correctIndex ? '#4ade80' : '#e94560'
                : i === currentIndex ? 'var(--text)' : 'var(--border)'
            }} />
          ))}
        </div>
      </div>
    )
  }

  // Startsida
  return (
    <div className="page">
      <h1>Quiz</h1>

      <form onSubmit={handleStart} style={{ padding: '24px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

      {savedResults.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1rem' }}>Tidigare quiz</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {savedResults.map(result => (
              <div key={result.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer' }}
                  onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}>
                  <div>
                    <span style={{ fontWeight: '600' }}>{result.topic}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '12px' }}>{formatDate(result.date)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 'bold', color: result.score === result.total ? '#4ade80' : result.score >= result.total / 2 ? 'var(--text)' : '#e94560' }}>
                      {result.score}/{result.total}
                    </span>
                    <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                      onClick={e => {
                        e.stopPropagation()
                        setCurrentResultId(result.id)
                        setTopic(result.topic)
                        setQuestions(result.questions)
                        setCurrentIndex(0)
                        setChosenIndexes([])
                        setDone(false)
                      }}>
                      Försök igen
                    </button>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{expandedId === result.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expandedId === result.id && (
                  <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)' }}>
                    {result.questions.map((q, i) => (
                      <div key={i}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '12px 0 8px' }}>Fråga {i + 1}</p>
                        <QuizCard
                          question={q.question}
                          options={q.options}
                          onAnswer={() => {}}
                          chosenIndex={result.chosenIndexes[i]}
                          correctIndex={q.correctIndex}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
