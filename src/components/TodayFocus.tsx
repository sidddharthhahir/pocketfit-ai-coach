import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Dumbbell, Droplets, Beef, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, differenceInSeconds } from "date-fns";
import { useState, useEffect } from "react";

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

  // Fetch pinned countdown first, then nearest upcoming
  const { data: focusCountdown } = useQuery({
    queryKey: ["focus-countdown", userId],
    queryFn: async () => {
      // Try pinned first
      const { data: pinned } = await supabase
        .from("countdowns")
        .select("*")
        .eq("user_id", userId)
        .eq("is_pinned", true)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (pinned) return pinned;

      // Fallback to nearest upcoming
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

  // Fetch today's workout countdown
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
      return `${days}d ${hours % 24}h ${minutes}m`;
    }
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  };

  const waterRemaining = Math.max(0, waterGoal - todayWater);
  const proteinRemaining = Math.max(0, proteinGoal - todayProtein);
  const calorieRemaining = Math.max(0, calorieGoal - todayCalories);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          Today's Focus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Pinned / Next Countdown */}
        {focusCountdown && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            {focusCountdown.is_pinned && (
              <Star className="h-4 w-4 text-primary fill-primary flex-shrink-0" />
            )}
            <span className="text-lg">{focusCountdown.icon || "⏳"}</span>
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
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <Dumbbell className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm">
              {workoutCountdown
                ? `${workoutCountdown.title} — in ${formatCountdownTime(workoutCountdown.target_time)}`
                : "Rest / Light activity recommended"}
            </p>
          </div>
          {!workoutCountdown && (
            <Button size="sm" variant="ghost" onClick={() => navigate("/workouts")} className="text-xs">
              Plan
            </Button>
          )}
        </div>

        {/* Remaining Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <Droplets className="h-4 w-4 text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Water left</p>
            <p className="text-sm font-semibold">{waterRemaining > 1000 ? `${(waterRemaining / 1000).toFixed(1)}L` : `${waterRemaining}ml`}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <Beef className="h-4 w-4 text-orange-400 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Protein left</p>
            <p className="text-sm font-semibold">{proteinRemaining}g</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <Clock className="h-4 w-4 text-accent mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Calories left</p>
            <p className="text-sm font-semibold">{calorieRemaining}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayFocus;
