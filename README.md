# PocketFit AI Coach

PocketFit AI Coach is a **daily fitness and lifestyle companion** that helps you stay consistent with workouts, nutrition, habits, and important life events — all in one focused dashboard.

It combines AI-powered planning with practical daily tracking to reduce friction and improve long-term consistency.

---

## ✨ Key Features

### 🧭 Daily Focus

* A single **Today’s Focus** panel showing what matters today
* Surfaces:

  * Next important countdown (workout or life event)
  * Remaining calories, protein, and water
* Designed for quick daily check-ins

---

### 🏋️ Fitness & Training

* 🎯 **Personalized Workout Plans**
  AI-generated plans based on goals, experience, and profile
* 💪 **Workout Logger**
  Log exercises with sets, reps, and weights
* 🏋️ **Exercise Form Checker**
  Upload exercise photos for AI-based form feedback
* 📹 **Exercise Tutor**
  Visual guides with cues and safety tips

---

### 🍽️ Nutrition

* 🍽️ **Meal Logging**
  Describe meals in natural language or upload photos
* 🧠 **AI Nutrition Coach**
  Chat-based guidance for diet and food choices
* 📊 **Macro Tracking**
  Daily calories, protein, and nutrition summaries

---

### 💧 Health & Habits

* 💧 **Water Tracking** with daily goals
* 😴 **Sleep Tracking** (hours, quality, trends)
* 🌙 **Night & Reflection Tools**

  * Dream journal with AI interpretation
  * Tomorrow planning
  * Messages to your future self

---

### ⏳ Countdowns & Motivation

* ⏳ **Life & Workout Countdowns**

  * Birthdays, goals, workouts, events
  * Pin one important countdown
  * Visual progress bars
* 🏆 **Achievements & XP**

  * Levels, milestones, and streaks
* 🎯 **Commitments**

  * Set weekly goals (workouts, meals, check-ins)
  * Track consistency over time

---

### 📸 Progress & Accountability

* 📈 **Progress Tracking**

  * Weight logs and trends
  * AI-generated weekly insights
* 📸 **Gym Check-ins**

  * Photo-based attendance tracking
  * Visual progress timeline and comparisons
* 👥 **Accountability Buddies**

  * Invite friends
  * View shared stats and progress

---

## 🖥️ Dashboard Design

* Clean, **collapsible sections** for reduced cognitive load
* Mobile-friendly layout
* Daily Essentials expanded by default
* User-controlled visibility for other sections

---

## 🛠️ Tech Stack

* **Frontend:** React, TypeScript, Vite
* **UI:** Tailwind CSS, shadcn/ui
* **Backend:** Supabase (Auth, Database, Edge Functions)
* **State & Routing:** React Query, React Router
* **AI:** Supabase Edge Functions (OpenAI-based)

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* npm, pnpm, or bun

### Environment Variables

This project uses **Lovable Cloud**, so environment variables are auto-configured:

* `VITE_SUPABASE_URL`
* `VITE_SUPABASE_PUBLISHABLE_KEY`

---

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit: `http://localhost:5173`

---

## 🔄 User Flow Overview

### First Time

1. Click **Start Your Journey**
2. Sign up with email/password
3. Complete onboarding (profile, goals, experience)
4. AI generates personalized workout & diet plans

### Daily Use

1. Check **Today’s Focus**
2. Log workouts, meals, water, or sleep
3. Track progress and streaks
4. Review insights and countdowns

---

## 🧱 Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for detailed system design and data flow.

---

## ✏️ How to Edit

### Use Lovable

Edit visually and via prompts here:
👉 [https://lovable.dev/projects/5feaeb36-a4e2-4bbd-bd46-2af293ee29da](https://lovable.dev/projects/5feaeb36-a4e2-4bbd-bd46-2af293ee29da)

### Use Your IDE

1. Clone this repository
2. Make changes locally
3. Push changes — Lovable will sync automatically

---

## 🌍 Deployment

Publish directly from Lovable:

**Lovable → Share → Publish**

---

## 📦 Versioning

**Current version:** v1.0 (feature-frozen, stable)

Only bug fixes and performance improvements are accepted in this version.

---

## 📄 License

MIT
