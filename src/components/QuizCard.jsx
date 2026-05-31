export default function QuizCard({ question, options, onAnswer, chosenIndex, correctIndex }) {
  const answered = chosenIndex !== null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
        {question}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {options.map((option, i) => {
          let background = 'var(--bg-surface)'
          let borderColor = 'var(--border)'

          if (answered) {
            if (i === correctIndex) {
              background = 'rgba(74, 222, 128, 0.15)'
              borderColor = '#4ade80'
            } else if (i === chosenIndex) {
              background = 'rgba(233, 69, 96, 0.15)'
              borderColor = '#e94560'
            }
          }

          return (
            <button
              key={i}
              onClick={() => !answered && onAnswer(i)}
              disabled={answered}
              style={{
                padding: '12px 16px',
                background: background,
                border: '1px solid ' + borderColor,
                borderRadius: '8px',
                color: 'var(--text)',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                textAlign: 'left',
                cursor: answered ? 'default' : 'pointer'
              }}
            >
              {option}
            </button>
          )
        })}
      </div>

    </div>
  )
}
