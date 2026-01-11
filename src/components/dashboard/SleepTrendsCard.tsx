import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Moon,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Dumbbell,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";

interface SleepTrendData {
  date: string;
  hours: number;
  quality: string;
  qualityScore: number;
}

interface WorkoutCorrelation {
  sleepQuality: string;
  avgWorkoutIntensity: number;
  workoutCount: number;
  avgSleepHours: number;
}

interface SleepTrendsCardProps {
  weeklyData: SleepTrendData[];
  monthlyData: SleepTrendData[];
  avgWeeklySleep: number;
  avgMonthlySleep: number;
  avgWeeklyQuality: number;
  avgMonthlyQuality: number;
  bestSleepDay: string;
  worstSleepDay: string;
  sleepWorkoutCorrelation: WorkoutCorrelation[];
  trendDirection: "improving" | "declining" | "stable";
  insights: string[];
}

const TrendIcon = ({ direction }: { direction: "improving" | "declining" | "stable" }) => {
  if (direction === "improving") return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (direction === "declining") return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const qualityColor = (quality: string) => {
  switch (quality.toLowerCase()) {
    case "excellent": return "bg-green-500/20 text-green-500 border-green-500/30";
    case "good": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
    case "fair": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    case "poor": return "bg-red-500/20 text-red-500 border-red-500/30";
    default: return "bg-muted text-muted-foreground";
  }
};

export const SleepTrendsCard = ({
  weeklyData,
  monthlyData,
  avgWeeklySleep,
  avgMonthlySleep,
  avgWeeklyQuality,
  avgMonthlyQuality,
  bestSleepDay,
  worstSleepDay,
  sleepWorkoutCorrelation,
  trendDirection,
  insights,
}: SleepTrendsCardProps) => {
  const formatChartData = (data: SleepTrendData[]) =>
    data.map((d) => ({
      ...d,
      displayDate: format(new Date(d.date), "MMM d"),
    }));

  return (
    <Card className="p-6 border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10">
            <Moon className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Sleep Trends & Insights</h3>
            <p className="text-sm text-muted-foreground">
              Track patterns and workout correlation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon direction={trendDirection} />
          <span className="text-sm capitalize text-muted-foreground">
            {trendDirection}
          </span>
        </div>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="weekly" className="text-sm">
            <Calendar className="w-4 h-4 mr-1" /> Weekly
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-sm">
            <Calendar className="w-4 h-4 mr-1" /> Monthly
          </TabsTrigger>
          <TabsTrigger value="correlation" className="text-sm">
            <Dumbbell className="w-4 h-4 mr-1" /> Workout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Avg Sleep</p>
              <p className="text-xl font-bold">{avgWeeklySleep.toFixed(1)}h</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Avg Quality</p>
              <p className="text-xl font-bold">
                {avgWeeklyQuality >= 3.5
                  ? "Excellent"
                  : avgWeeklyQuality >= 2.5
                  ? "Good"
                  : avgWeeklyQuality >= 1.5
                  ? "Fair"
                  : avgWeeklyQuality > 0
                  ? "Poor"
                  : "—"}
              </p>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formatChartData(weeklyData)}>
                <defs>
                  <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 12]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}h`, "Sleep"]}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="hsl(var(--primary))"
                  fill="url(#sleepGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Avg Sleep</p>
              <p className="text-xl font-bold">{avgMonthlySleep.toFixed(1)}h</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Best Day</p>
              <p className="text-xl font-bold">{bestSleepDay || "—"}</p>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formatChartData(monthlyData)}>
                <defs>
                  <linearGradient id="sleepMonthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="displayDate" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
                <YAxis domain={[0, 12]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}h`, "Sleep"]}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="hsl(var(--secondary))"
                  fill="url(#sleepMonthGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            How sleep quality affects your next-day workouts
          </p>

          {sleepWorkoutCorrelation.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sleepWorkoutCorrelation}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="sleepQuality" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="workoutCount" name="Workouts Completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgSleepHours" name="Avg Sleep (hrs)" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap gap-2">
                {sleepWorkoutCorrelation.map((corr) => (
                  <Badge key={corr.sleepQuality} variant="outline" className={qualityColor(corr.sleepQuality)}>
                    {corr.sleepQuality}: {corr.workoutCount} workouts
                  </Badge>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Log more sleep and workouts to see correlation</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-500">AI Insights</span>
          </div>
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li key={i} className="text-sm text-foreground/90">{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
