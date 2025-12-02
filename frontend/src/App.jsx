import React, { useEffect, useState } from 'react'
import LessonLab from './components/LessonLab'
import TeacherPanel from './components/TeacherPanel'

const API_BASE = 'http://localhost:3001/api'

export default function App() {
  const [lessons, setLessons] = useState([])
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [userId, setUserId] = useState('aluno-demo')
  const [isTeacherMode, setIsTeacherMode] = useState(false)

  useEffect(() => {
    fetch()
      .then(res => res.json())
      .then(setLessons)
      .catch(console.error)
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>GPD Lab App v3 — Plano de Carreira + Rubrica + Nota Final</h1>
      <p>Laboratório de Gestão de Projetos de Dados com Capstone de Plano de Carreira e avaliação estruturada.</p>

      <div
        style={{
          marginTop: '1rem',
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          background: '#f9fafb',
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ flex: '1 1 260px' }}>
          <label style={{ fontWeight: 600 }}>Seu ID / Nome (para registrar submissões)</label>
          <input
            type="text"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            placeholder="ex: tai.oliveira ou RA do aluno"
            style={{
              marginTop: '0.35rem',
              width: '100%',
              maxWidth: '360px',
              padding: '0.45rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid #d4d4d4'
            }}
          />
        </div>

        <div style={{ flex: '0 0 auto' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isTeacherMode}
              onChange={e => setIsTeacherMode(e.target.checked)}
            />
            <span style={{ fontWeight: 600 }}>Modo Professor</span>
          </label>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
            Consulta submissões e exporta o Plano de Carreira (Capstone) em Markdown com rubrica e nota final.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ minWidth: '260px' }}>
          <h2>Temas</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {lessons.map(lesson => (
              <li key={lesson.code} style={{ marginBottom: '0.5rem' }}>
                <button
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: selectedLesson && selectedLesson.code === lesson.code ? '2px solid #2563eb' : '1px solid #d4d4d4',
                    background: selectedLesson && selectedLesson.code === lesson.code ? '#eff6ff' : '#fff',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <strong>{lesson.code}</strong> — {lesson.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            {selectedLesson ? (
              <LessonLab apiBase={API_BASE} lesson={selectedLesson} userId={userId} />
            ) : (
              <p>Selecione um tema para abrir o laboratório.</p>
            )}
          </div>

          {isTeacherMode && (
            <div>
              <TeacherPanel apiBase={API_BASE} lessons={lessons} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
