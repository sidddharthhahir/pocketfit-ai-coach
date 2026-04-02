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
    border: "border-primary/10",
  },
  secondary: {
    bg: "bg-secondary",
    text: "text-foreground",
    border: "border-border",
  },
  accent: {
    bg: "bg-accent/10",
    text: "text-accent",
    border: "border-accent/10",
  },
  blue: {
    bg: "bg-chart-4/10",
    text: "text-chart-4",
    border: "border-chart-4/10",
  },
};

export const QuickStatsGrid = ({ stats }: QuickStatsGridProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.icon];
        const colors = colorMap[stat.color];
        
        return (
          <Card 
            key={index} 
            className={`p-4 border ${colors.border} hover:shadow-card-hover transition-all duration-300`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${colors.text}`} />
              </div>
              {stat.change !== undefined && (
                <div className={`flex items-center gap-0.5 text-xs font-medium ml-auto ${
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
                <span className="text-xl font-bold text-foreground">{stat.value}</span>
                {stat.unit && <span className="text-xs text-muted-foreground">{stat.unit}</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
