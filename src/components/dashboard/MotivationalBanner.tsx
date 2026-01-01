import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MotivationalBannerProps {
  userName?: string;
  todayWorkoutDone: boolean;
  currentStreak: number;
  suggestion: string;
  actionLabel: string;
  actionRoute: string;
}

export const MotivationalBanner = ({
  userName,
  todayWorkoutDone,
  currentStreak,
  suggestion,
  actionLabel,
  actionRoute,
}: MotivationalBannerProps) => {
  const navigate = useNavigate();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getMessage = () => {
    if (todayWorkoutDone) {
      return "Great job completing today's workout! 💪";
    }
    if (currentStreak >= 7) {
      return `${currentStreak} day streak! Don't break it now! 🔥`;
    }
    if (currentStreak >= 3) {
      return "You're building momentum. Keep pushing!";
    }
    return suggestion || "Ready to crush your goals today?";
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-primary/20 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {getGreeting()}{userName ? `, ${userName}` : ""}! 👋
            </h2>
            <p className="text-muted-foreground mt-1">{getMessage()}</p>
          </div>
        </div>
        
        {!todayWorkoutDone && (
          <Button 
            onClick={() => navigate(actionRoute)} 
            className="shrink-0 group"
          >
            {actionLabel}
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>
    </Card>
  );
};
