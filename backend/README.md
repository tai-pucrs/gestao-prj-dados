# Backend — GPD Lab App v3 (Plano de Carreira + Rubrica + Nota Final)

API base de laboratório + Capstone com Plano de Carreira e rubrica de avaliação.

Rotas principais:

-  — lista de temas (T1...T12 + CAP).
-  — exercícios configurados para o tema (lidos de JSON).
-  — cria submissão (armazenada em memória para fins de laboratório).
-  — lista submissões de um aluno.
-  — lista submissões associadas ao tema.
- `GET /api/capstone/:userId/export-md` — gera Markdown do PDI **sem nota** (modelo com rubrica).
- `POST /api/capstone/:userId/export-md-graded` — gera Markdown do PDI **com notas por seção e nota final**.
