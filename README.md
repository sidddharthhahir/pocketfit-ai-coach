# BoomStartAI

Your daily fitness, mindfulness, and lifestyle companion — AI-powered workouts, nutrition, habits, reflection, and accountability in one clean dashboard.

---

## ✨ Features

### 🧭 Daily Focus
- **Today's Focus** panel — next countdown, remaining calories/protein/water at a glance
- Quick daily check-in designed for speed
- Collapsible dashboard sections (Daily Essentials, Countdowns, Stats & Progress, Evening & Reflection)

### 🏋️ Workouts
- **AI Workout Plans** personalized by goal, experience, body profile
- **Workout Logger** with sets, reps, weights, and editable history
- **Exercise Form Checker** — upload photos for AI form feedback
- **Exercise Tutor** — visual guides with cues and safety tips

### 🍽️ Nutrition
- **Meal Logging** via natural language or photo analysis
- **AI Nutrition Coach** chat
- **Macro Tracking** (calories, protein, daily summaries)
- **AI Diet Plan** generation

### 💧 Health & Habits
- **Water Tracking** with daily goals
- **Sleep Tracking** + AI sleep analysis
- **Dream Journal** with AI interpretation
- **Tomorrow Planning** & **Future Messages** to your future self

### ⏳ Countdowns & Motivation
- **Life & Workout Countdowns** with progress bars
- **Achievements, XP & Streaks**
- **Vision Board** & **Commitment Goals**

### 📸 Photos & Progress
- **Weight Tracking** with trend charts
- **AI Weekly Insights**
- **Gym Check-ins** (photo-verified)
- **Photo Timeline & Compare**

### 👥 Accountability
- **Buddy System** — invite friends, share weekly stats and streaks

### 📿 Bhagavad Gita (invite-only)
- Daily verse with translation and reflection
- **Explain Deeper** & **Ask a Question** powered by AI
- **Personal Journal** for private reflections per verse
- **Bookmarks & Favorites** for meaningful verses
- **Chapter Overview Map** across all 18 chapters
- **Reading Streaks** (current & longest)
- **Dashboard widget** for daily verse + progress
- Per-user access control — only granted users see it

---

## 🔒 Onboarding

New users complete a mandatory onboarding form (weight, height, age, gender, goal, experience, dietary preference, activity level, workout days/week). All AI plans are generated from this profile — no generic templates.

---

## 🖥️ Architecture

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript 5, Vite 5 |
| Styling | Tailwind CSS 3, shadcn/ui |
| Backend | Lovable Cloud (Auth, Database, Edge Functions, Storage) |
| State | React Query, React Router 6 |
| AI | Edge Functions calling Lovable AI Gateway (Gemini / GPT models) |

### Key Patterns
- Multi-page layout: `MainLayout` → `DesktopNav` + `MobileNav`
- Collapsible dashboard sections
- **RLS everywhere** — all tables protected with row-level security
- Role-based access via `user_roles` table + security-definer `has_role()`
- Glassmorphism UI with dark/light theme toggle
- Mobile-first responsive design with bottom nav

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
1. Land on hero → **Start Your Journey**
2. Sign up with email/password
3. Complete onboarding
4. AI generates personalized workout + diet plans
5. Redirected to dashboard

### Daily Use
1. Check **Today's Focus**
2. Log workouts, meals, water, sleep
3. Track streaks, countdowns, commitments
4. Reflect with Gita verse + journal (if enabled)
5. Review AI insights

---

## 📂 Project Structure

```
src/
├── pages/           # Route pages (Dashboard, Workouts, Nutrition, Gita, etc.)
├── components/      # Feature components
│   ├── dashboard/   # Dashboard cards & charts
│   ├── gita/        # Gita widgets, chapter map, journal, bookmarks
│   ├── layout/      # MainLayout, DesktopNav, MobileNav
│   └── ui/          # shadcn/ui primitives
├── hooks/           # Custom hooks (auth, stats, gita access, etc.)
├── lib/             # Utilities & validation schemas
├── routes/          # AppRoutes with auth guard
└── integrations/    # Supabase client & types

supabase/
├── functions/       # Edge functions (AI plan generation, gita-verse, etc.)
└── config.toml      # Project configuration
```

---

## 📄 License

MIT
