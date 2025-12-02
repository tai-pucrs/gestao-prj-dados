import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// Lessons (temas da disciplina)
// ---------------------------------------------------------
const lessons = [
  { id: 1, code: "T1", title: "Projeto x Produto x Operação" },
  { id: 2, code: "T2", title: "Triângulo de Ferro e Trade-offs" },
  { id: 3, code: "T3", title: "Ciclo de Vida e Gates" },
  { id: 4, code: "T4", title: "Problema, Hipótese e KPIs" },
  { id: 5, code: "T5", title: "Stakeholders, Comunicação e Rituais" },
  { id: 6, code: "T6", title: "Charter, MVP, Backlog e DOD" },
  { id: 7, code: "T7", title: "Arquitetura e Medallion" },
  { id: 8, code: "T8", title: "Estimativas, Roadmap e Riscos" },
  { id: 9, code: "T9", title: "Qualidade, Testes e Observabilidade" },
  { id: 10, code: "T10", title: "Custos e FinOps" },
  { id: 11, code: "T11", title: "Governança e LGPD" },
  { id: 12, code: "T12", title: "Go-live, Adoção e Encerramento" },
  { id: 13, code: "CAP", title: "Capstone — Plano de Desenvolvimento de Carreira" },
];

function getLessonByCode(code) {
  return lessons.find(l => l.code === code) || null;
}

// ---------------------------------------------------------
// Carrega exercícios a partir dos JSON em src/exercises
// ---------------------------------------------------------
const exercisesDir = path.join(__dirname, "exercises");

function loadExercises() {
  const map = {};
  if (!fs.existsSync(exercisesDir)) {
    return map;
  }
  const files = fs.readdirSync(exercisesDir).filter(f => f.endsWith(".json"));
  for (const file of files) {
    const fullPath = path.join(exercisesDir, file);
    try {
      const raw = fs.readFileSync(fullPath, "utf-8");
      const data = JSON.parse(raw);
      if (data.lessonCode && Array.isArray(data.exercises)) {
        map[data.lessonCode] = data.exercises;
      }
    } catch (err) {
      console.error("Erro ao carregar exercícios de", file, err);
    }
  }
  return map;
}

let exercisesByLesson = loadExercises();

// ---------------------------------------------------------
// In-memory store de submissões (MVP de laboratório)
// ---------------------------------------------------------
const submissions = [];

// ---------------------------------------------------------
// Utilitário: gerar Markdown do Plano de Carreira + Rubrica
// grades é opcional: se vier, calcula nota final e preenche tabela de notas.
// ---------------------------------------------------------
function buildCareerPlanMarkdown(submission, grades) {
  const a = submission.answers || {};
  const titulo = a.titulo_plano || "Plano de carreira sem título";
  const contexto = a.contexto_atual || "";
  const visao = a.visao_futuro || "";
  const forcas = a.forcas || "";
  const gaps = a.gaps || "";
  const acoes = a.acoes_12_meses || "";
  const indicadores = a.indicadores_sucesso || "";
  const rede = a.rede_apoio || "";

  const g = grades || {};

  // Pesos sugeridos para avaliação (em %)
  const pesos = {
    contexto_atual: 15,
    visao_futuro: 20,
    forcas: 10,
    gaps: 15,
    acoes_12_meses: 20,
    indicadores_sucesso: 10,
    rede_apoio: 10,
  };

  function fmtNota(key) {
    const v = g[key];
    if (v === undefined || v === null || isNaN(v)) return "____";
    return String(v);
  }

  function calcNotaFinal() {
    let totalPeso = 0;
    let soma = 0;
    for (const [key, peso] of Object.entries(pesos)) {
      const v = parseFloat(g[key]);
      if (!isNaN(v)) {
        soma += (peso * v) / 10.0;
        totalPeso += peso;
      }
    }
    if (totalPeso === 0) return null;
    // normaliza para 0–10 mesmo se não usar 100% dos pesos
    const nota = soma / totalPeso;
    return Math.round(nota * 100) / 100;
  }

  const notaFinal = calcNotaFinal();

  const linhas = [
    ,
    "",
    ,
    ,
    "",
    "## Estrutura de avaliação sugerida (rubrica)",
    "",
    "| Seção                               | Peso | Nota (0–10) |",
    "|-------------------------------------|------|------------|",
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    "",
  ];

  if (notaFinal !== null) {
    linhas.push("### Nota final sugerida");
    linhas.push("");
    linhas.push();
    linhas.push("");
  } else {
    linhas.push("### Nota final sugerida");
    linhas.push("");
    linhas.push("> Preencha as notas nas colunas acima para calcular a nota final.");
    linhas.push("");
  }

  linhas.push("---", "");
  linhas.push("## 1. Contexto atual");
  linhas.push(contexto, "");
  linhas.push("### Comentários do professor — Contexto atual");
  linhas.push("- Comentário:", "", "---", "");

  linhas.push("## 2. Visão de futuro (3–5 anos)");
  linhas.push(visao, "");
  linhas.push("### Comentários do professor — Visão de futuro");
  linhas.push("- Comentário:", "", "---", "");

  linhas.push("## 3. Forças e diferenciais");
  linhas.push(forcas, "");
  linhas.push("### Comentários do professor — Forças");
  linhas.push("- Comentário:", "", "---", "");

  linhas.push("## 4. Lacunas de habilidades e experiências");
  linhas.push(gaps, "");
  linhas.push("### Comentários do professor — Lacunas (gaps)");
  linhas.push("- Comentário:", "", "---", "");

  linhas.push("## 5. Ações para os próximos 12 meses");
  linhas.push(acoes, "");
  linhas.push("### Comentários do professor — Ações 12 meses");
  linhas.push("- Comentário:", "", "---", "");

  linhas.push("## 6. Indicadores de sucesso");
  linhas.push(indicadores, "");
  linhas.push("### Comentários do professor — Indicadores");
  linhas.push("- Comentário:", "", "---", "");

  linhas.push("## 7. Rede de apoio e rituais");
  linhas.push(rede, "");
  linhas.push("### Comentários do professor — Rede de apoio");
  linhas.push("- Comentário:", "", "");

  return {
    markdown: linhas.join("\n"),
    finalScore: notaFinal,
  };
}

// ---------------------------------------------------------
// Rotas
// ---------------------------------------------------------

// GET /api/lessons
app.get("/api/lessons", (req, res) => {
  res.json(lessons);
});

// GET /api/lessons/:code/exercises
app.get("/api/lessons/:code/exercises", (req, res) => {
  const { code } = req.params;
  const data = exercisesByLesson[code] || [];
  res.json(data);
});

// POST /api/exercises/:id/submissions
app.post("/api/exercises/:id/submissions", (req, res) => {
  const { id } = req.params;
  const { userId, answers } = req.body;

  const submission = {
    id: submissions.length + 1,
    exerciseId: id,
    userId: userId || "anon",
    answers: answers || {},
    score: null,
    createdAt: new Date().toISOString()
  };

  submissions.push(submission);
  res.status(201).json(submission);
});

// GET /api/users/:userId/submissions
app.get("/api/users/:userId/submissions", (req, res) => {
  const { userId } = req.params;
  const userSubs = submissions.filter(s => s.userId === userId);
  res.json(userSubs);
});

// GET /api/lessons/:code/submissions
app.get("/api/lessons/:code/submissions", (req, res) => {
  const { code } = req.params;
  const lesson = getLessonByCode(code);
  if (!lesson) {
    return res.status(404).json({ error: "Lesson não encontrada" });
  }
  const exs = exercisesByLesson[code] || [];
  const ids = new Set(exs.map(e => e.id));
  const result = submissions.filter(s => ids.has(s.exerciseId));
  res.json(result);
});

// GET /api/capstone/:userId/export-md  -> sem notas (modelo)
app.get("/api/capstone/:userId/export-md", (req, res) => {
  const { userId } = req.params;
  const capSubmissions = submissions.filter(
    s => s.userId === userId && s.exerciseId === "cap_carreira_plano"
  );
  if (!capSubmissions.length) {
    return res.status(404).json({ error: "Plano de carreira (Capstone) não encontrado para este usuário" });
  }
  const last = capSubmissions[capSubmissions.length - 1];
  const result = buildCareerPlanMarkdown(last, null);
  res.json({ markdown: result.markdown });
});

// POST /api/capstone/:userId/export-md-graded  -> com notas e nota final
app.post("/api/capstone/:userId/export-md-graded", (req, res) => {
  const { userId } = req.params;
  const { grades } = req.body || {};
  const capSubmissions = submissions.filter(
    s => s.userId === userId && s.exerciseId === "cap_carreira_plano"
  );
  if (!capSubmissions.length) {
    return res.status(404).json({ error: "Plano de carreira (Capstone) não encontrado para este usuário" });
  }
  const last = capSubmissions[capSubmissions.length - 1];
  const result = buildCareerPlanMarkdown(last, grades || {});
  res.json({ markdown: result.markdown, finalScore: result.finalScore });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log();
});
