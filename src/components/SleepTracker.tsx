import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Moon, Sunrise, Sunset, Brain, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SleepTrackerProps {
  userId: string;
  onLog: () => void;
}

const QUALITY_EMOJIS = {
  poor: { emoji: "😴", label: "Poor", color: "text-red-400" },
  fair: { emoji: "😐", label: "Fair", color: "text-amber-400" },
  good: { emoji: "🙂", label: "Good", color: "text-green-400" },
  excellent: { emoji: "😊", label: "Excellent", color: "text-emerald-400" },
};

const calculateSleepHours = (bedTime: string, wakeTime: string): number => {
  const [bedHour, bedMin] = bedTime.split(":").map(Number);
  const [wakeHour, wakeMin] = wakeTime.split(":").map(Number);
  
  let bedMinutes = bedHour * 60 + bedMin;
  let wakeMinutes = wakeHour * 60 + wakeMin;
  
  // If wake time is before bed time, assume next day
  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60;
  }
  
  const diffMinutes = wakeMinutes - bedMinutes;
  return Math.round((diffMinutes / 60) * 10) / 10; // Round to 1 decimal
};

export const SleepTracker = ({ userId, onLog }: SleepTrackerProps) => {
  const [bedTime, setBedTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepHours, setSleepHours] = useState(8);
  const [thoughts, setThoughts] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<{
    quality: string;
    mood: string;
    insight: string;
  } | null>(null);
  const { toast } = useToast();

  // Auto-calculate sleep hours when times change
  useEffect(() => {
    const hours = calculateSleepHours(bedTime, wakeTime);
    setSleepHours(hours);
  }, [bedTime, wakeTime]);

  const analyzeThoughts = async () => {
    if (!thoughts.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-sleep-thoughts", {
        body: { thoughts, sleepHours, bedTime, wakeTime },
      });

      if (error) throw error;

      setMoodAnalysis(data);
    } catch (error) {
      console.error("Error analyzing thoughts:", error);
      // Fallback to local analysis
      const hasNegative = /stress|anxious|worried|can't sleep|tired|bad|nightmare/i.test(thoughts);
      const hasPositive = /peaceful|calm|relaxed|good|great|happy|excited/i.test(thoughts);
      
      setMoodAnalysis({
        quality: hasNegative ? "fair" : hasPositive ? "excellent" : "good",
        mood: hasNegative ? "Restless" : hasPositive ? "Peaceful" : "Neutral",
        insight: hasNegative 
          ? "Your thoughts suggest some stress. Try relaxation techniques before bed."
          : hasPositive 
          ? "Great mindset! Positive thoughts contribute to better sleep quality."
          : "Your sleep notes have been recorded for tracking patterns over time.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLog = async () => {
    setIsLogging(true);
    try {
      const quality = moodAnalysis?.quality || "good";
      
      const { error } = await supabase.from("sleep_logs").insert({
        user_id: userId,
        log_date: format(new Date(), "yyyy-MM-dd"),
        sleep_hours: sleepHours,
        sleep_quality: quality,
        bed_time: bedTime,
        wake_time: wakeTime,
        notes: thoughts || null,
      });

      if (error) throw error;

      toast({
        title: "Sleep logged! 🌙",
        description: `${sleepHours} hours of ${quality} sleep recorded`,
      });
      
      // Reset form
      setThoughts("");
      setMoodAnalysis(null);
      onLog();
    } catch (error) {
      console.error("Error logging sleep:", error);
      toast({
        title: "Error",
        description: "Failed to log sleep",
        variant: "destructive",
      });
    } finally {
      setIsLogging(false);
    }
  };

  const qualityInfo = moodAnalysis?.quality 
    ? QUALITY_EMOJIS[moodAnalysis.quality as keyof typeof QUALITY_EMOJIS] 
    : null;

  return (
    <Card className="p-4 border-border">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <Moon className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h3 className="font-semibold">Sleep Tracker</h3>
          <p className="text-sm text-muted-foreground">Log your sleep & thoughts</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Bed and wake time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm flex items-center gap-1">
              <Sunset className="w-3 h-3 text-orange-400" /> Bed Time
            </Label>
            <Input
              type="time"
              value={bedTime}
              onChange={(e) => setBedTime(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm flex items-center gap-1">
              <Sunrise className="w-3 h-3 text-yellow-400" /> Wake Time
            </Label>
            <Input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Calculated sleep duration */}
        <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sleep Duration</span>
            <span className="text-2xl font-bold text-purple-400">{sleepHours}h</span>
          </div>
          <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all"
              style={{ width: `${Math.min((sleepHours / 9) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {sleepHours >= 7 ? "✨ Good amount of sleep!" : sleepHours >= 5 ? "⚠️ Could use more rest" : "😴 Not enough sleep"}
          </p>
        </div>

        {/* Night thoughts */}
        <div>
          <Label className="text-sm flex items-center gap-1">
            <Brain className="w-3 h-3 text-purple-400" /> Night Thoughts (optional)
          </Label>
          <Textarea
            placeholder="How did you feel before bed? Any dreams, worries, or thoughts? AI will analyze your mood..."
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            className="mt-1 min-h-[80px] resize-none"
          />
          {thoughts.trim() && !moodAnalysis && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={analyzeThoughts}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-2" />
                  Analyze Mood with AI
                </>
              )}
            </Button>
          )}
        </div>

        {/* AI Analysis Result */}
        {moodAnalysis && (
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium">AI Sleep Analysis</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <span className="text-2xl">{qualityInfo?.emoji}</span>
                <span className={`text-sm font-medium ${qualityInfo?.color}`}>
                  {qualityInfo?.label} Quality
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="text-sm text-muted-foreground">
                Mood: <span className="text-foreground">{moodAnalysis.mood}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{moodAnalysis.insight}</p>
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleLog}
          disabled={isLogging}
        >
          {isLogging ? "Logging..." : "Log Sleep"}
        </Button>
      </div>
    </Card>
  );
};
