# GPD Lab App v3 — Plano de Carreira + Rubrica + Nota Final

Versão ainda mais completa:

- Capstone = **Plano de Desenvolvimento de Carreira (PDI)**.
- Exportação em Markdown inclui:
  - Rubrica com pesos por seção.
  - Blocos de comentários do professor.
  - **Cálculo automático de nota final** (quando o professor envia as notas por seção).

## Fluxo de avaliação

1. Aluno preenche o Capstone (PDI) no tema `CAP`.
2. No Modo Professor, você:
   - Consulta o aluno pelo ID.
   - Preenche as notas (0–10) para cada seção do PDI.
   - Clica em **Exportar Plano de Carreira (Markdown + nota final)**.
3. O backend calcula a nota final com base na rubrica e devolve o Markdown pronto com:
   - texto do aluno
   - notas por seção
   - nota final sugerida.

## Como usar

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:3001/api
