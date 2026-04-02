import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Droplets, Beef, Clock, Star } from "lucide-react";
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
    <Card className="overflow-hidden">
      <CardContent className="p-5 space-y-4">
        {/* Pinned Countdown */}
        {focusCountdown && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
            {focusCountdown.is_pinned && (
              <Star className="h-3.5 w-3.5 text-primary fill-primary flex-shrink-0" />
            )}
            <span className="text-base">{focusCountdown.icon || "⏳"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{focusCountdown.title}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(focusCountdown.target_time), "MMM d, h:mm a")}
              </p>
            </div>
            <p className="text-sm font-bold tabular-nums text-primary">
              {formatCountdownTime(focusCountdown.target_time)}
            </p>
          </div>
        )}

        {/* Workout Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <Dumbbell className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="text-sm flex-1">
            {workoutCountdown
              ? `${workoutCountdown.title} — in ${formatCountdownTime(workoutCountdown.target_time)}`
              : "Rest / Light activity recommended"}
          </p>
          {!workoutCountdown && (
            <Button size="sm" variant="ghost" onClick={() => navigate("/workouts")} className="text-xs h-7">
              Plan
            </Button>
          )}
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-primary" />
              <span className="text-xs text-muted-foreground">Calories</span>
            </div>
            <Progress value={calPercent} className="h-1.5" />
            <p className="text-xs font-medium">{todayCalories} <span className="text-muted-foreground">/ {calorieGoal}</span></p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Beef className="h-3 w-3 text-accent" />
              <span className="text-xs text-muted-foreground">Protein</span>
            </div>
            <Progress value={proteinPercent} className="h-1.5" />
            <p className="text-xs font-medium">{todayProtein}g <span className="text-muted-foreground">/ {proteinGoal}g</span></p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Droplets className="h-3 w-3 text-chart-4" />
              <span className="text-xs text-muted-foreground">Water</span>
            </div>
            <Progress value={waterPercent} className="h-1.5" />
            <p className="text-xs font-medium">{todayWater > 1000 ? `${(todayWater / 1000).toFixed(1)}L` : `${todayWater}ml`} <span className="text-muted-foreground">/ {waterGoal > 1000 ? `${(waterGoal / 1000).toFixed(1)}L` : `${waterGoal}ml`}</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayFocus;
