import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Target, Flame, Beef, Droplets } from "lucide-react";

interface QuickStat {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  icon: "target" | "flame" | "protein" | "water";
  color: "primary" | "secondary" | "accent" | "blue";
}

interface QuickStatsGridProps {
  stats: QuickStat[];
}

const iconMap = {
  target: Target,
  flame: Flame,
  protein: Beef,
  water: Droplets,
};

const colorMap = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    glow: "shadow-primary/20",
  },
  secondary: {
    bg: "bg-secondary/10",
    text: "text-secondary",
    glow: "shadow-secondary/20",
  },
  accent: {
    bg: "bg-accent/10",
    text: "text-accent",
    glow: "shadow-accent/20",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    glow: "shadow-blue-500/20",
  },
};

export const QuickStatsGrid = ({ stats }: QuickStatsGridProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.icon];
        const colors = colorMap[stat.color];
        
        return (
          <Card 
            key={index} 
            className="p-4 border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center shadow-lg ${colors.glow}`}>
                <Icon className={`w-5 h-5 ${colors.text}`} />
              </div>
              {stat.change !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.change > 0 ? "text-accent" : stat.change < 0 ? "text-destructive" : "text-muted-foreground"
                }`}>
                  {stat.change > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : stat.change < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                  {stat.change > 0 ? "+" : ""}{stat.change}%
                </div>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                {stat.unit && <span className="text-sm text-muted-foreground">{stat.unit}</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              {stat.changeLabel && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">{stat.changeLabel}</p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
