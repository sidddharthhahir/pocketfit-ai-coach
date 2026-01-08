import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, format, addDays } from "date-fns";

interface WaterSleepStats {
  todayWater: number;
  weeklyWater: { day: string; amount: number }[];
  weeklySleep: { day: string; hours: number; quality: string }[];
  waterGoal: number;
  sleepGoal: number;
  aiInsights: {
    water: string;
    sleep: string;
  };
  isLoading: boolean;
  refresh: () => void;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const useWaterSleepStats = (userId: string, userWeight: number): WaterSleepStats => {
  const [stats, setStats] = useState<WaterSleepStats>({
    todayWater: 0,
    weeklyWater: DAY_NAMES.map((day) => ({ day, amount: 0 })),
    weeklySleep: DAY_NAMES.map((day) => ({ day, hours: 0, quality: "" })),
    waterGoal: Math.round(userWeight * 35), // 35ml per kg
    sleepGoal: 8,
    aiInsights: { water: "", sleep: "" },
    isLoading: true,
    refresh: () => {},
  });

  const loadStats = useCallback(async () => {
    if (!userId) return;

    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const today = format(now, "yyyy-MM-dd");

      const [waterRes, sleepRes] = await Promise.all([
        supabase
          .from("water_logs")
          .select("log_date, amount_ml")
          .eq("user_id", userId)
          .gte("log_date", format(weekStart, "yyyy-MM-dd"))
          .lte("log_date", format(addDays(weekStart, 6), "yyyy-MM-dd")),
        supabase
          .from("sleep_logs")
          .select("log_date, sleep_hours, sleep_quality")
          .eq("user_id", userId)
          .gte("log_date", format(weekStart, "yyyy-MM-dd"))
          .lte("log_date", format(addDays(weekStart, 6), "yyyy-MM-dd")),
      ]);

      // Aggregate water by day
      const weeklyWater = DAY_NAMES.map((day, i) => {
        const dateStr = format(addDays(weekStart, i), "yyyy-MM-dd");
        const dayLogs = (waterRes.data || []).filter((w) => w.log_date === dateStr);
        const total = dayLogs.reduce((sum, w) => sum + (w.amount_ml || 0), 0);
        return { day, amount: total };
      });

      // Aggregate sleep by day (take the latest entry per day)
      const weeklySleep = DAY_NAMES.map((day, i) => {
        const dateStr = format(addDays(weekStart, i), "yyyy-MM-dd");
        const dayLogs = (sleepRes.data || []).filter((s) => s.log_date === dateStr);
        if (dayLogs.length === 0) return { day, hours: 0, quality: "" };
        const latest = dayLogs[dayLogs.length - 1];
        return {
          day,
          hours: Number(latest.sleep_hours) || 0,
          quality: latest.sleep_quality || "",
        };
      });

      // Today's water total
      const todayWater = weeklyWater.find(
        (w) => w.day === DAY_NAMES[(now.getDay() + 6) % 7]
      )?.amount || 0;

      // Generate AI insights
      const waterGoal = Math.round(userWeight * 35);
      const avgWater = Math.round(weeklyWater.reduce((sum, d) => sum + d.amount, 0) / 7);
      const avgSleep = weeklySleep.reduce((sum, d) => sum + d.hours, 0) / 7;

      let waterInsight = "";
      let sleepInsight = "";

      if (avgWater > 0) {
        if (avgWater >= waterGoal) {
          waterInsight = "Great job! You're meeting your hydration goals. Keep it up to maintain optimal performance and recovery.";
        } else if (avgWater >= waterGoal * 0.7) {
          waterInsight = `You're close to your goal! Try adding ${Math.round((waterGoal - avgWater) / 100) * 100}ml more per day to reach optimal hydration.`;
        } else {
          waterInsight = "Your hydration could use improvement. Dehydration affects performance and recovery. Try setting reminders to drink water regularly.";
        }
      }

      if (avgSleep > 0) {
        const qualityScores = weeklySleep
          .filter((s) => s.quality)
          .map((s) => {
            switch (s.quality) {
              case "excellent": return 4;
              case "good": return 3;
              case "fair": return 2;
              case "poor": return 1;
              default: return 0;
            }
          });
        const avgQuality = qualityScores.length > 0 
          ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length 
          : 0;

        if (avgSleep >= 7.5 && avgQuality >= 3) {
          sleepInsight = "Excellent sleep pattern! You're getting quality rest which is crucial for muscle recovery and mental performance.";
        } else if (avgSleep >= 6) {
          sleepInsight = avgQuality < 3 
            ? "Sleep duration is okay, but quality could improve. Try maintaining a consistent sleep schedule and avoiding screens before bed."
            : "You're getting decent sleep. Aim for 7-9 hours for optimal recovery and hormone regulation.";
        } else {
          sleepInsight = "Your sleep is below optimal levels. Poor sleep affects muscle recovery, metabolism, and workout performance. Consider prioritizing sleep.";
        }
      }

      setStats({
        todayWater,
        weeklyWater,
        weeklySleep,
        waterGoal,
        sleepGoal: 8,
        aiInsights: { water: waterInsight, sleep: sleepInsight },
        isLoading: false,
        refresh: loadStats,
      });
    } catch (error) {
      console.error("Error loading water/sleep stats:", error);
      setStats((prev) => ({ ...prev, isLoading: false }));
    }
  }, [userId, userWeight]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { ...stats, refresh: loadStats };
};
