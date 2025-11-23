import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Calendar, Scale, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProgressTrackerProps {
  userId: string;
}

export const ProgressTracker = ({ userId }: ProgressTrackerProps) => {
  const [weight, setWeight] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [insights, setInsights] = useState<any>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWeightHistory();
    loadLatestInsights();
  }, [userId]);

  const loadWeightHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId)
        .order('log_date', { ascending: true })
        .limit(30);

      if (error) throw error;
      setWeightHistory(data || []);
    } catch (error: any) {
      console.error('Error loading weight history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadLatestInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) setInsights(data.insights);
    } catch (error: any) {
      console.error('Error loading insights:', error);
    }
  };

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogging(true);

    try {
      const { error } = await supabase
        .from('weight_logs')
        .insert({
          user_id: userId,
          weight: parseFloat(weight),
          log_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Weight logged!",
        description: "Your progress has been recorded.",
      });

      setWeight("");
      loadWeightHistory();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error logging weight",
        description: error.message,
      });
    } finally {
      setIsLogging(false);
    }
  };

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        'generate-weekly-insights',
        {}
      );

      if (error) throw error;

      setInsights(data.insights);
      toast({
        title: "Insights generated!",
        description: "Your weekly progress analysis is ready.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error generating insights",
        description: error.message || "Failed to generate insights. Try again later.",
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const chartData = weightHistory.map(log => ({
    date: new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: Number(log.weight)
  }));

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Weight Tracking</h3>
            <p className="text-sm text-muted-foreground">Monitor your progress</p>
          </div>
        </div>

        <form onSubmit={handleLogWeight} className="flex gap-3 mb-6">
          <div className="flex-1">
            <Label htmlFor="weight" className="sr-only">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="Enter weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isLogging} variant="hero">
            {isLogging ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log Weight"}
          </Button>
        </form>

        {isLoadingHistory ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No weight data yet. Start logging your weight!
          </p>
        )}
      </Card>

      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Weekly Insights</h3>
              <p className="text-sm text-muted-foreground">AI-powered progress analysis</p>
            </div>
          </div>
          <Button
            onClick={handleGenerateInsights}
            disabled={isGeneratingInsights}
            variant="premium"
          >
            {isGeneratingInsights ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Insights"
            )}
          </Button>
        </div>

        {insights ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Weight Change</p>
                <p className="text-xl font-bold text-primary">
                  {insights.weight_change > 0 ? '+' : ''}{insights.weight_change}kg
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-xl font-bold text-secondary">{insights.attendance_rate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Protein</p>
                <p className="text-xl font-bold text-accent">{insights.protein_average}g</p>
              </div>
            </div>

            {insights.progress_summary && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-medium mb-2">Progress Summary</p>
                <p className="text-sm text-muted-foreground">{insights.progress_summary}</p>
              </div>
            )}

            {insights.suggestions && insights.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Recommendations</p>
                {insights.suggestions.map((suggestion: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <Calendar className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Generate your first weekly insights to see AI-powered progress analysis!
          </p>
        )}
      </Card>
    </div>
  );
};
