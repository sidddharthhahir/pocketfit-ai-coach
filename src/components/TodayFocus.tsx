import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Droplets, Beef, Clock, Star, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, differenceInSeconds } from "date-fns";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface TodayFocusProps {
  userId: string;
  todayCalories: number;
  todayProtein: number;
  calorieGoal: number;
  proteinGoal: number;
  todayWater: number;
  waterGoal: number;
}

const TodayFocus = ({
  userId,
  todayCalories,
  todayProtein,
  calorieGoal,
  proteinGoal,
  todayWater,
  waterGoal,
}: TodayFocusProps) => {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: focusCountdown } = useQuery({
    queryKey: ["focus-countdown", userId],
    queryFn: async () => {
      const { data: pinned } = await supabase
        .from("countdowns")
        .select("*")
        .eq("user_id", userId)
        .eq("is_pinned", true)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      if (pinned) return pinned;
      const { data: nearest } = await supabase
        .from("countdowns")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .gte("target_time", new Date().toISOString())
        .order("target_time", { ascending: true })
        .limit(1)
        .maybeSingle();
      return nearest;
    },
    enabled: !!userId,
  });

  const { data: workoutCountdown } = useQuery({
    queryKey: ["today-workout-countdown", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("countdowns")
        .select("*")
        .eq("user_id", userId)
        .eq("type", "workout")
        .eq("status", "active")
        .order("target_time", { ascending: true })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  const formatCountdownTime = (targetTime: string) => {
    const target = new Date(targetTime);
    const diff = differenceInSeconds(target, now);
    if (diff <= 0) return "Now!";
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  };

  const calPercent = Math.min(100, Math.round((todayCalories / calorieGoal) * 100));
  const proteinPercent = Math.min(100, Math.round((todayProtein / proteinGoal) * 100));
  const waterPercent = Math.min(100, Math.round((todayWater / waterGoal) * 100));

  return (
    <Card className="overflow-hidden relative">
      {/* Subtle animated gradient bg */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-50 pointer-events-none" />
      
      <CardContent className="p-5 space-y-4 relative z-10">
        {/* Pinned Countdown */}
        {focusCountdown && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl glass-card border border-primary/15 group hover:border-primary/30 transition-all duration-300">
            {focusCountdown.is_pinned && (
              <Star className="h-4 w-4 text-primary fill-primary flex-shrink-0 animate-glow-pulse" />
            )}
            <span className="text-base">{focusCountdown.icon || "⏳"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{focusCountdown.title}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(focusCountdown.target_time), "MMM d, h:mm a")}
              </p>
            </div>
            <p className="text-sm font-bold tabular-nums text-primary stat-glow">
              {formatCountdownTime(focusCountdown.target_time)}
            </p>
          </div>
        )}

        {/* Workout Status */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/50">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Dumbbell className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm flex-1">
            {workoutCountdown
              ? `${workoutCountdown.title} — in ${formatCountdownTime(workoutCountdown.target_time)}`
              : "Rest / Light activity recommended"}
          </p>
          {!workoutCountdown && (
            <Button size="sm" variant="ghost" onClick={() => navigate("/workouts")} className="text-xs h-7 hover:bg-primary/10 hover:text-primary">
              Plan
            </Button>
          )}
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Clock, label: "Calories", value: todayCalories, goal: calorieGoal, percent: calPercent, unit: "", color: "text-primary" },
            { icon: Beef, label: "Protein", value: `${todayProtein}g`, goal: `${proteinGoal}g`, percent: proteinPercent, unit: "", color: "text-accent" },
            { icon: Droplets, label: "Water", value: todayWater > 1000 ? `${(todayWater / 1000).toFixed(1)}L` : `${todayWater}ml`, goal: waterGoal > 1000 ? `${(waterGoal / 1000).toFixed(1)}L` : `${waterGoal}ml`, percent: waterPercent, unit: "", color: "text-chart-4" },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <item.icon className={`h-3 w-3 ${item.color}`} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <div className="relative">
                <Progress value={item.percent} className="h-2 rounded-full" />
                {item.percent >= 100 && (
                  <Sparkles className="absolute -right-1 -top-1 w-3 h-3 text-accent animate-glow-pulse" />
                )}
              </div>
              <p className="text-xs font-medium">{item.value} <span className="text-muted-foreground">/ {item.goal}</span></p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayFocus;