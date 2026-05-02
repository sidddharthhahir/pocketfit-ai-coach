import { Moon } from "lucide-react";
import { useRestDay } from "@/hooks/useRestDay";
import { useToast } from "@/hooks/use-toast";

interface RestDayToggleProps {
  userId: string;
}

/**
 * Lets users mark today as a planned recovery day so streaks
 * (workouts, gym check-ins) don't break.
 */
export const RestDayToggle = ({ userId }: RestDayToggleProps) => {
  const { isRestDay, loading, toggleRestDay } = useRestDay(userId);
  const { toast } = useToast();

  const handleClick = async () => {
    await toggleRestDay();
    toast({
      title: isRestDay ? "Rest day removed" : "Today is a rest day",
      description: isRestDay
        ? "Your streak now expects activity today."
        : "Your streaks won't break today. Recover well.",
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-pressed={isRestDay}
      className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
        isRestDay
          ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_16px_-6px_hsl(var(--primary))]"
          : "bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
      }`}
      title="Mark today as a planned rest day so streaks don't break"
    >
      <Moon className={`w-3.5 h-3.5 transition-transform ${isRestDay ? "scale-110" : "group-hover:scale-110"}`} />
      {isRestDay ? "Rest day on" : "Rest day"}
    </button>
  );
};

export default RestDayToggle;
