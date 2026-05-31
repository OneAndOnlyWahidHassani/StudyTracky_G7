import { useState, useEffect, useRef } from 'react'
import { IconPlay, IconPause, IconRefresh, IconSkipForward, IconSettings, IconX } from '../components/Icons'
import { TIMER_MODES, MODE_LABELS, DEFAULT_SETTINGS } from '../lib/constants';
import styles from './TimerPage.module.css'
import { getCourses, saveSession } from '../lib/storage'

const SETTINGS_KEY = 'studytracky_settings'

//läser inställningar från localStorage och fyller på med standardvärden
function loadSettings() {
    const stored = localStorage.getItem(SETTINGS_KEY)
    const parsed = stored ? JSON.parse(stored) : {}
    return {
        ...DEFAULT_SETTINGS,
        apiKey: '',
        educationLevel: 'kandidat',
        ...parsed,
    }
}

//börjar med formatera siffrorna på timern
function pad(n) {return String(n).padStart(2, '0')}
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${pad(minutes)}:${pad(remainingSeconds)}`
}

//skapar en array med utbildningsnivåer som kan användas i en dropdown-meny
const EDUCATION_LEVELS = [
    {value: 'gymnasie', label: 'Gymnasienivå'},
    {value: 'kandidat', label: 'Kandidatnivå'},
    {value: 'master', label: 'Masternivå'},
    {value: 'forskning', label: 'Forskningnivå'},
]
//tänker settings modalen som en separat komponent
function SettingsModal ({ settings, onSave, onClose}) {
    const [form, setForm] = useState({
        workMinutes: settings.workMinutes,
        breakMinutes: settings.breakMinutes,
        longBreakMinutes: settings.longBreakMinutes,
        sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
        apiKey: settings.apiKey ?? '', //om apiKey är null eller undefined, sätt den till en tom sträng
        educationLevel: settings.educationLevel ?? 'kandidat', //om educationLevel är null eller undefined, sätt den till 'gymnasie'
    })

    const set = (field, value) => {
        setForm(previousForm => ({...previousForm, [field]: value}))
    }
    const setNumber = (field, value) => {
        setForm(previousForm => ({...previousForm, [field]: Number(value)}))
    }
    //ska skapa iconX svgen snart tänkte importera den
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style= {{maxWidth: 420}}>
                <div className="modal-header">
                    <span className="modal-title">Inställningar</span>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><IconX size={18} /></button> 
                </div>

                <p className ="section-title" style ={{marginBottom: '0.75rem'}}>Timer</p>

                <div style = {{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1 rem'}}>
                    
                    <div className="form-group">
                        <label className ="form-label">Fokustid (i minuter) Max: 120</label>
                        <input type="number" className="form-input" min ="1" max ="120" value={form.workMinutes} onChange={e => setNumber('workMinutes', e.target.value)}/>
                    </div>
                    <div className="form-group">
                        <label className ="form-label">Kort paus (i minuter) Max: 60</label>
                        <input type="number" className="form-input" min ="1" max ="60" value={form.breakMinutes} onChange={e => setNumber('breakMinutes', e.target.value)}/>
                    </div>
                    <div className="form-group">
                        <label className ="form-label">Lång paus (i minuter) Max: 120</label>
                        <input type="number" className="form-input" min ="1" max ="120" value={form.longBreakMinutes} onChange={e => setNumber('longBreakMinutes', e.target.value)}/>
                    </div>
                    <div className="form-group">
                        <label className ="form-label">Sessioner/Lång paus Max: 10</label>
                        <input type="number" className="form-input" min ="1" max ="10" value={form.sessionsBeforeLongBreak} onChange={e => setNumber('sessionsBeforeLongBreak', e.target.value)}/>
                    </div>

                </div>

                <div className="divider"/>
                
                <p className ="section-title" style ={{marginBottom: '0.75rem'}}>AI-quiz (Claude API nyckel)</p>

                <div className="form-group">
                    <label className ="form-label">Claude API-nyckel</label>
                    <input type="password" className="form-input" placeholder = "sk-ant-..." value={form.apiKey} onChange={e => set('apiKey', e.target.value)} autoComplete="off"/>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)'}}>Sparas lokalt, skickas aldrig vidare. Krävs för att kunna använda AI-quiz.</span>
                </div>

                <div className="form-group">
                    <label className = "form-label">Utbildningsnivå</label>
                    <select className="form-input" value={form.educationLevel} onChange ={e=> set('educationLevel', e.target.value)}>
                        {EDUCATION_LEVELS.map(level => (
                            <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                    </select>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Avbryt</button>
                    <button className="btn btn-primary" onClick={() => onSave(form)}>Spara</button>
                </div>
            </div>
        </div>
    )

}

export default function TimerPage() {
    const [settings, setSettings] = useState(loadSettings)
    const [mode, setMode] = useState(TIMER_MODES.WORK)
    const [secondsLeft, setSecondsLeft] = useState(settings.workMinutes * 60)
    const [isRunning, setIsRunning] = useState(false)
    const [pomodoroCount, setPomodoroCount] = useState(0)
    const [selectedCourseId, setSelectedCourseId] = useState('')
    const [showSettings, setShowSettings] = useState(false)

    const sessionStartRef = useRef(null)

    //hur många sekunder ett visst läge ska pågå
    const durationFor = (m) => {
        if (m === TIMER_MODES.WORK) return settings.workMinutes * 60
        if (m === TIMER_MODES.BREAK) return settings.breakMinutes * 60
        return settings.longBreakMinutes * 60
    }

    //räknar ner en sekund i taget medan timern är igång
    useEffect(() => {
        if (!isRunning || secondsLeft <= 0) return
        const id = setTimeout(() => setSecondsLeft(s => s - 1), 1000)
        return () => clearTimeout(id)
    }, [isRunning, secondsLeft])

    //när timern når noll: spara session (om fokustid) och gå vidare till nästa läge
    useEffect(() => {
        if (!isRunning || secondsLeft > 0) return
        setIsRunning(false)

        if (mode === TIMER_MODES.WORK) {
            saveSession({
                id: crypto.randomUUID(),
                courseId: selectedCourseId || null,
                startTime: sessionStartRef.current,
                endTime: new Date().toISOString(),
                durationMinutes: settings.workMinutes,
            })
            sessionStartRef.current = null

            const newCount = pomodoroCount + 1
            setPomodoroCount(newCount)
            const nextMode = newCount % settings.sessionsBeforeLongBreak === 0
                ? TIMER_MODES.LONG_BREAK
                : TIMER_MODES.BREAK
            setMode(nextMode)
            setSecondsLeft(durationFor(nextMode))
        } else {
            setMode(TIMER_MODES.WORK)
            setSecondsLeft(durationFor(TIMER_MODES.WORK))
        }
        
    }, [isRunning, secondsLeft])

    const timer = {
        mode,
        secondsLeft,
        isRunning,
        progress: durationFor(mode) > 0 ? (durationFor(mode) - secondsLeft) / durationFor(mode) : 0,
        pomodoroCount,
        start: () => setIsRunning(true),
        pause: () => setIsRunning(false),
        reset: () => {
            setIsRunning(false)
            setSecondsLeft(durationFor(mode))
            sessionStartRef.current = null
        },
        skip: () => {
            setIsRunning(false)

            // Paus -> hoppa direkt till nästa fokuspass utan att räkna
            if (mode !== TIMER_MODES.WORK) {
                sessionStartRef.current = null
                setMode(TIMER_MODES.WORK)
                setSecondsLeft(durationFor(TIMER_MODES.WORK))
                return
            }

            // TESTLÄGE: spara alltid en session vid skip (minst 1 min), så att statistiken fylls på
            const elapsedSec = durationFor(TIMER_MODES.WORK) - secondsLeft
            const studiedMinutes = Math.max(1, Math.round(elapsedSec / 60))
            saveSession({
                id: crypto.randomUUID(),
                courseId: selectedCourseId || null,
                startTime: sessionStartRef.current ?? new Date().toISOString(),
                endTime: new Date().toISOString(),
                durationMinutes: studiedMinutes,
            })
            const newCount = pomodoroCount + 1
            setPomodoroCount(newCount)
            sessionStartRef.current = null

            const nextMode = newCount > 0 && newCount % settings.sessionsBeforeLongBreak === 0
                ? TIMER_MODES.LONG_BREAK
                : TIMER_MODES.BREAK
            setMode(nextMode)
            setSecondsLeft(durationFor(nextMode))
        },
    }

    //sparar nya inställningar lokalt och nollställer timern
    const saveTimerSettings = (form) => {
        const next = { ...settings, ...form }
        setSettings(next)
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
        setIsRunning(false)
        setMode(TIMER_MODES.WORK)
        setSecondsLeft(next.workMinutes * 60)
        setPomodoroCount(0)
        sessionStartRef.current = null
    }

    const courses = getCourses()

    const selectedCourse = courses.find(course => course.id === selectedCourseId)

    const modeColors = {
        [TIMER_MODES.WORK]: 'var(--color-primary)',
        [TIMER_MODES.BREAK]: 'var(--color-success)',
        [TIMER_MODES.LONG_BREAK]: 'var(--color-info)',
    }
    const ringColor = selectedCourse ? selectedCourse.color : modeColors[timer.mode]
    const circumference = 2*Math.PI * 120
    const offset = circumference * (1 -timer.progress) //tänkte ha de i en timercomp eller hook eller båda ska se

    const handlePlay = () => {
        if (timer.isRunning) {
            timer.pause()
        } else {
            if(timer.mode === TIMER_MODES.WORK && !sessionStartRef.current){
                sessionStartRef.current = new Date().toISOString()
            }
            timer.start()
        }
    }
    // ska fylla i snart
    return (
    <div className={styles.page}>
        <div className={styles.pageHeader}>
            <div>
                <h1 className="page-title">Timer</h1>
                <p className="page-subtitle">Pomodoro-timer för fokuserade studiesessioner</p>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={() => setShowSettings(true)} title="Inställningar">
                <IconSettings size={20} />
            </button>
        </div>

        {courses.length > 0 && (
        <div className={styles.courseSelector}>
            <select className="form-input" value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}>
            <option value="">Välj kurs (valfritt)</option>
            {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            </select>
        </div>
        )}

        <div className={styles.timerWrap}>
            <div className={styles.modeLabel}>
                <span
                    className={`badge ${timer.mode === TIMER_MODES.WORK ? 'badge-primary' : 'badge-success'}`}
                    style={{ fontSize: '0.9rem', padding: '0.3rem 1rem' }}
                    >
                    {MODE_LABELS[timer.mode]}
                </span>
            </div>

            <div className={styles.ring}>
            {timer.isRunning && timer.mode === TIMER_MODES.WORK && (
                <div className={styles.breatheWrap} style={{ '--ring-color': ringColor }}>
                    <div className={styles.breatheRing} />
                    <div className={styles.breatheRing} />
                    <div className={styles.breatheRing} />
                </div>
                )}
                <svg width="280" height="280" viewBox="0 0 280 280">
                    <circle cx="140" cy="140" r="120" fill="none" stroke="var(--border)" strokeWidth="12" />
                    <circle
                    cx="140" cy="140" r="120"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 140 140)"
                    style={{
                    transition: timer.isRunning ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.3s ease',
                    filter: `drop-shadow(0 0 12px ${ringColor}80)`,
                    }}
                />
                </svg>
                <div className={styles.timeDisplay}>
                    <span className={styles.time}>{formatTime(timer.secondsLeft)}</span>
                    {selectedCourse && (
                    <span className={styles.courseName} style={{ color: selectedCourse.color }}>
                    {selectedCourse.name}
                    </span>
                    )}
                </div>
            </div>

            <div className={styles.pomodoroCount}>
                {(() => {
                const cycle = timer.pomodoroCount % settings.sessionsBeforeLongBreak
                const filled = cycle === 0 && timer.pomodoroCount > 0 ? settings.sessionsBeforeLongBreak : cycle
                return Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
                <div key={i} className={`${styles.pomodoroDot} ${i < filled ? styles.pomodoroDotFilled : ''}`} />
                ))
                })()}
                <span className={styles.pomodoroLabel}>
                {timer.pomodoroCount} session{timer.pomodoroCount !== 1 ? 'er' : ''} avklarad{timer.pomodoroCount !== 1 ? 'e' : ''}
                </span>
            </div>

            <div className={styles.controls}>
                <button
                className={`btn btn-secondary ${styles.controlBtn}`}
                onClick={timer.reset}
                title="Återställ"
                >
                    <IconRefresh size={22} />
                </button>

                <button
                className={`btn btn-primary ${styles.playBtn}`}
                onClick={handlePlay}
                title={timer.isRunning ? 'Pausa timer' : 'Starta timer'}
                >
                {timer.isRunning ? <IconPause size={28} /> : <IconPlay size={28} />}
                </button>

                <button
                className={`btn btn-secondary ${styles.controlBtn}`}
                onClick={timer.skip}
                title="Hoppa över"
                >
                    <IconSkipForward size={22} />
                </button>
            </div>
        </div>

        {showSettings && (
        <SettingsModal
            settings={settings}
            onSave={(form) => { saveTimerSettings(form); setShowSettings(false) }}
            onClose={() => setShowSettings(false)}
        />
        )}
    </div>
    )




}