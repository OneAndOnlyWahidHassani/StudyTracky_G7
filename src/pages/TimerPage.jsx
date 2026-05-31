import { useState } from 'react'
import { IconPlay, IconPause, IconRefresh, IconSkipForward, IconSettings, IconX } from '../components/Icons'
import { TIMER_MODES, MODE_LABELS } from '../lib/constants';
import styles from './TimerPage.module.css'

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
                    <button className="btn btn-secondary" onCLick={onClose}>Avbryt</button>
                    <button className="btn btn-primary" onCLick={() => onSave(form)}>Spara</button>
                </div>
            </div>
        </div>
    )

}

export default function TimerPage() {
    const {
        timer,
        settings,
        saveTimerSettings,
        selectedCourseId,
        setSelectedCourseId,
        sessionStartRef
    } = useTimerContext() //kommer skapa den snart 

    const [showSettings, setShowSettings] = useState(false)

    const courses = getCourses() //kommer snart också

    const selectedCourse = courses.find(course => course.id === selectedCourse)

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