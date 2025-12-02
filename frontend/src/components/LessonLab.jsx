import React, { useEffect, useState } from 'react'

export default function LessonLab({ apiBase, lesson, userId }) {
  const [exercises, setExercises] = useState([])
  const [answers, setAnswers] = useState({})
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (!lesson) return
    setStatus('loading')
    fetch()
      .then(res => res.json())
      .then(data => {
        setExercises(data)
        setAnswers({})
        setStatus('ready')
      })
      .catch(err => {
        console.error(err)
        setStatus('error')
      })
  }, [lesson, apiBase])

  function updateAnswer(exId, field, value) {
    setAnswers(prev => ({
      ...prev,
      [exId]: {
        ...(prev[exId] || {}),
        [field]: value
      }
    }))
  }

  async function handleSubmit(ex) {
    if (!userId || !userId.trim()) {
      alert('Informe um ID / Nome antes de enviar as respostas.')
      return
    }

    const body = {
      userId: userId.trim(),
      answers: answers[ex.id] || {}
    }

    await fetch(, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    alert('Submissão enviada!')
  }

  if (status === 'loading') return <p>Carregando exercícios...</p>
  if (status === 'error') return <p>Erro ao carregar exercícios.</p>

  return (
    <div>
      <h2>Lab — {lesson.code} · {lesson.title}</h2>
      {exercises.length === 0 && <p>Sem exercícios configurados ainda para este tema.</p>}

      {exercises.map(ex => (
        <div
          key={ex.id}
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            background: '#fafafa'
          }}
        >
          <h3>{ex.title}</h3>
          {ex.description && <p>{ex.description}</p>}

          {ex.type === 'form_template' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              {ex.fields?.map(field => (
                <div key={field.name}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {field.label}
                  </label>
                  {field.type === 'text' ? (
                    <input
                      type="text"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d4d4d4' }}
                      value={answers[ex.id]?.[field.name] || ''}
                      onChange={e => updateAnswer(ex.id, field.name, e.target.value)}
                    />
                  ) : (
                    <textarea
                      rows={3}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d4d4d4' }}
                      value={answers[ex.id]?.[field.name] || ''}
                      onChange={e => updateAnswer(ex.id, field.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

{