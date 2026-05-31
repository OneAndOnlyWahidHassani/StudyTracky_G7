import { useState } from 'react'
import { IconX } from '../components/Icons.jsx'

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