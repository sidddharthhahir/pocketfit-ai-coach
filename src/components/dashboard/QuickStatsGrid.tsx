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
    glow: "group-hover:shadow-glow-primary",
  },
  secondary: {
    bg: "bg-secondary",
    text: "text-foreground",
    border: "border-border",
    glow: "group-hover:shadow-card-hover",
  },
  accent: {
    bg: "bg-accent/10",
    text: "text-accent",
    border: "border-accent/10",
    glow: "group-hover:shadow-glow-accent",
  },
  blue: {
    bg: "bg-chart-4/10",
    text: "text-chart-4",
    border: "border-chart-4/10",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--chart-4)/0.15)]",
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
            className={`group p-4 border ${colors.border} ${colors.glow} hover:translate-y-[-2px] transition-all duration-500`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-4.5 h-4.5 ${colors.text}`} />
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
                <span className="text-2xl font-bold text-foreground stat-glow">{stat.value}</span>
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