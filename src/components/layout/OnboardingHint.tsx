import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingHintProps {
  onDismiss: () => void;
}

export const OnboardingHint = ({ onDismiss }: OnboardingHintProps) => {
  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-primary text-primary-foreground rounded-lg p-4 shadow-glow z-50 animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">Welcome to FitAI! 👋</p>
          <p className="text-xs opacity-90">
            Use the navigation bar to switch between Workouts, Nutrition, Progress, and more.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-6 w-6 hover:bg-primary-foreground/20"
          onClick={onDismiss}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
