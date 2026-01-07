import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "./OnboardingForm";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, Loader2, Info, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { ExerciseTutorDialog } from "./ExerciseTutorDialog";
import { useToast } from "@/hooks/use-toast";

interface WorkoutPlanProps {
  userData: OnboardingData;
  userId: string;
}

interface DayWorkout {
  day_name: string;
  type: "rest" | "workout" | "active_recovery";
  focus: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    rest_seconds: number;
    muscle_group: string;
  }>;
}

interface WeeklyWorkouts {
  [key: string]: DayWorkout;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Exercise = DayWorkout["exercises"][number];

type LegacyWorkoutPlan = {
  split?: string;
  exercises?: Exercise[];
};

function splitIntoGroups(exercises: Exercise[], groupCount: number): Exercise[][] {
  const groups: Exercise[][] = Array.from({ length: groupCount }, () => []);
  exercises.forEach((ex, idx) => groups[idx % groupCount].push(ex));
  const nonEmpty = groups.filter((g) => g.length > 0);
  return nonEmpty.length === groupCount ? groups : Array.from({ length: groupCount }, () => exercises);
}

function filterByKeywords(exercises: Exercise[], keywords: string[]): Exercise[] {
  const keys = keywords.map((k) => k.toLowerCase());
  return exercises.filter((e) => {
    const mg = (e.muscle_group || "").toLowerCase();
    return keys.some((k) => mg.includes(k));
  });
}

function buildLegacyWeeklyWorkouts(
  legacy: LegacyWorkoutPlan,
  experience: OnboardingData["experience"]
): WeeklyWorkouts {
  const exercises = Array.isArray(legacy.exercises) ? legacy.exercises : [];
  const byRotation = splitIntoGroups(exercises, 3);

  // Attempt a muscle-group split if the data supports it; otherwise fall back to rotation.
  const push = filterByKeywords(exercises, ["chest", "should", "tricep"]).slice(0, 7);
  const pull = filterByKeywords(exercises, ["back", "bicep", "lat"]).slice(0, 7);
  const legs = filterByKeywords(exercises, ["quad", "ham", "glute", "calf", "leg"]).slice(0, 7);
  const usePPL = push.length >= 3 && pull.length >= 3 && legs.length >= 3;

  const makeRest = (dayIndex: number, type: DayWorkout["type"], focus: string): DayWorkout => ({
    day_name: DAY_NAMES[dayIndex],
    type,
    focus,
    exercises: [],
  });

  const makeWorkout = (dayIndex: number, focus: string, dayExercises: Exercise[]): DayWorkout => ({
    day_name: DAY_NAMES[dayIndex],
    type: "workout",
    focus,
    exercises: dayExercises,
  });

  const weekly: WeeklyWorkouts = {};

  if (experience === "beginner") {
    weekly["0"] = makeRest(0, "rest", "Rest Day");
    weekly["1"] = makeWorkout(1, "Full Body A", byRotation[0].slice(0, 7));
    weekly["2"] = makeRest(2, "active_recovery", "Light Cardio + Mobility");
    weekly["3"] = makeWorkout(3, "Full Body B", byRotation[1].slice(0, 7));
    weekly["4"] = makeRest(4, "active_recovery", "Light Cardio + Mobility");
    weekly["5"] = makeWorkout(5, "Full Body C", byRotation[2].slice(0, 7));
    weekly["6"] = makeRest(6, "active_recovery", "Active Recovery");
    return weekly;
  }

  // intermediate / advanced
  weekly["0"] = makeRest(0, "rest", "Rest Day");

  if (usePPL) {
    weekly["1"] = makeWorkout(1, "Push", push);
    weekly["2"] = makeWorkout(2, "Pull", pull);
    weekly["3"] = makeWorkout(3, "Legs", legs);
    weekly["4"] = makeWorkout(4, "Push (Variation)", push.slice().reverse());
    weekly["5"] = makeWorkout(5, "Pull (Variation)", pull.slice().reverse());
    weekly["6"] = makeWorkout(6, "Legs (Variation)", legs.slice().reverse());
  } else {
    weekly["1"] = makeWorkout(1, "Workout A", byRotation[0].slice(0, 7));
    weekly["2"] = makeWorkout(2, "Workout B", byRotation[1].slice(0, 7));
    weekly["3"] = makeWorkout(3, "Workout C", byRotation[2].slice(0, 7));
    weekly["4"] = makeWorkout(4, "Workout A (Variation)", byRotation[0].slice().reverse().slice(0, 7));
    weekly["5"] = makeWorkout(5, "Workout B (Variation)", byRotation[1].slice().reverse().slice(0, 7));
    weekly["6"] = makeRest(6, "active_recovery", "Active Recovery");
  }

  return weekly;
}

export const WorkoutPlan = ({ userData, userId }: WorkoutPlanProps) => {
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<WeeklyWorkouts | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadWorkoutPlan();
  }, [userId]);

  const loadWorkoutPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('fitness_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data && data.plan_data) {
        const planData = data.plan_data as any;
        // Handle both old format (workout_plan) and new format (weekly_workouts)
        if (planData.weekly_workouts) {
          setWeeklyWorkouts(planData.weekly_workouts);
        } else if (planData.workout_plan) {
          // Legacy plans stored a single workout; split it into a weekly schedule for display.
          setWeeklyWorkouts(buildLegacyWeeklyWorkouts(planData.workout_plan, userData.experience));
        }
      }
    } catch (error: any) {
      console.error('Error loading workout plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogWorkout = async () => {
    const todayWorkout = weeklyWorkouts?.[selectedDay.toString()];
    if (!todayWorkout || todayWorkout.type === "rest") return;

    try {
      const { error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: userId,
          workout_date: new Date().toISOString().split('T')[0],
          exercises: todayWorkout.exercises,
          completed: true,
          notes: `${todayWorkout.focus} completed`
        });

      if (error) throw error;

      toast({
        title: "Workout logged!",
        description: "Great job completing today's workout!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error logging workout",
        description: error.message,
      });
    }
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setSelectedDay(prev => {
      if (direction === 'prev') return prev === 0 ? 6 : prev - 1;
      return prev === 6 ? 0 : prev + 1;
    });
  };

  const isToday = selectedDay === new Date().getDay();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!weeklyWorkouts) {
    return (
      <Card className="p-8 border-border shadow-card text-center">
        <p className="text-muted-foreground mb-4">No workout plan available yet.</p>
        <Button variant="hero" onClick={loadWorkoutPlan}>
          Load Workout Plan
        </Button>
      </Card>
    );
  }

  const currentWorkout = weeklyWorkouts[selectedDay.toString()];
  const isRestDay = currentWorkout?.type === "rest" || currentWorkout?.type === "active_recovery";

  return (
    <div className="space-y-6">
      {/* Day Navigation */}
      <Card className="p-4 border-border shadow-card">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigateDay('prev')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div className="text-center">
              <h3 className="font-semibold">{currentWorkout?.day_name || DAY_NAMES[selectedDay]}</h3>
              <p className="text-sm text-muted-foreground">
                {isToday ? "Today" : ""} {currentWorkout?.focus}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={() => navigateDay('next')}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Week Overview */}
        <div className="flex justify-center gap-1 mt-4">
          {DAY_NAMES.map((day, idx) => {
            const dayWorkout = weeklyWorkouts[idx.toString()];
            const isRest = dayWorkout?.type === "rest" || dayWorkout?.type === "active_recovery";
            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(idx)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                  selectedDay === idx
                    ? "bg-primary text-primary-foreground"
                    : isRest
                    ? "bg-muted text-muted-foreground"
                    : "bg-secondary/20 text-secondary-foreground hover:bg-secondary/30"
                }`}
              >
                {day.charAt(0)}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Workout Content */}
      {isRestDay ? (
        <Card className="p-8 border-border shadow-card text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">😴</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">{currentWorkout?.focus || "Rest Day"}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {currentWorkout?.type === "active_recovery" 
              ? "Light activity recommended: walking, stretching, or yoga to help with recovery."
              : "Take it easy today! Your muscles need time to recover and grow stronger."}
          </p>
        </Card>
      ) : (
        <Card className="p-6 border-border shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{currentWorkout?.focus}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentWorkout?.exercises?.length || 0} exercises • {userData.experience.charAt(0).toUpperCase() + userData.experience.slice(1)} Level
                </p>
              </div>
            </div>
            {isToday && (
              <Button variant="hero" onClick={handleLogWorkout}>
                Complete Workout
              </Button>
            )}
          </div>

          <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
            <h4 className="font-semibold mb-2">Warm-up (10 minutes)</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                5 minutes light cardio
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Dynamic stretching
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Joint rotations
              </li>
            </ul>
          </Card>

          <div className="space-y-4">
            {currentWorkout?.exercises?.map((exercise, index) => (
              <Card key={index} className="p-4 border-border bg-background/50 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-2">
                    <div>
                      <h4 className="font-semibold">{exercise.name}</h4>
                      <p className="text-sm text-muted-foreground">{exercise.muscle_group}</p>
                    </div>
                    <ExerciseTutorDialog 
                      exerciseName={exercise.name}
                      trigger={
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Form Guide">
                          <Info className="h-4 w-4 text-primary" />
                        </Button>
                      }
                    />
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    Exercise {index + 1}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Sets</p>
                    <p className="font-semibold text-primary">{exercise.sets}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reps</p>
                    <p className="font-semibold text-secondary">{exercise.reps}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rest</p>
                    <p className="font-semibold">{exercise.rest_seconds}s</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-4 mt-6 bg-accent/5 border-accent/20">
            <h4 className="font-semibold mb-2">Cool-down (5 minutes)</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Light stretching
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Deep breathing exercises
              </li>
            </ul>
          </Card>
        </Card>
      )}
    </div>
  );
};