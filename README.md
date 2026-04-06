# PocketFit AI Coach

Your daily fitness and lifestyle companion — AI-powered workout plans, nutrition tracking, habit logging, and accountability tools in one clean dashboard.

---

## ✨ Features

### 🧭 Daily Focus
- **Today's Focus** panel — next countdown, remaining calories/protein/water at a glance
- Quick daily check-in designed for speed

### 🏋️ Workouts
- **AI Workout Plans** — personalized by goal, experience, and body profile
- **Workout Logger** — log exercises with sets, reps, weights; edit history to fix mistakes
- **Exercise Form Checker** — upload photos for AI form feedback
- **Exercise Tutor** — visual guides with cues and safety tips

### 🍽️ Nutrition
- **Meal Logging** — natural language or photo-based, with edit history
- **AI Nutrition Coach** — chat-based diet guidance
- **Macro Tracking** — daily calories, protein, and nutrition summaries
- **Diet Plan** — AI-generated personalized meal plans

### 💧 Health & Habits
- **Water Tracking** with daily goals
- **Sleep Tracking** — hours, quality, trends, AI sleep analysis
- **Dream Journal** — log dreams with AI interpretation
- **Tomorrow Planning** — prepare tomorrow's tasks tonight
- **Future Messages** — write notes to your future self

### ⏳ Countdowns & Motivation
- **Life & Workout Countdowns** — birthdays, goals, events with progress bars
- **Achievements & XP** — levels, milestones, and streaks
- **Vision Board** — set and track aspirational goals
- **Commitment Goals** — weekly targets for workouts, meals, and check-ins

### 📸 Photos & Progress
- **Weight Tracking** — logs and trend charts
- **AI Weekly Insights** — automated progress analysis
- **Gym Check-ins** — photo-based attendance with AI verification
- **Photo Timeline & Compare** — side-by-side progress comparison

### 👥 Accountability
- **Buddy System** — invite friends via code, view shared weekly stats and streaks

---

## 🔒 Onboarding

New users complete a mandatory onboarding form (weight, height, age, gender, goal, experience, dietary preference, activity level, workout days/week). This data drives all AI-generated plans — no generic templates.

---

## 🖥️ Architecture

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript 5, Vite 5 |
| Styling | Tailwind CSS 3, shadcn/ui |
| Backend | Lovable Cloud (Supabase — Auth, Database, Edge Functions, Storage) |
| State | React Query, React Router 6 |
| AI | Edge Functions calling AI models for plans, form analysis, nutrition chat, sleep insights, weekly insights |

### Key Patterns
- **Multi-page layout** with `MainLayout` → `DesktopNav` + `MobileNav`
- **Collapsible dashboard sections** — Daily Essentials, Countdowns, Stats & Progress, Evening & Reflection
- **RLS everywhere** — all tables protected with row-level security
- **Glassmorphism UI** with dark/light theme toggle
- **Mobile-first** responsive design with bottom nav

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) are auto-configured via Lovable Cloud.

---

## 🔄 User Flow

### First Time
1. Land on hero page → **Start Your Journey**
2. Sign up with email/password
3. Complete onboarding (profile, goals, experience)
4. AI generates personalized workout + diet plans
5. Redirected to dashboard

### Daily Use
1. Check **Today's Focus**
2. Log workouts, meals, water, sleep
3. Track streaks, countdowns, commitments
4. Review AI insights

---

## 📂 Project Structure

```
src/
├── pages/           # Route pages (Dashboard, Workouts, Nutrition, etc.)
├── components/      # Feature components
│   ├── dashboard/   # Dashboard-specific cards and charts
│   ├── layout/      # MainLayout, DesktopNav, MobileNav
│   └── ui/          # shadcn/ui primitives
├── hooks/           # Custom hooks (auth, stats, sleep trends)
├── lib/             # Utilities and validation schemas
├── routes/          # AppRoutes with auth guard
└── integrations/    # Supabase client and types

supabase/
├── functions/       # Edge functions (AI plan generation, form analysis, etc.)
└── config.toml      # Project configuration
```

---

## 📄 License

MIT
