import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, CheckCircle2, Info, Trash2, History } from "lucide-react";
import { ExerciseTutorDialog } from "./ExerciseTutorDialog";
import { toast } from "sonner";

interface WorkoutLoggerProps {
  userId: string;
}

interface WorkoutLogEntry {
  id: string;
  workout_date: string;
  exercises: any;
  completed: boolean;
  notes: string | null;
  created_at: string;
}

export const WorkoutLogger = ({ userId }: WorkoutLoggerProps) => {
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState<WorkoutLogEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadTodayWorkout();
    loadRecentLogs();
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

  const loadRecentLogs = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('workout_date', sevenDaysAgo.toISOString().split('T')[0])
        .order('workout_date', { ascending: false });

      if (error) throw error;
      setRecentLogs((data || []) as WorkoutLogEntry[]);
    } catch (error) {
      console.error('Error loading workout logs:', error);
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
      loadRecentLogs();
    } catch (error: any) {
      console.error('Error logging workout:', error);
      toast.error('Failed to log workout');
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
      toast.success("Workout log deleted");
      loadRecentLogs();
    } catch (error) {
      toast.error("Failed to delete log");
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
                <div className="flex items-center gap-2">
                  <p className="font-medium">{exercise.name}</p>
                  <ExerciseTutorDialog 
                    exerciseName={exercise.name}
                    trigger={
                      <button className="text-primary hover:text-primary/80 transition-colors" title="Form Guide">
                        <Info className="h-4 w-4" />
                      </button>
                    }
                  />
                </div>
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

      {/* Recent Workout History */}
      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <History className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Recent Workouts</h3>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? "Hide" : "Show"}
          </Button>
        </div>

        {showHistory && (
          recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No workouts logged this week</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {new Date(log.workout_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      {log.completed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {Array.isArray(log.exercises) ? `${log.exercises.length} exercises` : 'Workout'} 
                      {log.notes && ` · ${log.notes.slice(0, 40)}${log.notes.length > 40 ? '...' : ''}`}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this workout log?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the workout from {new Date(log.workout_date).toLocaleDateString()}. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteLog(log.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )
        )}
      </Card>
    </div>
  );
};
