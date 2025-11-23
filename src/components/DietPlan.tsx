import { Card } from "@/components/ui/card";
import { OnboardingData } from "./OnboardingForm";
import { Utensils } from "lucide-react";

interface DietPlanProps {
  userData: OnboardingData;
}

export const DietPlan = ({ userData }: DietPlanProps) => {
  const sampleMeals = [
    {
      type: "Breakfast",
      time: "8:00 AM",
      items: ["Oatmeal with banana", "2 boiled eggs", "Green tea"],
      calories: 450,
      protein: 25
    },
    {
      type: "Mid-Morning Snack",
      time: "11:00 AM",
      items: ["Greek yogurt", "Handful of almonds"],
      calories: 200,
      protein: 15
    },
    {
      type: "Lunch",
      time: "1:00 PM",
      items: ["Grilled chicken breast", "Brown rice", "Mixed vegetables", "Salad"],
      calories: 600,
      protein: 45
    },
    {
      type: "Evening Snack",
      time: "4:00 PM",
      items: ["Protein shake", "Apple"],
      calories: 250,
      protein: 30
    },
    {
      type: "Dinner",
      time: "7:00 PM",
      items: ["Baked fish", "Sweet potato", "Steamed broccoli"],
      calories: 500,
      protein: 40
    }
  ];

  const totalCalories = sampleMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = sampleMeals.reduce((sum, meal) => sum + meal.protein, 0);

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
          {sampleMeals.map((meal, index) => (
            <Card key={index} className="p-4 border-border bg-background/50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{meal.type}</h4>
                  <p className="text-sm text-muted-foreground">{meal.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{meal.calories} cal</p>
                  <p className="text-sm text-accent">{meal.protein}g protein</p>
                </div>
              </div>
              <ul className="space-y-1">
                {meal.items.map((item, idx) => (
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
