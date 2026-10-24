# Formly — AI Fitness & Nutrition Tracker for Women

Formly is a mobile-first fitness app that combines workout logging, nutrition tracking and optional menstrual-cycle tracking, with AI coaching that adapts to where you are in your cycle.

**Live demo:** https://formly-teal.vercel.app

**Tech Stack:** React 19 · Vite · FastAPI · Groq LLM API · Vercel (frontend) · Railway (backend)

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
│   ├── App.jsx          # Main app: screens, state and UI
│   └── main.jsx         # React entry point
├── main.py              # FastAPI backend (AI endpoints)
├── requirements.txt     # Python dependencies
├── package.json         # Frontend dependencies
└── vercel.json          # Vercel deployment config
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/nutrition` | Estimate macros from a food description |
| `POST` | `/api/ai-plan` | Generate a personalised workout and nutrition plan |
| `POST` | `/api/body-insight` | Cycle-aware feedback on body measurements |
| `POST` | `/api/health-check` | Feedback on health goals |
| `POST` | `/api/suggest-goals` | Nutrient priorities for the user's goals |
| `GET` | `/health` | Health check |

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

> Point the `API` constant in `src/App.jsx` at `http://localhost:8000` when running the backend locally.
