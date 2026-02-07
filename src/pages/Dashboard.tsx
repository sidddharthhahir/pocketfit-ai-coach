import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingData } from "@/components/OnboardingForm";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useWaterSleepStats } from "@/hooks/useWaterSleepStats";
import { useSleepTrends } from "@/hooks/useSleepTrends";
import { useCollapsibleSections } from "@/hooks/useCollapsibleSections";
import {
  MotivationalBanner,
  QuickStatsGrid,
  StreakCard,
  WeeklyActivityChart,
  AchievementsCard,
} from "@/components/dashboard";
import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import { WaterSleepCharts } from "@/components/dashboard/WaterSleepCharts";
import { SleepTrendsCard } from "@/components/dashboard/SleepTrendsCard";
import { WaterTracker } from "@/components/WaterTracker";
import { SleepTracker } from "@/components/SleepTracker";
import { VisionBoard } from "@/components/VisionBoard";
import { DreamJournal } from "@/components/DreamJournal";
import { FutureMessage } from "@/components/FutureMessage";
import { TomorrowList } from "@/components/TomorrowList";
import LifeCountdowns from "@/components/LifeCountdowns";
import TodayFocus from "@/components/TodayFocus";

interface DashboardPageProps {
  userData: OnboardingData;
  userId: string;
}

export const DashboardPage = ({ userData, userId }: DashboardPageProps) => {
  const stats = useDashboardStats(userId);
  const waterSleepStats = useWaterSleepStats(userId, userData.weight);
  const sleepTrends = useSleepTrends(userId);
  const { sections, toggle } = useCollapsibleSections();

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

  const bmr = userData.gender === "male"
    ? 88.362 + (13.397 * userData.weight) + (4.799 * userData.height) - (5.677 * userData.age)
    : 447.593 + (9.247 * userData.weight) + (3.098 * userData.height) - (4.330 * userData.age);
  
  const activityMultiplier = userData.experience === "beginner" ? 1.375 : 
    userData.experience === "intermediate" ? 1.55 : 1.725;
  const tdee = Math.round(bmr * activityMultiplier);
  
  const calorieGoal = userData.goal === "cut" ? tdee - 500 :
    userData.goal === "bulk" ? tdee + 300 : tdee;
  const proteinGoal = Math.round(userData.weight * 1.8);

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
      {/* 🧭 Daily Essentials — always expanded by default */}
      <CollapsibleSection
        title="Daily Essentials"
        icon="🧭"
        isOpen={sections.daily}
        onToggle={() => toggle("daily")}
      >
        <TodayFocus
          userId={userId}
          todayCalories={stats.todayCalories}
          todayProtein={stats.todayProtein}
          calorieGoal={calorieGoal}
          proteinGoal={proteinGoal}
          todayWater={waterSleepStats.todayWater}
          waterGoal={waterSleepStats.waterGoal}
        />
        <MotivationalBanner
          todayWorkoutDone={stats.todayWorkoutDone}
          currentStreak={stats.currentStreak}
          suggestion="Let's make today count!"
          actionLabel="Start Workout"
          actionRoute="/workouts"
        />
        <QuickStatsGrid stats={quickStats} />
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
      </CollapsibleSection>

      {/* ⏳ Countdowns */}
      <CollapsibleSection
        title="Countdowns"
        icon="⏳"
        isOpen={sections.countdowns}
        onToggle={() => toggle("countdowns")}
      >
        <LifeCountdowns />
      </CollapsibleSection>

      {/* 📊 Stats & Progress */}
      <CollapsibleSection
        title="Stats & Progress"
        icon="📊"
        isOpen={sections.stats}
        onToggle={() => toggle("stats")}
      >
        <div className="grid lg:grid-cols-2 gap-6">
          <WeeklyActivityChart
            workouts={stats.weeklyWorkouts}
            meals={stats.weeklyMeals}
            checkins={stats.weeklyCheckins}
          />
          <StreakCard
            currentStreak={stats.currentStreak}
            longestStreak={stats.longestStreak}
            totalDaysActive={stats.totalDaysActive}
          />
        </div>
        <WaterSleepCharts
          weeklyWater={waterSleepStats.weeklyWater}
          weeklySleep={waterSleepStats.weeklySleep}
          waterGoal={waterSleepStats.waterGoal}
          sleepGoal={waterSleepStats.sleepGoal}
          aiInsights={waterSleepStats.aiInsights}
        />
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
      </CollapsibleSection>

      {/* 🌙 Night & Reflection */}
      <CollapsibleSection
        title="Night & Reflection"
        icon="🌙"
        isOpen={sections.night}
        onToggle={() => toggle("night")}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <FutureMessage userId={userId} />
          <TomorrowList userId={userId} />
        </div>
      </CollapsibleSection>

      {/* 🏆 Motivation */}
      <CollapsibleSection
        title="Motivation"
        icon="🏆"
        isOpen={sections.motivation}
        onToggle={() => toggle("motivation")}
      >
        <VisionBoard userId={userId} />
        <AchievementsCard
          achievements={stats.achievements}
          totalXP={stats.totalXP}
          level={stats.level}
          xpToNextLevel={stats.xpToNextLevel}
          currentLevelXP={stats.currentLevelXP}
        />
      </CollapsibleSection>
    </div>
  );
};

export default DashboardPage;
