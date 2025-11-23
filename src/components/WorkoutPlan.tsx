import { Card } from "@/components/ui/card";
import { OnboardingData } from "./OnboardingForm";
import { Dumbbell } from "lucide-react";

interface WorkoutPlanProps {
  userData: OnboardingData;
}

export const WorkoutPlan = ({ userData }: WorkoutPlanProps) => {
  const sampleWorkout = [
    {
      name: "Bench Press",
      sets: 4,
      reps: "8-10",
      rest: 90,
      muscleGroup: "Chest"
    },
    {
      name: "Incline Dumbbell Press",
      sets: 3,
      reps: "10-12",
      rest: 60,
      muscleGroup: "Chest"
    },
    {
      name: "Cable Flyes",
      sets: 3,
      reps: "12-15",
      rest: 60,
      muscleGroup: "Chest"
    },
    {
      name: "Overhead Press",
      sets: 4,
      reps: "8-10",
      rest: 90,
      muscleGroup: "Shoulders"
    },
    {
      name: "Lateral Raises",
      sets: 3,
      reps: "12-15",
      rest: 45,
      muscleGroup: "Shoulders"
    },
    {
      name: "Tricep Dips",
      sets: 3,
      reps: "10-12",
      rest: 60,
      muscleGroup: "Triceps"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Today's Workout</h3>
            <p className="text-sm text-muted-foreground">
              Push Day - {userData.experience.charAt(0).toUpperCase() + userData.experience.slice(1)} Level
            </p>
          </div>
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
          {sampleWorkout.map((exercise, index) => (
            <Card key={index} className="p-4 border-border bg-background/50 hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{exercise.name}</h4>
                  <p className="text-sm text-muted-foreground">{exercise.muscleGroup}</p>
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
                  <p className="font-semibold">{exercise.rest}s</p>
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
