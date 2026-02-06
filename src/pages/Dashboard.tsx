import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingData } from "@/components/OnboardingForm";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useWaterSleepStats } from "@/hooks/useWaterSleepStats";
import { useSleepTrends } from "@/hooks/useSleepTrends";
import { useNavigate } from "react-router-dom";
import { 
  Dumbbell, Utensils, TrendingUp, Camera, ChevronRight,
  Target, Scale, Activity, Droplets, Moon
} from "lucide-react";
import {
  MotivationalBanner,
  QuickStatsGrid,
  StreakCard,
  WeeklyActivityChart,
  AchievementsCard,
} from "@/components/dashboard";
import { WaterSleepCharts } from "@/components/dashboard/WaterSleepCharts";
import { SleepTrendsCard } from "@/components/dashboard/SleepTrendsCard";
import { WaterTracker } from "@/components/WaterTracker";
import { SleepTracker } from "@/components/SleepTracker";
import { VisionBoard } from "@/components/VisionBoard";
import { DreamJournal } from "@/components/DreamJournal";
import { FutureMessage } from "@/components/FutureMessage";
import { TomorrowList } from "@/components/TomorrowList";
import WorkoutCountdown from "@/components/WorkoutCountdown";
import LifeCountdowns from "@/components/LifeCountdowns";
import TodayFocus from "@/components/TodayFocus";

interface DashboardPageProps {
  userData: OnboardingData;
  userId: string;
}

export const DashboardPage = ({ userData, userId }: DashboardPageProps) => {
  const navigate = useNavigate();
  const stats = useDashboardStats(userId);
  const waterSleepStats = useWaterSleepStats(userId, userData.weight);
  const sleepTrends = useSleepTrends(userId);

  if (stats.isLoading || waterSleepStats.isLoading || sleepTrends.isLoading) {
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
      label: "Today's Water",
      value: waterSleepStats.todayWater,
      unit: `/ ${waterSleepStats.waterGoal}ml`,
      icon: "water" as const,
      color: "blue" as const,
    },
    {
      label: "Weekly Workouts",
      value: stats.weeklyWorkoutCount,
      unit: "sessions",
      changeLabel: "This week",
      icon: "target" as const,
      color: "accent" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Today's Focus */}
      <TodayFocus
        userId={userId}
        todayCalories={stats.todayCalories}
        todayProtein={stats.todayProtein}
        calorieGoal={calorieGoal}
        proteinGoal={proteinGoal}
        todayWater={waterSleepStats.todayWater}
        waterGoal={waterSleepStats.waterGoal}
      />

      {/* Countdowns Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <WorkoutCountdown />
        <LifeCountdowns />
      </div>

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

      {/* Water & Sleep Trackers */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WaterTracker
          userId={userId}
          todayTotal={waterSleepStats.todayWater}
          dailyGoal={waterSleepStats.waterGoal}
          onLog={waterSleepStats.refresh}
        />
        <SleepTracker userId={userId} onLog={waterSleepStats.refresh} />
        <DreamJournal userId={userId} />
      </div>

      {/* Sleep Flow - Night Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <FutureMessage userId={userId} />
        <TomorrowList userId={userId} />
      </div>

      {/* Water & Sleep Charts */}
      <WaterSleepCharts
        weeklyWater={waterSleepStats.weeklyWater}
        weeklySleep={waterSleepStats.weeklySleep}
        waterGoal={waterSleepStats.waterGoal}
        sleepGoal={waterSleepStats.sleepGoal}
        aiInsights={waterSleepStats.aiInsights}
      />

      {/* Sleep Trends & Workout Correlation */}
      <SleepTrendsCard
        weeklyData={sleepTrends.weeklyData}
        monthlyData={sleepTrends.monthlyData}
        avgWeeklySleep={sleepTrends.avgWeeklySleep}
        avgMonthlySleep={sleepTrends.avgMonthlySleep}
        avgWeeklyQuality={sleepTrends.avgWeeklyQuality}
        avgMonthlyQuality={sleepTrends.avgMonthlyQuality}
        bestSleepDay={sleepTrends.bestSleepDay}
        worstSleepDay={sleepTrends.worstSleepDay}
        sleepWorkoutCorrelation={sleepTrends.sleepWorkoutCorrelation}
        trendDirection={sleepTrends.trendDirection}
        insights={sleepTrends.insights}
      />

      {/* Vision Board */}
      <VisionBoard userId={userId} />

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
