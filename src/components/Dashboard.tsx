import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DietPlan } from "./DietPlan";
import { WorkoutPlan } from "./WorkoutPlan";
import { CalorieCalculator } from "./CalorieCalculator";
import { ProgressTracker } from "./ProgressTracker";
import { MealLogger } from "./MealLogger";
import { WorkoutLogger } from "./WorkoutLogger";
import { PlanAdjustment } from "./PlanAdjustment";
import { ProfileSection } from "./ProfileSection";
import { ExerciseFormChecker } from "./ExerciseFormChecker";
import { LogOut } from "lucide-react";
import { OnboardingData } from "./OnboardingForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  userData: OnboardingData;
  userId: string;
}

export const Dashboard = ({ userData, userId }: DashboardProps) => {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PocketFit AI
            </h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to your fitness journey!</h2>
          <p className="text-muted-foreground">
            Your personalized plan is ready. Let's achieve your goals together.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-7 gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="diet">Diet</TabsTrigger>
            <TabsTrigger value="workout">Workout</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="log">Log</TabsTrigger>
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <CalorieCalculator userData={userData} />
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-border shadow-card">
                <h3 className="text-xl font-semibold mb-4">Your Stats</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Weight</dt>
                    <dd className="font-semibold">{userData.weight} kg</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Height</dt>
                    <dd className="font-semibold">{userData.height} cm</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Age</dt>
                    <dd className="font-semibold">{userData.age} years</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Goal</dt>
                    <dd className="font-semibold capitalize">{userData.goal}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Experience</dt>
                    <dd className="font-semibold capitalize">{userData.experience}</dd>
                  </div>
                </dl>
              </Card>

              <Card className="p-6 border-border shadow-card">
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    Log Today's Workout
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Track Meal
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    View Progress
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Update Goals
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="diet">
            <DietPlan userData={userData} userId={userId} />
          </TabsContent>

          <TabsContent value="workout">
            <WorkoutPlan userData={userData} userId={userId} />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressTracker userId={userId} />
          </TabsContent>

          <TabsContent value="log" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <MealLogger />
              <WorkoutLogger userId={userId} />
            </div>
          </TabsContent>

          <TabsContent value="form">
            <ExerciseFormChecker />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileSection userId={userId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
