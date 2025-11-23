import { Card } from "@/components/ui/card";
import { OnboardingData } from "./OnboardingForm";
import { Calculator, TrendingUp } from "lucide-react";

interface CalorieCalculatorProps {
  userData: OnboardingData;
}

export const CalorieCalculator = ({ userData }: CalorieCalculatorProps) => {
  const calculateTDEE = () => {
    let bmr;
    if (userData.gender === "male") {
      bmr = 10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5;
    } else {
      bmr = 10 * userData.weight + 6.25 * userData.height - 5 * userData.age - 161;
    }
    
    const activityMultiplier = userData.experience === "advanced" ? 1.725 : 
                               userData.experience === "intermediate" ? 1.55 : 1.375;
    
    return Math.round(bmr * activityMultiplier);
  };

  const tdee = calculateTDEE();
  
  const getCalorieTarget = () => {
    switch (userData.goal) {
      case "bulk":
        return tdee + 400;
      case "cut":
        return tdee - 400;
      default:
        return tdee;
    }
  };

  const calorieTarget = getCalorieTarget();
  const proteinTarget = Math.round(userData.weight * 2);

  return (
    <Card className="p-6 border-border shadow-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Your Daily Targets</h3>
          <p className="text-sm text-muted-foreground">
            Based on your {userData.goal} goal
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-gradient-primary border-0">
          <p className="text-sm text-primary-foreground/80 mb-1">Calorie Target</p>
          <p className="text-3xl font-bold text-primary-foreground">{calorieTarget}</p>
          <p className="text-xs text-primary-foreground/70 mt-1">kcal/day</p>
        </Card>

        <Card className="p-4 bg-gradient-secondary border-0">
          <p className="text-sm text-secondary-foreground/80 mb-1">Protein Target</p>
          <p className="text-3xl font-bold text-secondary-foreground">{proteinTarget}</p>
          <p className="text-xs text-secondary-foreground/70 mt-1">grams/day</p>
        </Card>

        <Card className="p-4 bg-gradient-accent border-0">
          <p className="text-sm text-accent-foreground/80 mb-1">TDEE</p>
          <p className="text-3xl font-bold text-accent-foreground">{tdee}</p>
          <p className="text-xs text-accent-foreground/70 mt-1">maintenance</p>
        </Card>
      </div>

      <div className="space-y-3 p-4 bg-muted rounded-lg">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium">Calculation Method</p>
            <p className="text-xs text-muted-foreground">
              TDEE calculated using Mifflin-St Jeor equation with {userData.experience} activity level
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Bulk: TDEE + 400 calories for steady muscle gain</p>
          <p>• Cut: TDEE - 400 calories for fat loss while preserving muscle</p>
          <p>• Protein: 2g per kg bodyweight for optimal muscle synthesis</p>
        </div>
      </div>
    </Card>
  );
};
