import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ListTodo, Plus, Check, Pause, X, Moon, Sparkles, 
  Loader2, CloudMoon, Sunrise
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, isToday, startOfDay, subDays } from "date-fns";

interface TomorrowListProps {
  userId: string;
  sleepQuality?: string;
  mood?: string;
}

interface Task {
  id: string;
  task_text: string;
  task_date: string;
  status: "pending" | "done" | "moved" | "skipped";
  created_at: string;
  sleep_quality_context: string | null;
  mood_context: string | null;
}

interface WeeklyInsight {
  message: string;
  type: "pattern" | "encouragement" | "observation";
}

export const TomorrowList = ({ userId, sleepQuality, mood }: TomorrowListProps) => {
  const [tasks, setTasks] = useState<string[]>(["", "", ""]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [hasPendingForTomorrow, setHasPendingForTomorrow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [weeklyInsight, setWeeklyInsight] = useState<WeeklyInsight | null>(null);
  const [showClosureMessage, setShowClosureMessage] = useState(false);
  const { toast } = useToast();

  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  useEffect(() => {
    fetchTasks();
    checkWeeklyInsight();
  }, [userId]);

  const fetchTasks = async () => {
    try {
      // Fetch today's tasks (created yesterday for today)
      const { data: todayData, error: todayError } = await supabase
        .from("tomorrow_tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("task_date", today)
        .order("created_at", { ascending: true });

      if (todayError) throw todayError;
      setTodayTasks((todayData as Task[]) || []);

      // Check if there are pending tasks for tomorrow already
      const { data: tomorrowData, error: tomorrowError } = await supabase
        .from("tomorrow_tasks")
        .select("id")
        .eq("user_id", userId)
        .eq("task_date", tomorrow)
        .eq("status", "pending");

      if (tomorrowError) throw tomorrowError;
      setHasPendingForTomorrow((tomorrowData?.length || 0) > 0);

      // Check if we should show closure message (end of day with completed tasks)
      const hour = new Date().getHours();
      if (hour >= 20 && todayData && todayData.length > 0) {
        setShowClosureMessage(true);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkWeeklyInsight = async () => {
    try {
      const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("tomorrow_tasks")
        .select("*")
        .eq("user_id", userId)
        .gte("task_date", weekAgo)
        .order("task_date", { ascending: true });

      if (error || !data || data.length < 5) return;

      // Generate gentle insight based on patterns
      const completed = data.filter(t => t.status === "done").length;
      const skipped = data.filter(t => t.status === "skipped").length;
      const moved = data.filter(t => t.status === "moved").length;
      const total = data.length;

      // Tasks with low sleep quality context
      const lowSleepTasks = data.filter(t => 
        t.sleep_quality_context && ["poor", "fair"].includes(t.sleep_quality_context)
      );
      const lowSleepCompleted = lowSleepTasks.filter(t => t.status === "done").length;

      let insight: WeeklyInsight | null = null;

      if (skipped > 0 && skipped >= completed * 0.3) {
        insight = {
          message: "You often choose rest when your body needs it — that's not failure.",
          type: "encouragement"
        };
      } else if (lowSleepTasks.length > 2 && lowSleepCompleted < lowSleepTasks.length * 0.5) {
        insight = {
          message: "On low-sleep days, you tend to postpone mentally demanding tasks.",
          type: "pattern"
        };
      } else if (moved > completed * 0.5) {
        insight = {
          message: "Moving tasks forward is a form of self-care, not procrastination.",
          type: "encouragement"
        };
      } else if (completed > total * 0.7) {
        insight = {
          message: "You've been showing up consistently. Your future self thanks you.",
          type: "observation"
        };
      }

      setWeeklyInsight(insight);
    } catch (error) {
      console.error("Error checking weekly insight:", error);
    }
  };

  const handleSaveTasks = async () => {
    const validTasks = tasks.filter(t => t.trim().length > 0);
    if (validTasks.length === 0) return;

    setIsSaving(true);
    try {
      const tasksToInsert = validTasks.map(task => ({
        user_id: userId,
        task_text: task.trim(),
        task_date: tomorrow,
        status: "pending",
        sleep_quality_context: sleepQuality || null,
        mood_context: mood || null,
      }));

      const { error } = await supabase
        .from("tomorrow_tasks")
        .insert(tasksToInsert);

      if (error) throw error;

      toast({
        title: "Tasks saved for tomorrow 🌙",
        description: "Rest easy — your mind is clear now.",
      });

      setTasks(["", "", ""]);
      setHasPendingForTomorrow(true);
    } catch (error) {
      console.error("Error saving tasks:", error);
      toast({
        title: "Error",
        description: "Failed to save tasks",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: "done" | "moved" | "skipped") => {
    try {
      const { error } = await supabase
        .from("tomorrow_tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;

      setTodayTasks(prev => 
        prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      );

      if (newStatus === "done") {
        toast({ title: "Done ✨", description: "Nice work." });
      } else if (newStatus === "moved") {
        // Create a copy for tomorrow
        const task = todayTasks.find(t => t.id === taskId);
        if (task) {
          await supabase.from("tomorrow_tasks").insert({
            user_id: userId,
            task_text: task.task_text,
            task_date: tomorrow,
            status: "pending",
          });
        }
        toast({ title: "Moved to tomorrow", description: "No rush." });
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const updateTaskText = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value.slice(0, 100); // Max 100 chars
    setTasks(newTasks);
  };

  if (isLoading) {
    return (
      <Card className="p-4 border-border">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  // Night closure message
  if (showClosureMessage && todayTasks.length > 0) {
    const allResolved = todayTasks.every(t => t.status !== "pending");
    if (allResolved) {
      return (
        <Card className="p-6 border-border bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto">
              <CloudMoon className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-lg font-medium text-foreground">
              You showed up enough today.
            </p>
            <p className="text-sm text-muted-foreground">
              Tomorrow can be adjusted.
            </p>
          </div>
        </Card>
      );
    }
  }

  // Today's tasks review (morning/day view)
  if (todayTasks.length > 0 && todayTasks.some(t => t.status === "pending")) {
    return (
      <Card className="p-4 border-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Sunrise className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold">Yesterday's List</h3>
            <p className="text-sm text-muted-foreground">A gentle check-in</p>
          </div>
        </div>

        <div className="space-y-3">
          {todayTasks.map((task) => (
            <div 
              key={task.id} 
              className={`p-3 rounded-lg border transition-all ${
                task.status === "pending" 
                  ? "border-border bg-card" 
                  : task.status === "done"
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : task.status === "moved"
                  ? "border-amber-500/20 bg-amber-500/5"
                  : "border-muted bg-muted/30"
              }`}
            >
              <p className={`text-sm mb-2 ${
                task.status !== "pending" ? "text-muted-foreground" : "text-foreground"
              }`}>
                {task.task_text}
              </p>
              
              {task.status === "pending" ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                    onClick={() => handleUpdateStatus(task.id, "done")}
                  >
                    <Check className="w-3 h-3 mr-1" /> Done
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/50"
                    onClick={() => handleUpdateStatus(task.id, "moved")}
                  >
                    <Pause className="w-3 h-3 mr-1" /> Later
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs border-muted-foreground/30 hover:bg-muted/50"
                    onClick={() => handleUpdateStatus(task.id, "skipped")}
                  >
                    <X className="w-3 h-3 mr-1" /> Skip
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {task.status === "done" && <Check className="w-3 h-3 text-emerald-500" />}
                  {task.status === "moved" && <Pause className="w-3 h-3 text-amber-500" />}
                  {task.status === "skipped" && <X className="w-3 h-3" />}
                  <span className="capitalize">{task.status}</span>
                </div>
              )}

              {task.status === "skipped" && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  That's okay. Some days are heavier than others.
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Weekly Insight */}
        {weeklyInsight && (
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-500/10">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{weeklyInsight.message}</p>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // Night flow - Add tomorrow tasks
  if (!hasPendingForTomorrow) {
    return (
      <Card className="p-4 border-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <ListTodo className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="font-semibold">Tomorrow List</h3>
            <p className="text-sm text-muted-foreground">
              Put it here so your mind doesn't need to hold it tonight.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div key={index} className="relative">
              <Input
                placeholder={`Task ${index + 1} (optional)`}
                value={task}
                onChange={(e) => updateTaskText(index, e.target.value)}
                className="pr-12"
                maxLength={100}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {task.length}/100
              </span>
            </div>
          ))}
        </div>

        <Button
          className="w-full mt-4"
          onClick={handleSaveTasks}
          disabled={isSaving || tasks.every(t => !t.trim())}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-2" />
              Save for Tomorrow
            </>
          )}
        </Button>

        {/* Weekly Insight */}
        {weeklyInsight && (
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-500/10">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{weeklyInsight.message}</p>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // Tasks already saved for tomorrow
  return (
    <Card className="p-4 border-border">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <Moon className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <h3 className="font-semibold">Tomorrow List</h3>
          <p className="text-sm text-muted-foreground">Your list is ready for tomorrow</p>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 text-center">
        <CloudMoon className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Your mind can rest now. <br />
          Tomorrow's tasks are saved safely.
        </p>
      </div>

      {/* Weekly Insight */}
      {weeklyInsight && (
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-500/10">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{weeklyInsight.message}</p>
          </div>
        </div>
      )}
    </Card>
  );
};
