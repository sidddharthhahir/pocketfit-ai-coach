import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "./OnboardingForm";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, Loader2, Info } from "lucide-react";
import { ExerciseTutorDialog } from "./ExerciseTutorDialog";
import { useToast } from "@/hooks/use-toast";

interface WorkoutPlanProps {
  userData: OnboardingData;
  userId: string;
}

export const WorkoutPlan = ({ userData, userId }: WorkoutPlanProps) => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workoutSplit, setWorkoutSplit] = useState("");
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
        if (planData.workout_plan) {
          setExercises(planData.workout_plan.exercises || []);
          setWorkoutSplit(planData.workout_plan.split || '');
        }
      }
    } catch (error: any) {
      console.error('Error loading workout plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogWorkout = async () => {
    try {
      const { error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: userId,
          workout_date: new Date().toISOString().split('T')[0],
          exercises: exercises,
          completed: true,
          notes: `${workoutSplit} day completed`
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <Card className="p-8 border-border shadow-card text-center">
        <p className="text-muted-foreground mb-4">No workout plan available yet.</p>
        <Button variant="hero" onClick={loadWorkoutPlan}>
          Load Workout Plan
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Today's Workout</h3>
              <p className="text-sm text-muted-foreground">
                {workoutSplit.toUpperCase()} Day - {userData.experience.charAt(0).toUpperCase() + userData.experience.slice(1)} Level
              </p>
            </div>
          </div>
          <Button variant="hero" onClick={handleLogWorkout}>
            Complete Workout
          </Button>
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
          {exercises.map((exercise, index) => (
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
    </div>
  );
};
