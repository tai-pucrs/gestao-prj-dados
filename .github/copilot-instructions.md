# GPD Lab App — AI Agent Instructions

## 🇧🇷 Language & Communication

**CRITICAL:** All code comments, variable names, function documentation, and communication with the user must be in **Portuguese (Brasil)**. This includes:

- Commit messages
- Code comments and docstrings
- Error messages and logging
- Variable/function naming conventions
- Documentation and instructions
- Chat responses to the user

Esta é uma aplicação educacional brasileira. Mantenha consistência linguística em 100% do código e documentação.

## Project Overview

Full-stack lab application for teaching Data Project Management (Gestão de Projetos de Dados) with a **Career Development Plan (PDI)** grading system using a structured rubric.

**Stack:**

- Backend: Express (Node.js ESM) on port 3001
- Frontend: React 18 + Vite dev server on port 5173
- Storage: In-memory (no database; submissions reset on restart)

**Key Workflow:**

1. Student fills exercises for lessons T1–T12 + CAP (Capstone/Career Plan)
2. Teacher reviews submissions, assigns section grades (0–10)
3. System generates Markdown export with calculated final score based on weighted rubric

**Start commands:**

```bash
# Backend (Terminal 1)
cd backend && npm run dev

# Frontend (Terminal 2)
cd frontend && npm run dev
```

Frontend expects `http://localhost:3001/api` (hardcoded in [App.jsx](frontend/src/App.jsx#L5)).

## Architecture & Data Flow

### Exercise System

Exercises are **statically defined in JSON files** at [backend/src/exercises/](backend/src/exercises/):

- Each `{CODE}.json` (e.g., `T1.json`, `CAP.json`) maps to a lesson code
- Structure: `{ "lessonCode": "T1", "exercises": [{id, type, title, fields}] }`
- Loaded once at startup via `loadExercises()` in [backend/src/index.js](backend/src/index.js#L36-L53)

**Adding new exercises:**

1. Create/edit `backend/src/exercises/{CODE}.json`
2. Restart backend (no hot reload)
3. Frontend fetches via `GET /api/lessons/:code/exercises`

### Submission Flow

- Students submit via `POST /api/exercises/:id/submissions` with `{userId, answers: {field: value}}`
- Stored in-memory array `submissions[]` at [backend/src/index.js](backend/src/index.js#L58)
- No validation/persistence—designed as MVP lab environment

**Answer structure example (CAP):**

```javascript
{
  userId: "tai.oliveira",
  answers: {
    titulo_plano: "Ser Data Engineer Sênior em 3 anos",
    contexto_atual: "Atualmente Data Analyst na ABC Corp...",
    visao_futuro: "Em 5 anos, Principal Engineer em startup B2B...",
    // ... other 5 fields from CAP.json
  }
}
```

### Form State Pattern (Frontend)

[LessonLab.jsx](frontend/src/components/LessonLab.jsx#L1-L50) demonstrates the standard pattern:

```javascript
const [answers, setAnswers] = useState({}); // Nested by exerciseId

function updateAnswer(exId, field, value) {
  setAnswers((prev) => ({
    ...prev,
    [exId]: { ...(prev[exId] || {}), [field]: value },
  }));
}

// Access: answers[exerciseId][fieldName]
// Submit: answers[exerciseId] as the answers payload
```

### Capstone Grading Rubric

CAP exercise (`cap_carreira_plano`) has 7 sections with predefined weights:

```javascript
// backend/src/index.js ~ line 76
const pesos = {
  contexto_atual: 15, // 15%: Current context
  visao_futuro: 20, // 20%: 3-5 year vision
  forcas: 10, // 10%: Strengths
  gaps: 15, // 15%: Skill gaps
  acoes_12_meses: 20, // 20%: 12-month actions
  indicadores_sucesso: 10, // 10%: Success metrics
  rede_apoio: 10, // 10%: Support network
};
// Total: 100%
```

**Grade calculation in `buildCareerPlanMarkdown()`:**

1. Teacher inputs section grades (0–10) via [TeacherPanel.jsx](frontend/src/components/TeacherPanel.jsx#L11-L18)
2. Endpoint: `POST /api/capstone/:userId/export-md-graded` with `{grades: {contexto_atual: N, ...}}`
3. Formula: Weighted average = $\sum(\text{peso} \times \text{grade}/10) / \sum(\text{peso})$
4. Returns: Markdown table + final score (0–10 scale)

**Critical:** Weights sum to 100. Formula auto-normalizes if teacher provides partial grades.

## Development Workflow

### Starting the app

```bash
# Terminal 1 — Backend
cd backend && npm run dev  # nodemon watches src/

# Terminal 2 — Frontend
cd frontend && npm run dev  # Vite HMR on :5173
```

Frontend expects backend at `http://localhost:3001/api` (hardcoded in [App.jsx](frontend/src/App.jsx#L5)).

### Common tasks

- **Add lesson:** Update `lessons[]` array in [backend/src/index.js](backend/src/index.js#L14-L27)
- **Add exercise:** Create/edit JSON in `backend/src/exercises/`, restart backend
- **Modify grading rubric:** Edit `pesos` object in `buildCareerPlanMarkdown()` and `grades` state in [TeacherPanel.jsx](frontend/src/components/TeacherPanel.jsx#L11-L18)

### Testing submissions

1. Set userId in top input field (e.g., `tai.oliveira`)
2. Select lesson, fill exercise form, click "Enviar"
3. Enable "Modo Professor", view submissions by student/lesson
4. For CAP: enter section grades, click "Exportar Plano + nota final"

## Code Conventions

### Backend Patterns (ESM + Express)

- **Imports:** Always use `import`/`export` (not `require`). Requires `"type": "module"` in package.json ✓
- **File references:** Use `path.join(__dirname, ...)` where `__dirname = path.dirname(fileURLToPath(import.meta.url))`
- **No middleware layers:** API routes parse JSON body and build responses inline; no authentication/validation middleware
- **Error handling:** Minimal—returns 404 on missing resources, 201 on successful POST; no try-catch on I/O
- **Exercise loading:** `loadExercises()` reads all JSON files from `src/exercises/` once at startup; changes require restart
- **Route structure:** RESTful-ish: `GET /api/lessons`, `GET /api/lessons/:code/exercises`, `POST /api/exercises/:id/submissions`

**Backend gotchas:**

- Exercise IDs in JSON must be unique across all lessons (no namespacing)
- Frontend hardcodes `API_BASE = 'http://localhost:3001/api'`—won't work if backend port changes

### Frontend Patterns (React + Vite)

- **State:** Plain `useState()`, no context/redux/Zustand
- **API calls:** Direct `fetch()` in components; no wrapper/hooks (not even `useEffect` custom hooks)
- **Styling:** 100% inline styles; no CSS files, no Tailwind, no CSS-in-JS
- **Form state:** Answers stored by exercise ID in nested object: `{[exId]: {field: value, field2: value}}`
- **Conditional rendering:** Simple ternary/&&; no separate presentational components

**Frontend example (standard pattern):**

```jsx
const [answers, setAnswers] = useState({})

// Fetch + render
useEffect(() => {
  fetch(apiUrl).then(r => r.json()).then(setData)
}, [apiUrl])

// Controlled input
<input value={answers[exId]?.[fieldName] || ''} onChange={e => updateAnswer(exId, fieldName, e.target.value)} />
```

### Key Files Exemplifying Patterns

- [backend/src/index.js](backend/src/index.js) — All routes, grading logic, exercise loading
- [frontend/src/App.jsx](frontend/src/App.jsx) — Top-level layout, lesson selection, mode toggle
- [frontend/src/components/TeacherPanel.jsx](frontend/src/components/TeacherPanel.jsx) — Submission viewing, grading form, Markdown export
- [frontend/src/components/LessonLab.jsx](frontend/src/components/LessonLab.jsx) — Student exercise interface (form state pattern)

## Known Limitations

- **No persistence:** Restart loses all submissions (by design for lab use)
- **No authentication:** userId is self-declared input field
- **In-memory exercise cache:** Changes to JSON files require backend restart
- **Frontend port hardcoded:** Won't work if backend port changes
- **No input validation:** API trusts client-provided data
- **Two moderate npm vulnerabilities** in frontend dependencies (run `npm audit fix` if deploying)

## When Making Changes

### Adding/Modifying Grading Criteria

**When adding a new rubric section to CAP:**

1. Add field definition to [backend/src/exercises/CAP.json](backend/src/exercises/CAP.json) in the `fields` array
   - Include `name`, `label`, `type` ("text" or "textarea"), `required` flag
2. Update `pesos` object in [backend/src/index.js](backend/src/index.js#L76) (must sum to 100)
3. Add `field: ''` to `grades` state in [frontend/src/components/TeacherPanel.jsx](frontend/src/components/TeacherPanel.jsx#L11-L18)
4. Add input grid row to grading form in TeacherPanel (copy pattern from existing fields)
5. Add table row to markdown template in `buildCareerPlanMarkdown()` (see line ~120)
6. Restart backend; test: fill exercise → view in teacher panel → export with grades

### Adding New Lessons/Exercises

1. Add entry to `lessons[]` in [backend/src/index.js](backend/src/index.js#L14-L27)
   - Lesson `code` must match JSON filename (e.g., `code: "T13"` → `T13.json`)
2. Create or edit `backend/src/exercises/{CODE}.json` with structure: `{ "lessonCode": "T13", "exercises": [{id, type, title, fields}] }`
3. Restart backend (no hot reload for exercises)
4. Frontend auto-discovers lessons via `GET /api/lessons`

**Exercise JSON structure template:**

```json
{
  "lessonCode": "T13",
  "exercises": [
    {
      "id": "t13_ex1",
      "type": "form_template",
      "title": "Exercise Title",
      "description": "Optional description...",
      "fields": [
        {
          "name": "field1",
          "label": "Label",
          "type": "text",
          "required": true
        },
        {
          "name": "field2",
          "label": "Long answer",
          "type": "textarea",
          "required": false
        }
      ]
    }
  ]
}
```

### UI/Styling Modifications

- All styles are inline: search for `style={{` to locate component styling
- No CSS files exist; all changes are JSX inline props
- Common patterns: flexbox (`display: 'flex', gap: '1rem'`), grid (`gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)'`)
- Colors: use hex (e.g., `#2563eb` = blue, `#16a34a` = green, `#6b7280` = gray)

### Database Persistence (If Needed Later)

- Submissions currently stored in `submissions[]` array (in-memory, volatile)
- To add persistence: modify POST submission handler to write/read from file or database
- No schema migration framework yet; changes would be ad-hoc JSON file or simple SQL
