import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, format, addDays, subWeeks, subMonths } from "date-fns";

interface SleepTrendData {
  date: string;
  hours: number;
  quality: string;
  qualityScore: number;
  mood?: string;
}

interface WorkoutCorrelation {
  sleepQuality: string;
  avgWorkoutIntensity: number;
  workoutCount: number;
  avgSleepHours: number;
}

interface SleepTrends {
  weeklyData: SleepTrendData[];
  monthlyData: SleepTrendData[];
  avgWeeklySleep: number;
  avgMonthlySleep: number;
  avgWeeklyQuality: number;
  avgMonthlyQuality: number;
  bestSleepDay: string;
  worstSleepDay: string;
  sleepWorkoutCorrelation: WorkoutCorrelation[];
  trendDirection: "improving" | "declining" | "stable";
  insights: string[];
  isLoading: boolean;
  refresh: () => void;
}

const qualityToScore = (quality: string): number => {
  switch (quality) {
    case "excellent": return 4;
    case "good": return 3;
    case "fair": return 2;
    case "poor": return 1;
    default: return 0;
  }
};

const scoreToQuality = (score: number): string => {
  if (score >= 3.5) return "Excellent";
  if (score >= 2.5) return "Good";
  if (score >= 1.5) return "Fair";
  return "Poor";
};

export const useSleepTrends = (userId: string): SleepTrends => {
  const [trends, setTrends] = useState<SleepTrends>({
    weeklyData: [],
    monthlyData: [],
    avgWeeklySleep: 0,
    avgMonthlySleep: 0,
    avgWeeklyQuality: 0,
    avgMonthlyQuality: 0,
    bestSleepDay: "",
    worstSleepDay: "",
    sleepWorkoutCorrelation: [],
    trendDirection: "stable",
    insights: [],
    isLoading: true,
    refresh: () => {},
  });

  const loadTrends = useCallback(async () => {
    if (!userId) return;

    try {
      const now = new Date();
      const weekStart = format(subWeeks(now, 1), "yyyy-MM-dd");
      const monthStart = format(subMonths(now, 1), "yyyy-MM-dd");
      const today = format(now, "yyyy-MM-dd");

      // Fetch sleep and workout data
      const [sleepRes, workoutRes] = await Promise.all([
        supabase
          .from("sleep_logs")
          .select("log_date, sleep_hours, sleep_quality, notes")
          .eq("user_id", userId)
          .gte("log_date", monthStart)
          .lte("log_date", today)
          .order("log_date", { ascending: true }),
        supabase
          .from("workout_logs")
          .select("workout_date, completed, exercises")
          .eq("user_id", userId)
          .gte("workout_date", monthStart)
          .lte("workout_date", today),
      ]);

      const sleepData = sleepRes.data || [];
      const workoutData = workoutRes.data || [];

      // Process monthly data
      const monthlyData: SleepTrendData[] = sleepData.map((s) => ({
        date: s.log_date,
        hours: Number(s.sleep_hours) || 0,
        quality: s.sleep_quality || "",
        qualityScore: qualityToScore(s.sleep_quality || ""),
        mood: s.notes || undefined,
      }));

      // Filter for weekly data (last 7 days)
      const weeklyData = monthlyData.filter((d) => d.date >= weekStart);

      // Calculate averages
      const avgWeeklySleep = weeklyData.length > 0
        ? weeklyData.reduce((sum, d) => sum + d.hours, 0) / weeklyData.length
        : 0;
      const avgMonthlySleep = monthlyData.length > 0
        ? monthlyData.reduce((sum, d) => sum + d.hours, 0) / monthlyData.length
        : 0;

      const weeklyQualityScores = weeklyData.filter((d) => d.qualityScore > 0);
      const avgWeeklyQuality = weeklyQualityScores.length > 0
        ? weeklyQualityScores.reduce((sum, d) => sum + d.qualityScore, 0) / weeklyQualityScores.length
        : 0;

      const monthlyQualityScores = monthlyData.filter((d) => d.qualityScore > 0);
      const avgMonthlyQuality = monthlyQualityScores.length > 0
        ? monthlyQualityScores.reduce((sum, d) => sum + d.qualityScore, 0) / monthlyQualityScores.length
        : 0;

      // Find best/worst sleep days
      const dayAverages: Record<string, { total: number; count: number }> = {};
      monthlyData.forEach((d) => {
        const dayName = format(new Date(d.date), "EEEE");
        if (!dayAverages[dayName]) dayAverages[dayName] = { total: 0, count: 0 };
        dayAverages[dayName].total += d.hours;
        dayAverages[dayName].count += 1;
      });

      let bestSleepDay = "";
      let worstSleepDay = "";
      let bestAvg = 0;
      let worstAvg = 24;

      Object.entries(dayAverages).forEach(([day, data]) => {
        const avg = data.total / data.count;
        if (avg > bestAvg) {
          bestAvg = avg;
          bestSleepDay = day;
        }
        if (avg < worstAvg && data.count > 0) {
          worstAvg = avg;
          worstSleepDay = day;
        }
      });

      // Correlate sleep with workouts
      const correlationMap: Record<string, { hours: number[]; workouts: number }> = {
        excellent: { hours: [], workouts: 0 },
        good: { hours: [], workouts: 0 },
        fair: { hours: [], workouts: 0 },
        poor: { hours: [], workouts: 0 },
      };

      sleepData.forEach((sleep) => {
        if (!sleep.sleep_quality) return;
        const quality = sleep.sleep_quality;
        correlationMap[quality].hours.push(Number(sleep.sleep_hours) || 0);
        
        // Check if there was a workout the next day
        const nextDay = format(addDays(new Date(sleep.log_date), 1), "yyyy-MM-dd");
        const hadWorkout = workoutData.some(
          (w) => w.workout_date === nextDay && w.completed
        );
        if (hadWorkout) correlationMap[quality].workouts += 1;
      });

      const sleepWorkoutCorrelation: WorkoutCorrelation[] = Object.entries(correlationMap)
        .filter(([_, data]) => data.hours.length > 0)
        .map(([quality, data]) => ({
          sleepQuality: quality.charAt(0).toUpperCase() + quality.slice(1),
          avgSleepHours: data.hours.reduce((a, b) => a + b, 0) / data.hours.length,
          workoutCount: data.workouts,
          avgWorkoutIntensity: data.hours.length > 0 ? (data.workouts / data.hours.length) * 100 : 0,
        }));

      // Determine trend direction
      let trendDirection: "improving" | "declining" | "stable" = "stable";
      if (monthlyData.length >= 7) {
        const firstHalf = monthlyData.slice(0, Math.floor(monthlyData.length / 2));
        const secondHalf = monthlyData.slice(Math.floor(monthlyData.length / 2));
        const firstAvg = firstHalf.reduce((sum, d) => sum + d.hours, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, d) => sum + d.hours, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 0.5) trendDirection = "improving";
        else if (secondAvg < firstAvg - 0.5) trendDirection = "declining";
      }

      // Generate insights
      const insights: string[] = [];
      
      if (avgWeeklySleep > 0) {
        if (avgWeeklySleep < 6) {
          insights.push("⚠️ Your average sleep is below 6 hours. This can significantly impact muscle recovery and workout performance.");
        } else if (avgWeeklySleep >= 7.5) {
          insights.push("✅ Great sleep duration! You're in the optimal 7-9 hour range for recovery.");
        }
      }

      if (sleepWorkoutCorrelation.length > 0) {
        const excellentCorr = sleepWorkoutCorrelation.find((c) => c.sleepQuality === "Excellent");
        const poorCorr = sleepWorkoutCorrelation.find((c) => c.sleepQuality === "Poor");
        
        if (excellentCorr && poorCorr) {
          const workoutDiff = excellentCorr.workoutCount - poorCorr.workoutCount;
          if (workoutDiff > 0) {
            insights.push(`💪 You complete ${workoutDiff} more workouts after excellent sleep nights compared to poor sleep nights.`);
          }
        }
      }

      if (bestSleepDay && worstSleepDay && bestSleepDay !== worstSleepDay) {
        insights.push(`📊 You sleep best on ${bestSleepDay}s and least on ${worstSleepDay}s.`);
      }

      if (trendDirection === "improving") {
        insights.push("📈 Your sleep trend is improving! Keep up the good habits.");
      } else if (trendDirection === "declining") {
        insights.push("📉 Your sleep has been declining. Consider reviewing your evening routine.");
      }

      setTrends({
        weeklyData,
        monthlyData,
        avgWeeklySleep,
        avgMonthlySleep,
        avgWeeklyQuality,
        avgMonthlyQuality,
        bestSleepDay,
        worstSleepDay,
        sleepWorkoutCorrelation,
        trendDirection,
        insights,
        isLoading: false,
        refresh: loadTrends,
      });
    } catch (error) {
      console.error("Error loading sleep trends:", error);
      setTrends((prev) => ({ ...prev, isLoading: false }));
    }
  }, [userId]);

  useEffect(() => {
    loadTrends();
  }, [loadTrends]);

  return { ...trends, refresh: loadTrends };
};
