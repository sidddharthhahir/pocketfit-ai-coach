# PocketFit AI Coach

An AI-powered personal fitness coach that creates personalized workout plans, diet recommendations, and tracks your progress.

## Features

- 🎯 **Personalized Plans**: AI generates custom workout and diet plans based on your goals
- 📊 **Progress Tracking**: Log weight, track workouts, visualize progress with charts
- 🍽️ **Meal Logging**: Describe meals in natural language, AI calculates nutrition
- 💪 **Workout Logger**: Track completed exercises with notes
- 📈 **Weekly Insights**: AI-powered analysis of your fitness journey
- 🏋️ **Form Checker**: Upload exercise photos for AI form feedback
- 📹 **Exercise Tutor**: Visual guides with form cues and safety tips for each exercise
- 📸 **Gym Check-in**: Photo attendance tracking with habit streaks and gallery

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Edge Functions)
- React Query, React Router

## Setup

### Prerequisites
- Node.js 18+
- npm or bun

### Environment Variables

The app uses Lovable Cloud, so environment variables are auto-configured:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit `http://localhost:5173`

## User Flows

### Getting Started
1. Click "Start Your Journey" on the landing page
2. Sign up with email/password
3. Complete the onboarding form (weight, height, goals, etc.)
4. AI generates your personalized fitness plan

### Daily Usage
1. **Diet Tab**: View today's meal plan, edit meals
2. **Workout Tab**: View exercises, log completion
3. **Log Tab**: Log meals and track workout progress
4. **Progress Tab**: Log weight, generate weekly insights
5. **Profile Tab**: Update your fitness profile

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation.

## How to Edit

**Use Lovable**
Visit the [Lovable Project](https://lovable.dev/projects/5feaeb36-a4e2-4bbd-bd46-2af293ee29da) and start prompting.

**Use your preferred IDE**
Clone this repo and push changes. Pushed changes will also be reflected in Lovable.

## Deploy

Open [Lovable](https://lovable.dev/projects/5feaeb36-a4e2-4bbd-bd46-2af293ee29da) and click on Share -> Publish.

## License

MIT