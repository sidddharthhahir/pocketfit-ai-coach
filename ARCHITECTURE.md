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
│   ├── layout/          # Navigation & layout components
│   │   ├── MainLayout.tsx    # App shell with navigation
│   │   ├── DesktopNav.tsx    # Desktop top navigation bar
│   │   ├── MobileNav.tsx     # Mobile bottom navigation
│   │   └── OnboardingHint.tsx # First-time user guidance
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
│   ├── GymCheckin.tsx   # Photo check-in component
│   └── ExerciseFormChecker.tsx # AI form analysis
├── pages/
│   ├── Index.tsx        # Landing page with auth flow
│   ├── Auth.tsx         # Sign in/up page
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Workouts.tsx     # Workout plans & logging
│   ├── Nutrition.tsx    # Meal logging & diet plans
│   ├── Progress.tsx     # Weight tracking & insights
│   ├── Photos.tsx       # Photo timeline & comparison
│   ├── Accountability.tsx # Buddy mode & invites
│   ├── Commitments.tsx  # Goal commitments tracking
│   ├── Profile.tsx      # User profile settings
│   └── NotFound.tsx     # 404 page
├── routes/
│   └── AppRoutes.tsx    # Protected route definitions
├── hooks/
│   ├── useAuth.tsx      # Authentication state hook
│   └── use-toast.ts     # Toast notifications
├── integrations/
│   └── supabase/
│       ├── client.ts    # Supabase client (auto-generated)
│       └── types.ts     # Database types (auto-generated)
├── data/
│   └── exerciseMediaGuides.ts # Exercise form guides
└── lib/
    ├── utils.ts         # Utility functions
    └── validationSchemas.ts # Input validation schemas
```

## Database Schema

### Core Tables

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

### Phase 2 Tables (Social & Habits)

8. **buddies** - Accountability buddy relationships
   - user_id: Owner of this relationship record
   - buddy_user_id: The connected buddy
   - created_at: When connection was made
   - *Note*: Two rows per connection (A→B and B→A) for bidirectional visibility

9. **buddy_invites** - Invite codes for buddy connections
   - inviter_id: User who created the invite
   - invite_code: 8-character alphanumeric code (e.g., "ABC12345")
   - status: 'pending' | 'accepted' | 'declined' | 'expired'
   - invitee_id: User who accepted (set on acceptance)
   - expires_at: 7 days from creation

10. **commitments** - Goal commitment contracts
    - user_id: Owner
    - type: 'workouts_per_week' | 'checkins_per_week' | 'meals_logged_per_week'
    - target_value: Number target (e.g., 3 workouts)
    - duration_weeks: How long the commitment lasts
    - start_date, end_date: Commitment period
    - is_active: Whether still active

### Database Functions

- **generate_invite_code()**: Generates unique 8-char alphanumeric invite codes
- **get_buddy_weekly_stats(target_user_id, week_start)**: Returns workout count, checkin count, and streak for a user

## Storage Buckets

- **checkins** - Stores gym check-in photos (private bucket, signed URLs only)

## Navigation

### Desktop (top navigation bar)
All pages visible: Dashboard, Workouts, Nutrition, Progress, Photos, Buddy, Goals, Profile

### Mobile (bottom navigation + More menu)
Main tabs: Home, Workouts, Nutrition, Progress
More menu: Photos, Buddy, Goals, Profile

## Security

### Input Validation
- All validation schemas in `src/lib/validationSchemas.ts`
- Zod validation with realistic bounds (age: 13-120, weight: 20-500kg, height: 50-300cm)
- Server-side validation in edge functions mirrors client-side
- Meal descriptions sanitized before AI prompt interpolation

### Storage Security
- The `checkins` bucket is **private** - photos served via signed URLs with 1-hour expiration
- RLS policies ensure users can only access their own photos

### RLS Policies
All tables have Row Level Security enabled:
- Users can only access their own data via `auth.uid() = user_id` checks
- Buddy tables allow visibility where user is either owner or connected buddy

## Edge Functions

1. **generate-fitness-plan** - Creates personalized workout/diet plans using AI
2. **generate-weekly-insights** - Analyzes progress and generates recommendations
3. **parse-meal** - Parses meal descriptions into nutritional data
4. **adjust-plan** - Modifies plans based on user feedback
5. **analyze-exercise-form** - Analyzes exercise form from images

## Feature: Accountability Buddy Mode

### Location
- **Page**: `src/pages/Accountability.tsx`
- **Navigation**: "Buddy" tab in nav (Users icon)

### Invite Flow
1. User A clicks "Generate Invite Code" → creates row in `buddy_invites`
2. User A shares 8-character code with friend
3. User B enters code in "Join a Friend" section
4. On accept:
   - Two rows created in `buddies` (A→B and B→A)
   - Invite status updated to 'accepted'
5. Both users now see each other's weekly stats

### Privacy
Only shared between buddies:
- Workout count this week
- Check-in count this week
- Current streak (consecutive days with check-ins)

NOT shared:
- Weight numbers
- Meal details/calories
- Personal notes

### Remove Buddy
- Delete button on buddy card removes the relationship
- Only removes from current user's view (other direction remains)

## Feature: Commitment Contracts

### Location
- **Page**: `src/pages/Commitments.tsx`
- **Navigation**: "Goals" tab in nav (Target icon)

### Flow
1. User creates commitment (type, target, duration)
2. Each week, progress calculated from workout_logs/gym_checkins/meal_logs
3. Visual progress bars show completion status
4. Nudges displayed if behind target
5. Summary shown when commitment ends

## Feature: Photo Timeline & Comparison

### Location
- **Page**: `src/pages/Photos.tsx`
- **Navigation**: "Photos" tab in nav (Camera icon)

### Features
- Timeline view of check-in photos grouped by month/week
- Side-by-side comparison mode (select two photos)
- Reuses existing `gym_checkins` data
- Private photos via signed URLs

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
