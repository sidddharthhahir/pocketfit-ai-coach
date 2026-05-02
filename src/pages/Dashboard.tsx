import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingData } from "@/components/OnboardingForm";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useWaterSleepStats } from "@/hooks/useWaterSleepStats";
import { useSleepTrends } from "@/hooks/useSleepTrends";
import { useCollapsibleSections } from "@/hooks/useCollapsibleSections";
import {
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
import { FutureMessage } from "@/components/FutureMessage";
import { TomorrowList } from "@/components/TomorrowList";
import LifeCountdowns from "@/components/LifeCountdowns";
import TodayFocus from "@/components/TodayFocus";
import { GitaDashboardWidget } from "@/components/gita/GitaDashboardWidget";
import { RestDayToggle } from "@/components/RestDayToggle";
import { Compass, BarChart3, Moon, Timer } from "lucide-react";

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
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const bmr = userData.gender === "male"
    ? 88.362 + (13.397 * userData.weight) + (4.799 * userData.height) - (5.677 * userData.age)
    : 447.593 + (9.247 * userData.weight) + (3.098 * userData.height) - (4.330 * userData.age);
  
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55,
    very_active: 1.725, extra_active: 1.9,
  };
  const activityMultiplier = activityMultipliers[userData.activityLevel] || 1.55;
  const tdee = Math.round(bmr * activityMultiplier);
  const calorieGoal = userData.goal === "cut" ? tdee - 500 : userData.goal === "bulk" ? tdee + 300 : tdee;
  const proteinGoal = Math.round(userData.weight * 1.8);

  const quickStats = [
    {
      label: "Calories",
      value: stats.todayCalories,
      unit: `/ ${calorieGoal}`,
      change: stats.todayCalories > 0 ? Math.round((stats.todayCalories / calorieGoal) * 100 - 100) : undefined,
      icon: "flame" as const,
      color: "primary" as const,
    },
    {
      label: "Protein",
      value: stats.todayProtein,
      unit: `/ ${proteinGoal}g`,
      icon: "protein" as const,
      color: "accent" as const,
    },
    {
      label: "Water",
      value: waterSleepStats.todayWater,
      unit: `/ ${waterSleepStats.waterGoal}ml`,
      icon: "water" as const,
      color: "blue" as const,
    },
    {
      label: "Workouts",
      value: stats.weeklyWorkoutCount,
      unit: "this week",
      icon: "target" as const,
      color: "secondary" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Daily Essentials */}
      <CollapsibleSection
        title="Daily Essentials"
        icon={<Compass className="w-4 h-4 text-primary" />}
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
        <div className="flex justify-end">
          <RestDayToggle userId={userId} />
        </div>
        <QuickStatsGrid stats={quickStats} />
        <div className="grid md:grid-cols-2 gap-4">
          <WaterTracker
            userId={userId}
            todayTotal={waterSleepStats.todayWater}
            dailyGoal={waterSleepStats.waterGoal}
            onLog={waterSleepStats.refresh}
          />
          <SleepTracker userId={userId} onLog={waterSleepStats.refresh} />
        </div>
        <GitaDashboardWidget userId={userId} />
      </CollapsibleSection>

      {/* Countdowns */}
      <CollapsibleSection
        title="Countdowns"
        icon={<Timer className="w-4 h-4 text-chart-3" />}
        isOpen={sections.countdowns}
        onToggle={() => toggle("countdowns")}
      >
        <LifeCountdowns />
      </CollapsibleSection>

      {/* Stats & Progress */}
      <CollapsibleSection
        title="Stats & Progress"
        icon={<BarChart3 className="w-4 h-4 text-accent" />}
        isOpen={sections.stats}
        onToggle={() => toggle("stats")}
      >
        <div className="grid lg:grid-cols-2 gap-4">
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

      {/* Evening & Reflection */}
      <CollapsibleSection
        title="Evening & Reflection"
        icon={<Moon className="w-4 h-4 text-chart-5" />}
        isOpen={sections.night}
        onToggle={() => toggle("night")}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <FutureMessage userId={userId} />
          <TomorrowList userId={userId} />
        </div>
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
