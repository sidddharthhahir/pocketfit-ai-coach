import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DietPlan } from "@/components/DietPlan";
import { MealLogger } from "@/components/MealLogger";
import { NutritionChat } from "@/components/NutritionChat";
import { OnboardingData } from "@/components/OnboardingForm";
import { Utensils, ClipboardList, MessageSquare } from "lucide-react";

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

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>AI Coach</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            <span>Diet Plan</span>
          </TabsTrigger>
          <TabsTrigger value="log" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            <span>Log Meals</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <NutritionChat userData={userData} />
        </TabsContent>

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
