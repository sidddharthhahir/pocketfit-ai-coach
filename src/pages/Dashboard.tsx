import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingData } from "@/components/OnboardingForm";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useNavigate } from "react-router-dom";
import { 
  Dumbbell, Utensils, TrendingUp, Camera, ChevronRight,
  Target, Scale, Activity
} from "lucide-react";
import {
  MotivationalBanner,
  QuickStatsGrid,
  StreakCard,
  WeeklyActivityChart,
  AchievementsCard,
} from "@/components/dashboard";

interface DashboardPageProps {
  userData: OnboardingData;
  userId: string;
}

export const DashboardPage = ({ userData, userId }: DashboardPageProps) => {
  const navigate = useNavigate();
  const stats = useDashboardStats(userId);

  if (stats.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  // Calculate calorie goal based on userData
  const bmr = userData.gender === "male"
    ? 88.362 + (13.397 * userData.weight) + (4.799 * userData.height) - (5.677 * userData.age)
    : 447.593 + (9.247 * userData.weight) + (3.098 * userData.height) - (4.330 * userData.age);
  
  const activityMultiplier = userData.experience === "beginner" ? 1.375 : 
    userData.experience === "intermediate" ? 1.55 : 1.725;
  const tdee = Math.round(bmr * activityMultiplier);
  
  const calorieGoal = userData.goal === "cut" ? tdee - 500 :
    userData.goal === "bulk" ? tdee + 300 : tdee;

  const proteinGoal = Math.round(userData.weight * 1.8); // 1.8g per kg

  const quickStats = [
    {
      label: "Today's Calories",
      value: stats.todayCalories,
      unit: `/ ${calorieGoal}`,
      change: stats.todayCalories > 0 ? Math.round((stats.todayCalories / calorieGoal) * 100 - 100) : undefined,
      icon: "flame" as const,
      color: "primary" as const,
    },
    {
      label: "Today's Protein",
      value: stats.todayProtein,
      unit: `/ ${proteinGoal}g`,
      icon: "protein" as const,
      color: "secondary" as const,
    },
    {
      label: "Weekly Workouts",
      value: stats.weeklyWorkoutCount,
      unit: "sessions",
      changeLabel: "This week",
      icon: "target" as const,
      color: "accent" as const,
    },
    {
      label: "Avg Daily Cals",
      value: stats.avgDailyCalories,
      unit: "kcal",
      changeLabel: "7-day average",
      icon: "flame" as const,
      color: "blue" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Motivational Banner */}
      <MotivationalBanner
        todayWorkoutDone={stats.todayWorkoutDone}
        currentStreak={stats.currentStreak}
        suggestion="Let's make today count!"
        actionLabel="Start Workout"
        actionRoute="/workouts"
      />

      {/* Quick Stats */}
      <QuickStatsGrid stats={quickStats} />

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <WeeklyActivityChart
          workouts={stats.weeklyWorkouts}
          meals={stats.weeklyMeals}
          checkins={stats.weeklyCheckins}
        />

        {/* Streak Card */}
        <StreakCard
          currentStreak={stats.currentStreak}
          longestStreak={stats.longestStreak}
          totalDaysActive={stats.totalDaysActive}
        />
      </div>

      {/* Achievements */}
      <AchievementsCard
        achievements={stats.achievements}
        totalXP={stats.totalXP}
        level={stats.level}
        xpToNextLevel={stats.xpToNextLevel}
        currentLevelXP={stats.currentLevelXP}
      />

      {/* Quick Actions & Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Your Profile
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border/50">
              <dt className="text-muted-foreground flex items-center gap-2">
                <Scale className="w-4 h-4" /> Weight
              </dt>
              <dd className="font-semibold text-foreground">{userData.weight} kg</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <dt className="text-muted-foreground">Height</dt>
              <dd className="font-semibold text-foreground">{userData.height} cm</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <dt className="text-muted-foreground">Age</dt>
              <dd className="font-semibold text-foreground">{userData.age} years</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <dt className="text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" /> Goal
              </dt>
              <dd className="font-semibold capitalize text-foreground">{userData.goal}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-muted-foreground">Experience</dt>
              <dd className="font-semibold capitalize text-foreground">{userData.experience}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-between group hover:border-primary/50"
              onClick={() => navigate("/workouts")}
            >
              <span className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-primary" />
                Log Workout
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between group hover:border-secondary/50"
              onClick={() => navigate("/nutrition")}
            >
              <span className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-secondary" />
                Track Meal
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between group hover:border-accent/50"
              onClick={() => navigate("/progress")}
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                View Progress
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between group hover:border-primary/50"
              onClick={() => navigate("/photos")}
            >
              <span className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                Gym Check-in
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
