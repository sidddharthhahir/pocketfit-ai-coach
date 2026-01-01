import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, format, differenceInDays, parseISO } from "date-fns";

interface DashboardStats {
  // Weekly activity
  weeklyWorkouts: number[];
  weeklyMeals: number[];
  weeklyCheckins: number[];
  
  // Streak data
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  
  // Quick stats
  todayCalories: number;
  todayProtein: number;
  weeklyWorkoutCount: number;
  avgDailyCalories: number;
  
  // Gamification
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  currentLevelXP: number;
  achievements: Achievement[];
  
  // Status
  todayWorkoutDone: boolean;
  isLoading: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
  xp: number;
  category: "workout" | "nutrition" | "consistency" | "milestone";
}

const ACHIEVEMENTS_CONFIG: Omit<Achievement, "unlocked" | "progress">[] = [
  { id: "first_workout", name: "First Steps", description: "Complete your first workout", icon: "🏃", target: 1, xp: 50, category: "workout" },
  { id: "workout_week", name: "Week Warrior", description: "Complete 5 workouts in a week", icon: "💪", target: 5, xp: 100, category: "workout" },
  { id: "workout_master", name: "Workout Master", description: "Complete 50 total workouts", icon: "🏆", target: 50, xp: 500, category: "workout" },
  { id: "meal_tracker", name: "Meal Tracker", description: "Log 10 meals", icon: "🍽️", target: 10, xp: 75, category: "nutrition" },
  { id: "nutrition_pro", name: "Nutrition Pro", description: "Log 100 meals", icon: "👨‍🍳", target: 100, xp: 300, category: "nutrition" },
  { id: "streak_3", name: "Getting Started", description: "Maintain a 3-day streak", icon: "⚡", target: 3, xp: 50, category: "consistency" },
  { id: "streak_7", name: "Week Strong", description: "Maintain a 7-day streak", icon: "🔥", target: 7, xp: 150, category: "consistency" },
  { id: "streak_30", name: "Monthly Champion", description: "Maintain a 30-day streak", icon: "👑", target: 30, xp: 500, category: "consistency" },
  { id: "checkin_5", name: "Gym Regular", description: "Check in to the gym 5 times", icon: "📸", target: 5, xp: 100, category: "milestone" },
  { id: "checkin_20", name: "Gym Veteran", description: "Check in to the gym 20 times", icon: "🎖️", target: 20, xp: 250, category: "milestone" },
];

const calculateLevel = (xp: number): { level: number; currentLevelXP: number; xpToNextLevel: number } => {
  // XP needed per level: 100, 200, 300, 400... (increases by 100 each level)
  let level = 1;
  let totalXPForNextLevel = 100;
  let xpRemaining = xp;
  
  while (xpRemaining >= totalXPForNextLevel) {
    xpRemaining -= totalXPForNextLevel;
    level++;
    totalXPForNextLevel = level * 100;
  }
  
  return {
    level,
    currentLevelXP: xpRemaining,
    xpToNextLevel: totalXPForNextLevel,
  };
};

export const useDashboardStats = (userId: string): DashboardStats => {
  const [stats, setStats] = useState<DashboardStats>({
    weeklyWorkouts: [0, 0, 0, 0, 0, 0, 0],
    weeklyMeals: [0, 0, 0, 0, 0, 0, 0],
    weeklyCheckins: [0, 0, 0, 0, 0, 0, 0],
    currentStreak: 0,
    longestStreak: 0,
    totalDaysActive: 0,
    todayCalories: 0,
    todayProtein: 0,
    weeklyWorkoutCount: 0,
    avgDailyCalories: 0,
    totalXP: 0,
    level: 1,
    xpToNextLevel: 100,
    currentLevelXP: 0,
    achievements: [],
    todayWorkoutDone: false,
    isLoading: true,
  });

  useEffect(() => {
    if (!userId) return;
    loadAllStats();
  }, [userId]);

  const loadAllStats = async () => {
    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const today = format(now, "yyyy-MM-dd");

      // Parallel fetch all data
      const [workoutsRes, mealsRes, checkinsRes] = await Promise.all([
        supabase
          .from("workout_logs")
          .select("workout_date, completed")
          .eq("user_id", userId)
          .gte("workout_date", format(weekStart, "yyyy-MM-dd"))
          .lte("workout_date", format(weekEnd, "yyyy-MM-dd")),
        supabase
          .from("meal_logs")
          .select("meal_date, total_calories, total_protein")
          .eq("user_id", userId)
          .gte("meal_date", format(weekStart, "yyyy-MM-dd"))
          .lte("meal_date", format(weekEnd, "yyyy-MM-dd")),
        supabase
          .from("gym_checkins")
          .select("date")
          .eq("user_id", userId)
          .gte("date", format(weekStart, "yyyy-MM-dd"))
          .lte("date", format(weekEnd, "yyyy-MM-dd")),
      ]);

      // Calculate weekly arrays
      const weeklyWorkouts = [0, 0, 0, 0, 0, 0, 0];
      const weeklyMeals = [0, 0, 0, 0, 0, 0, 0];
      const weeklyCheckins = [0, 0, 0, 0, 0, 0, 0];

      (workoutsRes.data || []).forEach((w) => {
        const dayIndex = differenceInDays(parseISO(w.workout_date), weekStart);
        if (dayIndex >= 0 && dayIndex < 7) weeklyWorkouts[dayIndex]++;
      });

      (mealsRes.data || []).forEach((m) => {
        const dayIndex = differenceInDays(parseISO(m.meal_date), weekStart);
        if (dayIndex >= 0 && dayIndex < 7) weeklyMeals[dayIndex]++;
      });

      (checkinsRes.data || []).forEach((c) => {
        const dayIndex = differenceInDays(parseISO(c.date), weekStart);
        if (dayIndex >= 0 && dayIndex < 7) weeklyCheckins[dayIndex]++;
      });

      // Calculate today's stats
      const todayMeals = (mealsRes.data || []).filter(m => m.meal_date === today);
      const todayCalories = todayMeals.reduce((sum, m) => sum + (m.total_calories || 0), 0);
      const todayProtein = todayMeals.reduce((sum, m) => sum + (m.total_protein || 0), 0);

      // Weekly averages
      const weekMeals = mealsRes.data || [];
      const avgDailyCalories = weekMeals.length > 0 
        ? Math.round(weekMeals.reduce((sum, m) => sum + (m.total_calories || 0), 0) / 7)
        : 0;

      // Today's workout status
      const todayWorkoutDone = (workoutsRes.data || []).some(
        w => w.workout_date === today && w.completed
      );

      // Load totals for achievements
      const [totalWorkouts, totalMeals, totalCheckins] = await Promise.all([
        supabase.from("workout_logs").select("id", { count: "exact" }).eq("user_id", userId),
        supabase.from("meal_logs").select("id", { count: "exact" }).eq("user_id", userId),
        supabase.from("gym_checkins").select("id", { count: "exact" }).eq("user_id", userId),
      ]);

      const workoutCount = totalWorkouts.count || 0;
      const mealCount = totalMeals.count || 0;
      const checkinCount = totalCheckins.count || 0;
      const weeklyWorkoutCount = weeklyWorkouts.reduce((a, b) => a + b, 0);

      // Calculate streak (simplified - based on consecutive days with any activity)
      const { data: allCheckins } = await supabase
        .from("gym_checkins")
        .select("date")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const uniqueDates = [...new Set((allCheckins || []).map(c => c.date))].sort().reverse();
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const date = parseISO(uniqueDates[i]);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (format(date, "yyyy-MM-dd") === format(expectedDate, "yyyy-MM-dd")) {
          tempStreak++;
          if (i === 0 || currentStreak > 0) currentStreak = tempStreak;
        } else {
          if (tempStreak > longestStreak) longestStreak = tempStreak;
          tempStreak = 0;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;

      // Calculate achievements
      const achievements: Achievement[] = ACHIEVEMENTS_CONFIG.map(config => {
        let progress = 0;
        
        switch (config.id) {
          case "first_workout":
          case "workout_master":
            progress = workoutCount;
            break;
          case "workout_week":
            progress = weeklyWorkoutCount;
            break;
          case "meal_tracker":
          case "nutrition_pro":
            progress = mealCount;
            break;
          case "streak_3":
          case "streak_7":
          case "streak_30":
            progress = currentStreak;
            break;
          case "checkin_5":
          case "checkin_20":
            progress = checkinCount;
            break;
        }

        return {
          ...config,
          progress: Math.min(progress, config.target),
          unlocked: progress >= config.target,
        };
      });

      // Calculate XP from unlocked achievements
      const totalXP = achievements
        .filter(a => a.unlocked)
        .reduce((sum, a) => sum + a.xp, 0);

      const { level, currentLevelXP, xpToNextLevel } = calculateLevel(totalXP);

      setStats({
        weeklyWorkouts,
        weeklyMeals,
        weeklyCheckins,
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        totalDaysActive: uniqueDates.length,
        todayCalories,
        todayProtein,
        weeklyWorkoutCount,
        avgDailyCalories,
        totalXP,
        level,
        xpToNextLevel,
        currentLevelXP,
        achievements,
        todayWorkoutDone,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  return stats;
};
