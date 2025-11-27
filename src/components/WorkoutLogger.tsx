import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface WorkoutLoggerProps {
  userId: string;
}

export const WorkoutLogger = ({ userId }: WorkoutLoggerProps) => {
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTodayWorkout();
  }, [userId]);

  const loadTodayWorkout = async () => {
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
        setTodayWorkout(planData.workout_plan);
      }
    } catch (error: any) {
      console.error('Error loading workout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExercise = (exerciseName: string) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(exerciseName)) {
      newCompleted.delete(exerciseName);
    } else {
      newCompleted.add(exerciseName);
    }
    setCompletedExercises(newCompleted);
  };

  const handleCompleteWorkout = async () => {
    const today = new Date().toISOString().split('T')[0];
    const allCompleted = todayWorkout.exercises.length === completedExercises.size;

    try {
      const { error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: userId,
          workout_date: today,
          exercises: todayWorkout.exercises,
          completed: allCompleted,
          notes: notes || null
        });

      if (error) throw error;

      toast.success(allCompleted ? "Workout completed! 💪" : "Workout logged");
      setCompletedExercises(new Set());
      setNotes("");
    } catch (error: any) {
      console.error('Error logging workout:', error);
      toast.error('Failed to log workout');
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 border-border shadow-card">
        <p className="text-muted-foreground">Loading workout...</p>
      </Card>
    );
  }

  if (!todayWorkout) {
    return (
      <Card className="p-6 border-border shadow-card text-center">
        <p className="text-muted-foreground">No workout plan available</p>
      </Card>
    );
  }

  const progress = (completedExercises.size / todayWorkout.exercises.length) * 100;

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">Today's Workout</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {todayWorkout.split} • {completedExercises.size}/{todayWorkout.exercises.length} exercises
            </p>
          </div>
          {progress === 100 && (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          )}
        </div>

        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-3 mb-6">
          {todayWorkout.exercises.map((exercise: any, idx: number) => (
            <div 
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
            >
              <Checkbox
                checked={completedExercises.has(exercise.name)}
                onCheckedChange={() => toggleExercise(exercise.name)}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium">{exercise.name}</p>
                <p className="text-sm text-muted-foreground">
                  {exercise.sets} sets × {exercise.reps} reps • {exercise.rest_seconds}s rest
                </p>
                {exercise.notes && (
                  <p className="text-xs text-accent mt-1">{exercise.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Workout Notes (Optional)</label>
          <Textarea
            placeholder="How did it feel? Any PRs or adjustments?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <Button 
          onClick={handleCompleteWorkout}
          className="w-full"
          disabled={completedExercises.size === 0}
        >
          {completedExercises.size === todayWorkout.exercises.length 
            ? 'Complete Workout 🎉' 
            : `Log Workout (${completedExercises.size}/${todayWorkout.exercises.length})`
          }
        </Button>
      </Card>
    </div>
  );
};
