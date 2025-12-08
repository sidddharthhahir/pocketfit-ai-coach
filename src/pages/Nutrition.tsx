import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DietPlan } from "@/components/DietPlan";
import { MealLogger } from "@/components/MealLogger";
import { OnboardingData } from "@/components/OnboardingForm";
import { Utensils, ClipboardList } from "lucide-react";

interface NutritionPageProps {
  userData: OnboardingData;
  userId: string;
}

export const NutritionPage = ({ userData, userId }: NutritionPageProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Nutrition</h2>
        <p className="text-muted-foreground">
          Your personalized diet plan and meal tracking.
        </p>
      </div>

      <Tabs defaultValue="plan" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            <span>Diet Plan</span>
          </TabsTrigger>
          <TabsTrigger value="log" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            <span>Log Meals</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plan">
          <DietPlan userData={userData} userId={userId} />
        </TabsContent>

        <TabsContent value="log">
          <MealLogger />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NutritionPage;
