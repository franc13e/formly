# Formly — AI Fitness & Nutrition Tracker for Women

[![CI](https://github.com/franc13e/formly/actions/workflows/ci.yml/badge.svg)](https://github.com/franc13e/formly/actions/workflows/ci.yml)

Formly is a mobile-first fitness app that combines workout logging, nutrition tracking and optional menstrual-cycle tracking, with AI coaching that adapts to where you are in your cycle.

**Live demo:** https://formly-teal.vercel.app

**Tech Stack:** React 19 · TypeScript · Vite · Vitest · FastAPI · Groq LLM API · Vercel (frontend + serverless API)

---

## Screenshots

<p align="center">
  <img src="docs/screenshots/home.png" width="240" alt="Home with cycle phase, today's workouts and weight trend">
  <img src="docs/screenshots/nutrition.png" width="240" alt="Cycle-phase nutrition guidance">
  <img src="docs/screenshots/body.png" width="240" alt="Cycle wheel and phase insights">
</p>

## Features

- **Workout logging**: log workouts by type (cardio, strength, etc.), add notes and PRs, mark rest days, and swipe or tap to delete
- **Nutrition tracking**: describe what you ate and the AI estimates calories, protein, carbs, fats, sugar and fiber
- **AI workout plans**: personalised weekly plans based on your goal (lose fat, build muscle, tone, maintain), activity level and available days
- **Cycle-aware insights**: optional cycle tracking (menstrual, follicular, ovulation, luteal) that tailors body and progress insights to each phase
- **Body measurements**: track weight and measurements over time with supportive, non-judgemental AI feedback
- **Goal suggestions**: AI recommendations for which nutrients to prioritise for your goals
- **Responsive layout**: bottom navigation on mobile, sidebar layout on desktop
- **Local-first**: your data stays in the browser (localStorage)

## Project Structure

```
formly/
├── src/
│   ├── main.tsx          # React entry point
│   ├── App.tsx           # Root component: app state, persistence, navigation
│   ├── types.ts          # Shared domain types
│   ├── theme.ts          # Design tokens and global CSS
│   ├── vite-env.d.ts     # Vite / import.meta.env types
│   ├── pages/            # Onboarding, Dashboard, Nutrition, Body, Workouts, Settings
│   ├── components/       # Shared UI: icons, charts, rings, cycle wheel, AI coach panel
│   ├── data/             # Static data: workouts, foods, coach options, tabs
│   ├── hooks/            # useToast
│   └── lib/              # API client, localStorage helpers, cycle engine (+ unit tests)
├── api/index.py          # Vercel serverless entry for the FastAPI app
├── main.py               # FastAPI backend (AI endpoints)
├── requirements.txt      # Python dependencies
├── package.json          # Frontend dependencies and scripts
├── tsconfig.json         # TypeScript config (strict)
├── vite.config.ts        # Vite + Vitest config
└── vercel.json           # Vercel deployment config
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/nutrition` | Estimate macros from a food description |
| `POST` | `/api/ai-plan` | Generate a personalised workout and nutrition plan |
| `POST` | `/api/body-insight` | Cycle-aware feedback on body measurements |
| `POST` | `/api/health-check` | Feedback on health goals |
| `POST` | `/api/suggest-goals` | Nutrient priorities for the user's goals |
| `GET` | `/api/health` | Health check |

## Running Locally

### Backend

```bash
pip install -r requirements.txt
echo "GROQ_API_KEY=your_key_here" > .env
uvicorn main:app --reload
```

### Frontend

```bash
npm install
npm run dev
```

Checks:

```bash
npm run typecheck   # TypeScript (strict), no emit
npm test            # Vitest unit tests
npm run build       # typecheck + production build to dist/
```

> In development, Vite proxies `/api` to the backend on port 8000. In production, Vercel serves the FastAPI app from `api/index.py` on the same domain, so set `GROQ_API_KEY` in the Vercel project.
