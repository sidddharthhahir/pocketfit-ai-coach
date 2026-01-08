import { Card } from "@/components/ui/card";
import { Droplets, Moon, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface WaterSleepChartsProps {
  weeklyWater: { day: string; amount: number }[];
  weeklySleep: { day: string; hours: number; quality: string }[];
  waterGoal: number;
  sleepGoal: number;
  aiInsights: {
    water: string;
    sleep: string;
  };
}

export const WaterSleepCharts = ({
  weeklyWater,
  weeklySleep,
  waterGoal,
  sleepGoal,
  aiInsights,
}: WaterSleepChartsProps) => {
  const avgWater = Math.round(
    weeklyWater.reduce((sum, d) => sum + d.amount, 0) / 7
  );
  const avgSleep = (
    weeklySleep.reduce((sum, d) => sum + d.hours, 0) / 7
  ).toFixed(1);

  const waterTrend = avgWater >= waterGoal;
  const sleepTrend = parseFloat(avgSleep) >= sleepGoal;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Water Chart */}
      <Card className="p-6 border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Water Intake</h3>
              <p className="text-sm text-muted-foreground">7-day average: {avgWater}ml</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-sm ${waterTrend ? "text-accent" : "text-amber-500"}`}>
            {waterTrend ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {waterTrend ? "On track" : "Below goal"}
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyWater}>
              <defs>
                <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210, 100%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(210, 100%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="hsl(210, 100%, 60%)"
                fill="url(#waterGradient)"
                strokeWidth={2}
                name="Water (ml)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insight */}
        {aiInsights.water && (
          <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2 text-sm text-blue-400 mb-1">
              <Sparkles className="w-4 h-4" />
              AI Insight
            </div>
            <p className="text-sm text-muted-foreground">{aiInsights.water}</p>
          </div>
        )}
      </Card>

      {/* Sleep Chart */}
      <Card className="p-6 border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Moon className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">Sleep Quality</h3>
              <p className="text-sm text-muted-foreground">7-day average: {avgSleep}h</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-sm ${sleepTrend ? "text-accent" : "text-amber-500"}`}>
            {sleepTrend ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {sleepTrend ? "Well rested" : "Need more sleep"}
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklySleep}>
              <defs>
                <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(270, 70%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(270, 70%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} domain={[0, 12]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="hsl(270, 70%, 60%)"
                fill="url(#sleepGradient)"
                strokeWidth={2}
                name="Sleep (hours)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insight */}
        {aiInsights.sleep && (
          <div className="mt-4 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <div className="flex items-center gap-2 text-sm text-purple-400 mb-1">
              <Sparkles className="w-4 h-4" />
              AI Insight
            </div>
            <p className="text-sm text-muted-foreground">{aiInsights.sleep}</p>
          </div>
        )}
      </Card>
    </div>
  );
};
