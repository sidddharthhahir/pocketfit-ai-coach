# PocketFit AI Coach - Architecture

## Overview

PocketFit AI is a full-stack fitness coaching application built with React + TypeScript frontend and Supabase backend. The app provides AI-powered personalized workout and diet plans.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **AI**: Lovable AI Gateway (Google Gemini)

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/              # shadcn/ui components
│   ├── Dashboard.tsx    # Main dashboard with tabs
│   ├── Hero.tsx         # Landing page hero
│   ├── OnboardingForm.tsx # User profile setup
│   ├── DietPlan.tsx     # Diet plan display & editing
│   ├── WorkoutPlan.tsx  # Workout plan display
│   ├── ProgressTracker.tsx # Weight & insights tracking
│   ├── MealLogger.tsx   # AI meal logging
│   ├── WorkoutLogger.tsx # Workout completion tracking
│   ├── ProfileSection.tsx # User profile management
│   ├── CalorieCalculator.tsx # TDEE & target calculations
│   └── ExerciseFormChecker.tsx # AI form analysis
├── pages/
│   ├── Index.tsx        # Main page with auth flow
│   ├── Auth.tsx         # Sign in/up page
│   └── NotFound.tsx     # 404 page
├── hooks/
│   ├── useAuth.tsx      # Authentication state hook
│   └── use-toast.ts     # Toast notifications
├── integrations/
│   └── supabase/
│       ├── client.ts    # Supabase client (auto-generated)
│       └── types.ts     # Database types (auto-generated)
└── lib/
    └── utils.ts         # Utility functions
```

## Database Schema

### Tables

1. **profiles** - User fitness profiles
   - weight, height, age, gender
   - goal, experience, dietary_preference

2. **fitness_plans** - AI-generated workout/diet plans
   - plan_data (JSON with full plan)
   - target_calories, target_protein, tdee

3. **workout_logs** - Completed workouts
   - exercises (JSON), completed, notes

4. **meal_logs** - Logged meals
   - items (JSON), total_calories, total_protein

5. **weight_logs** - Daily weight entries

6. **weekly_insights** - AI-generated progress analysis

7. **gym_checkins** - Photo check-in attendance tracking
   - photo_url, ai_is_gym, ai_comment

## Storage Buckets

- **checkins** - Stores gym check-in photos (public bucket)

## Edge Functions

1. **generate-fitness-plan** - Creates personalized workout/diet plans using AI
2. **generate-weekly-insights** - Analyzes progress and generates recommendations
3. **parse-meal** - Parses meal descriptions into nutritional data
4. **adjust-plan** - Modifies plans based on user feedback
5. **analyze-exercise-form** - Analyzes exercise form from images

## Exercise Media Guides

Located in `src/data/exerciseMediaGuides.ts`:
- Static mapping of common exercises with form cues and safety tips
- `getExerciseMediaGuide()` function for fuzzy name matching
- Can be extended with video URLs or connected to remote CDN

## Key Flows

### 1. User Onboarding
```
Hero → Sign In → Onboarding Form → Generate Plan → Dashboard
```

### 2. Daily Usage
```
Dashboard → View Plan → Log Workouts → Log Meals → Track Progress
```

### 3. AI Features
- Plan generation uses structured JSON output for diet/workout plans
- Meal parsing estimates calories/protein from text descriptions
- Weekly insights analyze logs and provide recommendations

## Calculations

### TDEE (Total Daily Energy Expenditure)
Using Mifflin-St Jeor equation:
- Male: BMR = 10×weight + 6.25×height - 5×age + 5
- Female: BMR = 10×weight + 6.25×height - 5×age - 161
- TDEE = BMR × Activity Multiplier (1.375-1.725)

### Targets
- **Bulk**: TDEE + 300-500 kcal
- **Cut**: TDEE - 300-500 kcal
- **Protein**: 1.6-2.2g per kg bodyweight

## Security

- Row Level Security (RLS) on all tables
- Users can only access their own data
- Auth tokens handled by Supabase client
- Edge functions validate auth before operations
