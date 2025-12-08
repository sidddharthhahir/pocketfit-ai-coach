import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalorieCalculator } from "@/components/CalorieCalculator";
import { OnboardingData } from "@/components/OnboardingForm";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Utensils, TrendingUp, Camera } from "lucide-react";

interface DashboardPageProps {
  userData: OnboardingData;
  userId: string;
}

export const DashboardPage = ({ userData, userId }: DashboardPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
        <p className="text-muted-foreground">
          Your personalized fitness journey continues. Let's crush your goals today.
        </p>
      </div>

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
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/workouts")}
            >
              <Dumbbell className="w-4 h-4 mr-2" />
              Log Today's Workout
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/nutrition")}
            >
              <Utensils className="w-4 h-4 mr-2" />
              Track Meal
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/progress")}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View Progress
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/photos")}
            >
              <Camera className="w-4 h-4 mr-2" />
              Gym Check-in
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
