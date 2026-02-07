import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  Target,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  Camera,
  Utensils,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  format,
  startOfWeek,
  addWeeks,
  differenceInWeeks,
  parseISO,
  addDays,
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CommitmentsPageProps {
  userId: string;
}

interface WeeklyProgress {
  currentWeek: number;
  totalWeeks: number;
  thisWeekCount: number;
  overallProgress: number;
  weeklyResults: boolean[];
}

interface Commitment {
  id: string;
  user_id: string;
  type: "workouts_per_week" | "checkins_per_week" | "meals_logged_per_week";
  target_value: number;
  duration_weeks: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  progress?: WeeklyProgress;
}

const commitmentTypes = [
  { value: "workouts_per_week", label: "Workouts per Week", icon: Dumbbell, color: "primary" },
  { value: "checkins_per_week", label: "Check-ins per Week", icon: Camera, color: "secondary" },
  { value: "meals_logged_per_week", label: "Meals Logged per Week", icon: Utensils, color: "accent" },
];

// Map commitment type to table/column info
const TYPE_TABLE_MAP: Record<string, { table: string; dateColumn: string }> = {
  workouts_per_week: { table: "workout_logs", dateColumn: "workout_date" },
  checkins_per_week: { table: "gym_checkins", dateColumn: "date" },
  meals_logged_per_week: { table: "meal_logs", dateColumn: "meal_date" },
};

export const CommitmentsPage = ({ userId }: CommitmentsPageProps) => {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newType, setNewType] = useState<string>("workouts_per_week");
  const [newTarget, setNewTarget] = useState("3");
  const [newDuration, setNewDuration] = useState("4");

  useEffect(() => {
    loadCommitments();
  }, [userId]);

  const loadCommitments = async () => {
    try {
      const { data, error } = await supabase
        .from("commitments")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const raw = data || [];
      // Batch-calculate progress for all commitments
      const withProgress = await calculateAllProgress(raw);
      setCommitments(withProgress as Commitment[]);
    } catch (error) {
      console.error("Error loading commitments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Optimized: fetch ALL relevant rows in one query per table,
   * then compute weekly counts in-memory.
   */
  const calculateAllProgress = async (commitmentsList: Commitment[]) => {
    if (commitmentsList.length === 0) return [];

    // Find the earliest start date across all commitments
    const earliest = commitmentsList.reduce((min, c) => (c.start_date < min ? c.start_date : min), commitmentsList[0].start_date);
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");

    // Fetch all data we need in 3 parallel queries (one per table type used)
    const usedTypes = [...new Set(commitmentsList.map((c) => c.type))];
    const dataByType: Record<string, string[]> = {};

    // Fetch data per type with typed queries
    const fetchDates = async (type: string): Promise<string[]> => {
      const { dateColumn } = TYPE_TABLE_MAP[type];
      let dates: string[] = [];

      if (type === "workouts_per_week") {
        const { data, error } = await supabase
          .from("workout_logs")
          .select("workout_date")
          .eq("user_id", userId)
          .gte("workout_date", earliest)
          .lte("workout_date", todayStr);
        if (!error && data) dates = data.map((r) => r.workout_date);
      } else if (type === "checkins_per_week") {
        const { data, error } = await supabase
          .from("gym_checkins")
          .select("date")
          .eq("user_id", userId)
          .gte("date", earliest)
          .lte("date", todayStr);
        if (!error && data) dates = data.map((r) => r.date);
      } else {
        const { data, error } = await supabase
          .from("meal_logs")
          .select("meal_date")
          .eq("user_id", userId)
          .gte("meal_date", earliest)
          .lte("meal_date", todayStr);
        if (!error && data) dates = data.map((r) => r.meal_date);
      }
      return dates;
    };

    await Promise.all(
      usedTypes.map(async (type) => {
        dataByType[type] = await fetchDates(type);
      })
    );

    // Now compute progress per commitment in-memory
    return commitmentsList.map((commitment) => {
      const dates = dataByType[commitment.type] || [];
      const startDate = parseISO(commitment.start_date);
      const currentWeek = Math.min(
        differenceInWeeks(now, startDate) + 1,
        commitment.duration_weeks
      );

      const weeklyResults: boolean[] = [];
      for (let i = 0; i < currentWeek; i++) {
        const wStart = addWeeks(startDate, i);
        const wEnd = addDays(wStart, 6);
        const wStartStr = format(wStart, "yyyy-MM-dd");
        const wEndStr = format(wEnd, "yyyy-MM-dd");
        const count = dates.filter((d) => d >= wStartStr && d <= wEndStr).length;
        weeklyResults.push(count >= commitment.target_value);
      }

      // This week count
      const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
      const thisWeekStartStr = format(thisWeekStart, "yyyy-MM-dd");
      const thisWeekEndStr = format(addDays(thisWeekStart, 6), "yyyy-MM-dd");
      const thisWeekCount = dates.filter((d) => d >= thisWeekStartStr && d <= thisWeekEndStr).length;

      const successfulWeeks = weeklyResults.filter(Boolean).length;
      const overallProgress = Math.round((successfulWeeks / commitment.duration_weeks) * 100);

      return {
        ...commitment,
        progress: { currentWeek, totalWeeks: commitment.duration_weeks, thisWeekCount, overallProgress, weeklyResults },
      };
    });
  };

  const createCommitment = async () => {
    setIsCreating(true);
    try {
      const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      const endDate = addWeeks(startDate, parseInt(newDuration));

      const { error } = await supabase.from("commitments").insert([{
        user_id: userId,
        type: newType as Commitment["type"],
        target_value: parseInt(newTarget),
        duration_weeks: parseInt(newDuration),
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
      }]);

      if (error) throw error;

      setDialogOpen(false);
      setNewType("workouts_per_week");
      setNewTarget("3");
      setNewDuration("4");
      await loadCommitments();
      toast.success("Commitment created! Let's crush it! 💪");
    } catch (error) {
      console.error("Error creating commitment:", error);
      toast.error("Failed to create commitment");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteCommitment = async (id: string) => {
    try {
      await supabase.from("commitments").delete().eq("id", id);
      setCommitments(commitments.filter((c) => c.id !== id));
      toast.success("Commitment removed");
    } catch (error) {
      console.error("Error deleting commitment:", error);
      toast.error("Failed to remove commitment");
    }
  };

  const getTypeConfig = (type: string) =>
    commitmentTypes.find((t) => t.value === type) || commitmentTypes[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Commitment Goals</h2>
          <p className="text-muted-foreground">Set weekly targets and track your consistency.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />New Goal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Commitment</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Goal Type</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {commitmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />{type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target per Week</Label>
                <Input type="number" min="1" max="21" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Duration (weeks)</Label>
                <Select value={newDuration} onValueChange={setNewDuration}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 weeks</SelectItem>
                    <SelectItem value="4">4 weeks</SelectItem>
                    <SelectItem value="6">6 weeks</SelectItem>
                    <SelectItem value="8">8 weeks</SelectItem>
                    <SelectItem value="12">12 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-4">
                <Button onClick={createCommitment} disabled={isCreating} className="w-full">
                  {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Target className="w-4 h-4 mr-2" />}
                  Create Commitment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {commitments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {commitments.map((commitment) => {
            const config = getTypeConfig(commitment.type);
            const Icon = config.icon;
            const progress = commitment.progress;
            const isOnTrack = progress && progress.thisWeekCount >= commitment.target_value;

            return (
              <Card key={commitment.id} className="p-6 border-border shadow-card relative">
                <Button
                  variant="ghost" size="icon"
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteCommitment(commitment.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full bg-${config.color}/10 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${config.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{config.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {commitment.target_value}x per week for {commitment.duration_weeks} weeks
                    </p>
                  </div>
                </div>
                {progress && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">This Week</span>
                        <span className="text-sm">Week {progress.currentWeek} of {progress.totalWeeks}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={(progress.thisWeekCount / commitment.target_value) * 100} className="flex-1" />
                        <span className="text-sm font-bold">{progress.thisWeekCount}/{commitment.target_value}</span>
                        {isOnTrack ? <CheckCircle2 className="w-5 h-5 text-accent" /> : <AlertCircle className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      {!isOnTrack && progress.thisWeekCount > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {commitment.target_value - progress.thisWeekCount} more to go this week!
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Weekly Progress</p>
                      <div className="flex gap-1">
                        {Array.from({ length: progress.totalWeeks }).map((_, i) => {
                          const result = progress.weeklyResults[i];
                          const isCurrent = i === progress.currentWeek - 1;
                          const isFuture = i >= progress.currentWeek;
                          return (
                            <div
                              key={i}
                              className={`w-full h-3 rounded-sm transition-colors ${
                                isFuture ? "bg-muted" : result ? "bg-accent" : "bg-destructive/30"
                              } ${isCurrent ? "ring-2 ring-primary" : ""}`}
                              title={`Week ${i + 1}${result !== undefined ? (result ? " ✓" : " ✗") : ""}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Overall Success Rate</span>
                      <span className="font-bold">{progress.overallProgress}%</span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground border-border shadow-card">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No active commitments</p>
          <p className="text-sm mt-1">Create a commitment to stay accountable to your goals!</p>
        </Card>
      )}
    </div>
  );
};

export default CommitmentsPage;
