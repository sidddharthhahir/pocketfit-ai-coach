import { Card } from "@/components/ui/card";
import { Flame, TrendingUp, Calendar } from "lucide-react";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
}

export const StreakCard = ({ currentStreak, longestStreak, totalDaysActive }: StreakCardProps) => {
  const streakEmoji = currentStreak >= 30 ? "🔥" : currentStreak >= 14 ? "💪" : currentStreak >= 7 ? "⚡" : "✨";
  const streakMessage = 
    currentStreak >= 30 ? "Unstoppable!" :
    currentStreak >= 14 ? "On fire!" :
    currentStreak >= 7 ? "Great momentum!" :
    currentStreak >= 3 ? "Building habits!" :
    currentStreak >= 1 ? "Keep it up!" :
    "Start your streak!";

  return (
    <Card className="p-6 border-border overflow-hidden relative">
      {/* Background glow effect */}
      {currentStreak >= 7 && (
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
      )}
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{currentStreak}</span>
              <span className="text-lg text-muted-foreground">days</span>
              <span className="text-2xl">{streakEmoji}</span>
            </div>
            <p className="text-sm text-primary mt-1">{streakMessage}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-destructive flex items-center justify-center shadow-lg shadow-primary/30">
            <Flame className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{longestStreak}</p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{totalDaysActive}</p>
              <p className="text-xs text-muted-foreground">Total Days</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
