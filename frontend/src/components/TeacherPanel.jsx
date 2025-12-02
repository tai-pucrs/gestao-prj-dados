import React, { useState } from 'react'

export default function TeacherPanel({ apiBase, lessons }) {
  const [viewUserId, setViewUserId] = useState('')
  const [userSubs, setUserSubs] = useState([])
  const [selectedLessonCode, setSelectedLessonCode] = useState('')
  const [lessonSubs, setLessonSubs] = useState([])
  const [capMd, setCapMd] = useState('')
  const [finalScore, setFinalScore] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [grades, setGrades] = useState({
    contexto_atual: '',
    visao_futuro: '',
    forcas: '',
    gaps: '',
    acoes_12_meses: '',
    indicadores_sucesso: '',
    rede_apoio: ''
  })

  function updateGrade(field, value) {
    setGrades(prev => ({ ...prev, [field]: value }))
  }

  async function fetchUserSubs() {
    if (!viewUserId.trim()) {
      setError('Informe um ID/Nome para consultar.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch()
      const data = await res.json()
      setUserSubs(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setError('Erro ao buscar submissões do aluno.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchLessonSubs() {
    if (!selectedLessonCode) {
      setError('Selecione um tema para consultar submissões.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch()
      const data = await res.json()
      setLessonSubs(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setError('Erro ao buscar submissões do tema.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchCapstoneMdRaw() {
    if (!viewUserId.trim()) {
      setError('Informe um ID/Nome para exportar o Plano de Carreira.')
      return
    }
    setError('')
    setLoading(true)
  }

  async function fetchCapstoneMdGraded() {
    if (!viewUserId.trim()) {
      setError('Informe um ID/Nome para exportar o Plano de Carreira.')
      return
    }
    setError('')
    setLoading(true)
    setCapMd('')
    setFinalScore(null)
    try {
      // monta objeto grades numérico quando possível
      const parsedGrades = {}
      Object.entries(grades).forEach(([k, v]) => {
        const n = parseFloat(String(v).replace(',', '.'))
        if (!isNaN(n)) parsedGrades[k] = n
      })

      const res = await fetch(`${apiBase}/capstone/${encodeURIComponent(viewUserId.trim())}/export-md-graded`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grades: parsedGrades })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error || 'Erro ao gerar Plano de Carreira com nota.')
      } else {
        const data = await res.json()
        setCapMd(data.markdown || '')
        setFinalScore(data.finalScore ?? null)
      }
    } catch (e) {
      console.error(e)
      setError('Erro ao exportar Plano de Carreira com nota.')
    } finally {
      setLoading(false)
    }
  }

  function renderSubList(subs) {
    if (!subs.length) return <p style={{ fontSize: '0.9rem' }}>Nenhuma submissão encontrada.</p>

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
        {subs.map(s => (
          <div
            key={s.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '0.75rem',
              background: '#fefefe'
            }}
          >
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              <strong>Submissão #{s.id}</strong> · Exercício: <code>{s.exerciseId}</code>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
              {s.userId && <>Aluno: <code>{s.userId}</code> · </>}Data: {s.createdAt}
            </div>
            <pre
              style={{
                margin: 0,
                padding: '0.5rem',
                borderRadius: '6px',
                background: '#f3f4f6',
                maxHeight: '160px',
                overflow: 'auto',
                fontSize: '0.75rem'
              }}
            >
{JSON.stringify(s.answers, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: '10px',
        border: '1px solid #e5e7eb',
        background: '#f3f4ff'
      }}
    >
      <h2>Painel do Professor</h2>
      <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
        Consulte submissões, preencha as notas do Plano de Carreira e gere o Markdown com rubrica e nota final.
      </p>

      {error && (
        <div
          style={{
            marginTop: '0.5rem',
            marginBottom: '0.5rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            background: '#fef2f2',
            color: '#b91c1c',
            fontSize: '0.85rem'
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
          gap: '1.25rem',
          alignItems: 'flex-start',
          marginTop: '0.75rem'
        }}
      >
        <div>
          <h3>Por aluno</h3>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>ID/Nome do aluno</label>
          <input
            type="text"
            value={viewUserId}
            onChange={e => setViewUserId(e.target.value)}
            placeholder="ex: tai.oliveira"
            style={{
              marginTop: '0.25rem',
              width: '100%',
              padding: '0.4rem 0.55rem',
              borderRadius: '6px',
              border: '1px solid #d4d4d4',
              fontSize: '0.9rem'
            }}
          />

          <div style={{ marginTop: '0.75rem' }}>
            <h4 style={{ marginBottom: '0.35rem' }}>Notas por seção (0–10)</h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 2.2fr) minmax(0, 1fr)',
                gap: '0.4rem 0.75rem',
                alignItems: 'center'
              }}
            >
              <label style={{ fontSize: '0.85rem' }}>Contexto atual</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={grades.contexto_atual}
                onChange={e => updateGrade('contexto_atual', e.target.value)}
                style={{ padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #d4d4d4' }}
              />

              <label style={{ fontSize: '0.85rem' }}>Visão de futuro (3–5 anos)</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={grades.visao_futuro}
                onChange={e => updateGrade('visao_futuro', e.target.value)}
                style={{ padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #d4d4d4' }}
              />

              <label style={{ fontSize: '0.85rem' }}>Forças e diferenciais</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={grades.forcas}
                onChange={e => updateGrade('forcas', e.target.value)}
                style={{ padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #d4d4d4' }}
              />

              <label style={{ fontSize: '0.85rem' }}>Lacunas (gaps)</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={grades.gaps}
                onChange={e => updateGrade('gaps', e.target.value)}
                style={{ padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #d4d4d4' }}
              />

              <label style={{ fontSize: '0.85rem' }}>Ações 12 meses</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={grades.acoes_12_meses}
                onChange={e => updateGrade('acoes_12_meses', e.target.value)}
                style={{ padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #d4d4d4' }}
              />

              <label style={{ fontSize: '0.85rem' }}>Indicadores de sucesso</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={grades.indicadores_sucesso}
                onChange={e => updateGrade('indicadores_sucesso', e.target.value)}
                style={{ padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #d4d4d4' }}
              />

              <label style={{ fontSize: '0.85rem' }}>Rede de apoio e rituais</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={grades.rede_apoio}
                onChange={e => updateGrade('rede_apoio', e.target.value)}
                style={{ padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #d4d4d4' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={fetchUserSubs}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '999px',
                border: 'none',
                background: '#2563eb',
                color: 'white',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
              disabled={loading}
            >
              Ver submissões do aluno
            </button>
            <button
              onClick={fetchCapstoneMdRaw}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '999px',
                border: 'none',
                background: '#4b5563',
                color: 'white',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
              disabled={loading}
            >
              Exportar Plano (modelo)
            </button>
            <button
              onClick={fetchCapstoneMdGraded}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '999px',
                border: 'none',
                background: '#16a34a',
                color: 'white',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
              disabled={loading}
            >
              Exportar Plano + nota final
            </button>
          </div>

          {loading && <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Carregando...</p>}

          <div style={{ marginTop: '0.75rem' }}>
            <h4 style={{ marginBottom: '0.35rem' }}>Submissões do aluno</h4>
            {renderSubList(userSubs)}
          </div>

          {finalScore !== null && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                background: '#ecfdf3',
                border: '1px solid #bbf7d0',
                fontSize: '0.9rem',
                color: '#166534'
              }}
            >
              Nota final sugerida calculada pela rubrica: <strong>{finalScore}</strong>
            </div>
          )}

          {capMd && (
            <div style={{ marginTop: '0.75rem' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Plano de Carreira em Markdown</h4>
              <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Copie e cole esse conteúdo para um editor, LMS ou portfólio.</p>
              <pre
                style={{
                  margin: 0,
                  marginTop: '0.25rem',
                  padding: '0.6rem',
                  borderRadius: '6px',
                  background: '#111827',
                  color: '#e5e7eb',
                  maxHeight: '260px',
                  overflow: 'auto',
                  fontSize: '0.75rem'
                }}
              >
{capMd}
              </pre>
            </div>
          )}
        </div>

        <div>
          <h3>Por tema</h3>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tema</label>
          <select
            value={selectedLessonCode}
            onChange={e => setSelectedLessonCode(e.target.value)}
            style={{
              marginTop: '0.25rem',
              width: '100%',
              padding: '0.4rem 0.55rem',
              borderRadius: '6px',
              border: '1px solid #d4d4d4',
              fontSize: '0.9rem'
            }}
          >
            <option value="">Selecione um tema</option>
            {lessons.map(l => (
              <option key={l.code} value={l.code}>
                {l.code} — {l.title}
              </option>
            ))}
          </select>

          <button
            onClick={fetchLessonSubs}
            style={{
              marginTop: '0.5rem',
              padding: '0.4rem 0.9rem',
              borderRadius: '999px',
              border: 'none',
              background: '#059669',
              color: 'white',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            Ver submissões do tema
          </button>

          <div style={{ marginTop: '0.75rem' }}>
            <h4 style={{ marginBottom: '0.35rem' }}>Submissões do tema</h4>
            {renderSubList(lessonSubs)}
          </div>
        </div>
      </div>
    </div>
  )
}
