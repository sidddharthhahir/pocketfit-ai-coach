import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "./OnboardingForm";
import { supabase } from "@/integrations/supabase/client";
import { Utensils, Loader2 } from "lucide-react";

interface DietPlanProps {
  userData: OnboardingData;
  userId: string;
}

export const DietPlan = ({ userData, userId }: DietPlanProps) => {
  const [meals, setMeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDietPlan();
  }, [userId]);

  const loadDietPlan = async () => {
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
        if (planData.diet_plan?.meals) {
          setMeals(planData.diet_plan.meals);
        }
      }
    } catch (error: any) {
      console.error('Error loading diet plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <Card className="p-8 border-border shadow-card text-center">
        <p className="text-muted-foreground mb-4">No diet plan available yet.</p>
        <Button variant="hero" onClick={loadDietPlan}>
          Load Diet Plan
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Today's Diet Plan</h3>
            <p className="text-sm text-muted-foreground">
              Tailored for your {userData.goal} goal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Calories</p>
            <p className="text-2xl font-bold text-primary">{totalCalories}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Protein</p>
            <p className="text-2xl font-bold text-secondary">{totalProtein}g</p>
          </div>
        </div>

        <div className="space-y-4">
          {meals.map((meal, index) => (
            <Card key={index} className="p-4 border-border bg-background/50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold capitalize">{meal.type}</h4>
                  <p className="text-sm text-muted-foreground">{meal.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{meal.calories} cal</p>
                  <p className="text-sm text-accent">{meal.protein}g protein</p>
                </div>
              </div>
              <ul className="space-y-1">
                {meal.items.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
