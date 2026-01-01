import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock, Star } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
  xp: number;
  category: "workout" | "nutrition" | "consistency" | "milestone";
}

interface AchievementsCardProps {
  achievements: Achievement[];
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  currentLevelXP: number;
}

const categoryColors: Record<string, string> = {
  workout: "bg-primary/10 text-primary",
  nutrition: "bg-secondary/10 text-secondary",
  consistency: "bg-accent/10 text-accent",
  milestone: "bg-yellow-500/10 text-yellow-500",
};

export const AchievementsCard = ({ 
  achievements, 
  totalXP, 
  level, 
  xpToNextLevel, 
  currentLevelXP 
}: AchievementsCardProps) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const levelProgress = (currentLevelXP / xpToNextLevel) * 100;

  // Get 3 most recent/relevant achievements
  const displayAchievements = achievements
    .sort((a, b) => {
      // Prioritize unlocked first, then by progress
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      return (b.progress / b.target) - (a.progress / a.target);
    })
    .slice(0, 4);

  return (
    <Card className="p-6 border-border">
      {/* Header with XP and Level */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Achievements</h3>
            <p className="text-sm text-muted-foreground">
              {unlockedCount}/{achievements.length} unlocked
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-yellow-500" />
            <span className="font-bold">{totalXP.toLocaleString()} XP</span>
          </div>
          <p className="text-xs text-muted-foreground">Level {level}</p>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-6 p-4 bg-muted/50 rounded-xl">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Level {level}</span>
          <span className="text-muted-foreground">Level {level + 1}</span>
        </div>
        <Progress value={levelProgress} className="h-2" />
        <p className="text-xs text-muted-foreground text-center mt-2">
          {xpToNextLevel - currentLevelXP} XP to next level
        </p>
      </div>

      {/* Achievement List */}
      <div className="space-y-3">
        {displayAchievements.map((achievement) => (
          <div 
            key={achievement.id}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              achievement.unlocked 
                ? "bg-gradient-to-r from-primary/5 to-transparent" 
                : "bg-muted/30"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
              achievement.unlocked 
                ? categoryColors[achievement.category]
                : "bg-muted text-muted-foreground"
            }`}>
              {achievement.unlocked ? achievement.icon : <Lock className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`font-medium text-sm truncate ${
                  achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {achievement.name}
                </p>
                {achievement.unlocked && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    +{achievement.xp} XP
                  </Badge>
                )}
              </div>
              {!achievement.unlocked && (
                <div className="mt-1">
                  <Progress 
                    value={(achievement.progress / achievement.target) * 100} 
                    className="h-1" 
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {achievement.progress}/{achievement.target} - {achievement.description}
                  </p>
                </div>
              )}
              {achievement.unlocked && (
                <p className="text-xs text-muted-foreground truncate">
                  {achievement.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
