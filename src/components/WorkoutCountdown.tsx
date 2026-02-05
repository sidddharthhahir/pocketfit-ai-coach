import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Timer, Play, Calendar, CheckCircle2, Clock, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Countdown {
  id: string;
  user_id: string;
  type: string;
  title: string;
  target_time: string;
  status: string;
  created_at: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const WorkoutCountdown = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [workoutDateTime, setWorkoutDateTime] = useState("");

  // Fetch active countdown
  const { data: activeCountdown, isLoading } = useQuery({
    queryKey: ["active-countdown", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("countdowns")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("target_time", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Countdown | null;
    },
    enabled: !!user?.id,
  });

  // Create countdown mutation
  const createCountdown = useMutation({
    mutationFn: async ({ title, targetTime }: { title: string; targetTime: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("countdowns")
        .insert({
          user_id: user.id,
          title,
          target_time: targetTime,
          type: "workout",
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-countdown"] });
      setIsScheduling(false);
      setWorkoutTitle("");
      setWorkoutDateTime("");
      toast({ title: "Workout scheduled!", description: "Your countdown has started." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to schedule workout.", variant: "destructive" });
    },
  });

  // Update countdown mutation
  const updateCountdown = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Countdown> }) => {
      const { data, error } = await supabase
        .from("countdowns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-countdown"] });
      setIsRescheduling(false);
      setWorkoutDateTime("");
    },
  });

  // Calculate time remaining
  useEffect(() => {
    if (!activeCountdown) {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const target = new Date(activeCountdown.target_time).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: difference });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, total: difference });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [activeCountdown]);

  const handleSchedule = () => {
    if (!workoutTitle.trim() || !workoutDateTime) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    createCountdown.mutate({ title: workoutTitle, targetTime: workoutDateTime });
  };

  const handleReschedule = () => {
    if (!workoutDateTime || !activeCountdown) return;
    updateCountdown.mutate({
      id: activeCountdown.id,
      updates: { target_time: workoutDateTime },
    });
    toast({ title: "Workout rescheduled!", description: "Your countdown has been updated." });
  };

  const handleStartNow = () => {
    if (!activeCountdown) return;
    updateCountdown.mutate({
      id: activeCountdown.id,
      updates: { status: "completed" },
    });
    toast({ title: "Workout started!", description: "Great job showing up! 💪" });
  };

  const handleMarkMissed = () => {
    if (!activeCountdown) return;
    updateCountdown.mutate({
      id: activeCountdown.id,
      updates: { status: "missed" },
    });
  };

  const formatTimeUnit = (value: number, unit: string) => (
    <div className="flex flex-col items-center">
      <span className="text-2xl md:text-3xl font-bold text-primary tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs text-muted-foreground uppercase">{unit}</span>
    </div>
  );

  const isUrgent = timeRemaining && timeRemaining.total > 0 && timeRemaining.total < 3600000; // Under 1 hour
  const isMissed = timeRemaining && timeRemaining.total <= 0;

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 flex items-center justify-center">
          <Clock className="h-5 w-5 animate-pulse text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // No active countdown - show schedule CTA
  if (!activeCountdown || isScheduling) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            {isScheduling ? "Schedule Workout" : "Next Workout"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isScheduling ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="workout-title">Workout Name</Label>
                <Input
                  id="workout-title"
                  placeholder="e.g. Upper Body, Leg Day"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workout-datetime">Date & Time</Label>
                <Input
                  id="workout-datetime"
                  type="datetime-local"
                  value={workoutDateTime}
                  onChange={(e) => setWorkoutDateTime(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  className="bg-background/50"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSchedule}
                  disabled={createCountdown.isPending}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {createCountdown.isPending ? "Scheduling..." : "Schedule"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsScheduling(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No workout scheduled yet</p>
              <Button onClick={() => setIsScheduling(true)} variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Your Next Workout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Active countdown with reschedule form
  if (isRescheduling) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Reschedule Workout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Current: {activeCountdown.title}
          </p>
          <div className="space-y-2">
            <Label htmlFor="reschedule-datetime">New Date & Time</Label>
            <Input
              id="reschedule-datetime"
              type="datetime-local"
              value={workoutDateTime}
              onChange={(e) => setWorkoutDateTime(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              className="bg-background/50"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleReschedule}
              disabled={updateCountdown.isPending || !workoutDateTime}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsRescheduling(false);
                setWorkoutDateTime("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Missed workout state
  if (isMissed) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-amber-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Timer className="h-5 w-5 text-amber-500" />
            Workout Time Passed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="font-medium text-lg">{activeCountdown.title}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Was scheduled for {format(new Date(activeCountdown.target_time), "MMM d, h:mm a")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleStartNow} variant="hero" className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Start Now
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsRescheduling(true)}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Reschedule
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            It's okay — showing up late is still showing up.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Active countdown display
  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300 ${isUrgent ? "ring-2 ring-primary/50 animate-pulse" : ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Timer className={`h-5 w-5 ${isUrgent ? "text-primary animate-bounce" : "text-primary"}`} />
          Next Workout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="font-medium text-lg">{activeCountdown.title}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(activeCountdown.target_time), "EEEE, MMM d 'at' h:mm a")}
          </p>
        </div>

        {timeRemaining && (
          <div className="flex justify-center gap-3 py-2">
            {timeRemaining.days > 0 && formatTimeUnit(timeRemaining.days, "days")}
            {formatTimeUnit(timeRemaining.hours, "hrs")}
            {formatTimeUnit(timeRemaining.minutes, "min")}
            {formatTimeUnit(timeRemaining.seconds, "sec")}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleStartNow} variant="hero" className="flex-1">
            <Play className="h-4 w-4 mr-2" />
            Start Now
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsScheduling(true)}
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutCountdown;
