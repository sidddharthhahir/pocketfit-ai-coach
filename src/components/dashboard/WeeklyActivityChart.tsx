import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Dumbbell, Utensils, Camera } from "lucide-react";

interface WeeklyActivityChartProps {
  workouts: number[];
  meals: number[];
  checkins: number[];
}

export const WeeklyActivityChart = ({ workouts, meals, checkins }: WeeklyActivityChartProps) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  const data = days.map((day, index) => ({
    day,
    workouts: workouts[index] || 0,
    meals: meals[index] || 0,
    checkins: checkins[index] || 0,
  }));

  const totalWorkouts = workouts.reduce((a, b) => a + b, 0);
  const totalMeals = meals.reduce((a, b) => a + b, 0);
  const totalCheckins = checkins.reduce((a, b) => a + b, 0);

  return (
    <Card className="p-6 border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">This Week's Activity</h3>
          <p className="text-sm text-muted-foreground">Your daily consistency</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Workouts</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-muted-foreground">Meals</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">Check-ins</span>
          </div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="workouts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="meals" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="checkins" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalWorkouts}</p>
          <p className="text-xs text-muted-foreground">Workouts</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-2">
            <Utensils className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalMeals}</p>
          <p className="text-xs text-muted-foreground">Meals Logged</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
            <Camera className="w-5 h-5 text-accent" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalCheckins}</p>
          <p className="text-xs text-muted-foreground">Check-ins</p>
        </div>
      </div>
    </Card>
  );
};
