# GPD Lab App — AI Agent Instructions

## Project Overview

Full-stack lab application for teaching Data Project Management with a **Career Development Plan (PDI)** grading system using a structured rubric.

**Stack:**
- Backend: Express (Node.js ESM) on port 3001
- Frontend: React 18 + Vite dev server on port 5173
- Storage: In-memory (no database; submissions reset on restart)

**Key Workflow:**
1. Student fills exercises for lessons T1–T12 + CAP (Capstone/Career Plan)
2. Teacher reviews submissions, assigns section grades (0–10)
3. System generates Markdown export with calculated final score based on weighted rubric

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

### Capstone Grading Rubric
CAP exercise (`cap_carreira_plano`) has 7 sections with predefined weights:

```javascript
// backend/src/index.js line 65
const pesos = {
  contexto_atual: 15,      // Current context
  visao_futuro: 20,        // 3-5 year vision
  forcas: 10,              // Strengths
  gaps: 15,                // Skill gaps
  acoes_12_meses: 20,      // 12-month actions
  indicadores_sucesso: 10, // Success metrics
  rede_apoio: 10           // Support network
};
```

**Grade calculation:**
- Teacher inputs section grades (0–10) via [TeacherPanel.jsx](frontend/src/components/TeacherPanel.jsx#L107-L120)
- `POST /api/capstone/:userId/export-md-graded` computes weighted average: `Σ(peso × grade/10) / Σpeso`
- Returns Markdown with filled rubric table + final score

**Important:** Weights must sum to 100 for standard 0–10 scale. Formula normalizes if incomplete grades provided.

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

### Backend Patterns
- **ESM modules:** Uses `import`/`export`, requires `"type": "module"` in package.json
- **No middleware for submissions:** Direct JSON body parsing via `express.json()`
- **Error handling:** Minimal; returns 404 on missing userId/lesson, no validation
- **Route naming:** RESTful-ish but mixed (e.g., `/export-md` suffix for specialized endpoints)

### Frontend Patterns
- **State management:** Plain React `useState`, no context/redux
- **API calls:** Direct `fetch()` in components, no abstraction layer
- **Styling:** Inline styles throughout (no CSS files/Tailwind)
- **Form state:** Answers keyed by `exerciseId` in nested object: `{[exId]: {field: value}}`

### Key Files
- [backend/src/index.js](backend/src/index.js) — All API routes, grading logic, exercise loading
- [frontend/src/App.jsx](frontend/src/App.jsx) — Top-level layout, lesson selection, mode toggle
- [frontend/src/components/TeacherPanel.jsx](frontend/src/components/TeacherPanel.jsx) — Submission viewing, grading form, Markdown export
- [frontend/src/components/LessonLab.jsx](frontend/src/components/LessonLab.jsx) — Student exercise interface

## Known Limitations
- **No persistence:** Restart loses all submissions (by design for lab use)
- **No authentication:** userId is self-declared input field
- **In-memory exercise cache:** Changes to JSON files require backend restart
- **Frontend port hardcoded:** Won't work if backend port changes
- **No input validation:** API trusts client-provided data
- **Two moderate npm vulnerabilities** in frontend dependencies (run `npm audit fix` if deploying)

## When Making Changes

**Adding grading criteria:**
1. Add field to CAP.json exercise definition
2. Update `pesos` object in backend `buildCareerPlanMarkdown()`
3. Add input field to TeacherPanel grades state and form grid
4. Ensure total weights = 100 for proper 0–10 scaling

**Changing lesson structure:**
- Update both `lessons[]` constant AND corresponding exercise JSON file
- Lesson `code` field must match JSON filename (e.g., `T1` → `T1.json`)

**UI modifications:**
- All styles are inline—search for `style={{` to locate component styling
- No CSS framework; uses plain semantic HTML + flexbox/grid
