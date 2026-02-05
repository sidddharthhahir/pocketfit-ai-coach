import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Timer, Plus, Pencil, Trash2, PartyPopper, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format, differenceInSeconds, addYears, setYear } from "date-fns";

interface Countdown {
  id: string;
  user_id: string;
  type: string;
  title: string;
  target_time: string;
  status: string;
  is_recurring: boolean;
  icon: string;
  created_at: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const COUNTDOWN_TYPES = [
  { value: "workout", label: "Workout", icon: "🏋️" },
  { value: "birthday", label: "Birthday", icon: "🎂" },
  { value: "new_year", label: "New Year", icon: "🎆" },
  { value: "event", label: "Event", icon: "🎉" },
  { value: "goal", label: "Goal", icon: "🎯" },
  { value: "trip", label: "Trip", icon: "✈️" },
  { value: "exam", label: "Exam/Deadline", icon: "🎓" },
  { value: "anniversary", label: "Anniversary", icon: "💍" },
  { value: "custom", label: "Custom", icon: "⏳" },
];

const EMOJI_OPTIONS = ["🎂", "🎉", "✈️", "🎓", "💍", "🏆", "🏋️", "🎆", "🎯", "💪", "🌟", "❤️", "🚀", "📅", "⏳"];

const LifeCountdowns = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCountdown, setEditingCountdown] = useState<Countdown | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, TimeRemaining>>({});

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState("event");
  const [formDateTime, setFormDateTime] = useState("");
  const [formIcon, setFormIcon] = useState("🎉");
  const [formIsRecurring, setFormIsRecurring] = useState(false);

  // Fetch all countdowns
  const { data: countdowns = [], isLoading } = useQuery({
    queryKey: ["all-countdowns", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("countdowns")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("target_time", { ascending: true });

      if (error) throw error;
      return data as Countdown[];
    },
    enabled: !!user?.id,
  });

  // Create countdown
  const createCountdown = useMutation({
    mutationFn: async (countdown: { title: string; type: string; target_time: string; icon: string; is_recurring: boolean; status: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("countdowns")
        .insert({
          user_id: user.id,
          title: countdown.title,
          type: countdown.type,
          target_time: countdown.target_time,
          icon: countdown.icon,
          is_recurring: countdown.is_recurring,
          status: countdown.status,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-countdowns"] });
      queryClient.invalidateQueries({ queryKey: ["active-countdown"] });
      resetForm();
      setIsAddOpen(false);
      toast({ title: "Countdown created!", description: "Your countdown is now active." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create countdown.", variant: "destructive" });
    },
  });

  // Update countdown
  const updateCountdown = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Countdown> }) => {
      const { data, error } = await supabase
        .from("countdowns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-countdowns"] });
      queryClient.invalidateQueries({ queryKey: ["active-countdown"] });
      resetForm();
      setEditingCountdown(null);
      toast({ title: "Countdown updated!" });
    },
  });

  // Delete countdown
  const deleteCountdown = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("countdowns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-countdowns"] });
      queryClient.invalidateQueries({ queryKey: ["active-countdown"] });
      toast({ title: "Countdown deleted" });
    },
  });

  // Reset recurring countdowns
  const resetRecurringCountdown = useCallback(async (countdown: Countdown) => {
    if (!countdown.is_recurring) return;

    const now = new Date();
    let newTargetTime: Date;

    if (countdown.type === "new_year") {
      newTargetTime = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
    } else if (countdown.type === "birthday" || countdown.type === "anniversary") {
      const originalDate = new Date(countdown.target_time);
      newTargetTime = setYear(originalDate, now.getFullYear());
      if (newTargetTime <= now) {
        newTargetTime = addYears(newTargetTime, 1);
      }
    } else {
      newTargetTime = addYears(new Date(countdown.target_time), 1);
    }

    await updateCountdown.mutateAsync({
      id: countdown.id,
      updates: { target_time: newTargetTime.toISOString() },
    });
  }, [updateCountdown]);

  // Calculate time remaining for all countdowns
  useEffect(() => {
    const calculateAllTimeRemaining = () => {
      const newTimeRemaining: Record<string, TimeRemaining> = {};

      countdowns.forEach((countdown) => {
        const now = new Date().getTime();
        const target = new Date(countdown.target_time).getTime();
        const difference = target - now;

        if (difference <= 0) {
          newTimeRemaining[countdown.id] = { days: 0, hours: 0, minutes: 0, seconds: 0, total: difference };
          // Auto-reset recurring countdowns
          if (countdown.is_recurring && difference < -86400000) { // Past by more than 1 day
            resetRecurringCountdown(countdown);
          }
        } else {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          newTimeRemaining[countdown.id] = { days, hours, minutes, seconds, total: difference };
        }
      });

      setTimeRemaining(newTimeRemaining);
    };

    calculateAllTimeRemaining();
    const interval = setInterval(calculateAllTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [countdowns, resetRecurringCountdown]);

  const resetForm = () => {
    setFormTitle("");
    setFormType("event");
    setFormDateTime("");
    setFormIcon("🎉");
    setFormIsRecurring(false);
  };

  const handleSubmit = () => {
    if (!formTitle.trim() || !formDateTime) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const typeInfo = COUNTDOWN_TYPES.find((t) => t.value === formType);
    const isRecurring = formType === "birthday" || formType === "new_year" || formType === "anniversary" || formIsRecurring;

    if (editingCountdown) {
      updateCountdown.mutate({
        id: editingCountdown.id,
        updates: {
          title: formTitle,
          type: formType,
          target_time: formDateTime,
          icon: formIcon || typeInfo?.icon || "⏳",
          is_recurring: isRecurring,
        },
      });
    } else {
      createCountdown.mutate({
        title: formTitle,
        type: formType,
        target_time: formDateTime,
        icon: formIcon || typeInfo?.icon || "⏳",
        is_recurring: isRecurring,
        status: "active",
      });
    }
  };

  const openEdit = (countdown: Countdown) => {
    setEditingCountdown(countdown);
    setFormTitle(countdown.title);
    setFormType(countdown.type);
    setFormDateTime(format(new Date(countdown.target_time), "yyyy-MM-dd'T'HH:mm"));
    setFormIcon(countdown.icon || "⏳");
    setFormIsRecurring(countdown.is_recurring);
    setIsAddOpen(true);
  };

  const handleTypeChange = (type: string) => {
    setFormType(type);
    const typeInfo = COUNTDOWN_TYPES.find((t) => t.value === type);
    if (typeInfo) {
      setFormIcon(typeInfo.icon);
    }
    // Auto-set recurring for certain types
    if (type === "birthday" || type === "new_year" || type === "anniversary") {
      setFormIsRecurring(true);
    }
  };

  const formatTimeDisplay = (time: TimeRemaining) => {
    if (time.days > 0) {
      return `${time.days}d ${time.hours}h ${time.minutes}m`;
    }
    return `${String(time.hours).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 flex items-center justify-center">
          <Clock className="h-5 w-5 animate-pulse text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            Your Countdowns
          </CardTitle>
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) {
              resetForm();
              setEditingCountdown(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCountdown ? "Edit Countdown" : "Create Countdown"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Event Name</Label>
                  <Input
                    placeholder="e.g. Mom's Birthday, Trip to Paris"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formType} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTDOWN_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formDateTime}
                    onChange={(e) => setFormDateTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormIcon(emoji)}
                        className={`text-2xl p-2 rounded-lg transition-all ${
                          formIcon === emoji
                            ? "bg-primary/20 ring-2 ring-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={formIsRecurring}
                    onChange={(e) => setFormIsRecurring(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="recurring" className="text-sm text-muted-foreground">
                    Repeat yearly (auto-reset after event)
                  </Label>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={createCountdown.isPending || updateCountdown.isPending}
                >
                  {editingCountdown ? "Update Countdown" : "Create Countdown"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {countdowns.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No countdowns yet. Add your first one!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {countdowns.map((countdown) => {
              const time = timeRemaining[countdown.id];
              const isPast = time && time.total <= 0;
              const isUrgent = time && time.total > 0 && time.total < 86400000; // Under 24 hours

              return (
                <div
                  key={countdown.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isPast
                      ? "bg-primary/10 border-primary/30"
                      : isUrgent
                      ? "bg-accent/10 border-accent/30 animate-pulse"
                      : "bg-muted/30 border-border/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{countdown.icon || "⏳"}</span>
                      <div>
                        <p className="font-medium text-sm">{countdown.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(countdown.target_time), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => openEdit(countdown)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteCountdown.mutate(countdown.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {time && (
                    <div className="mt-2">
                      {isPast ? (
                        <div className="flex items-center gap-1 text-primary">
                          <PartyPopper className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {countdown.is_recurring ? "Resetting..." : "Happening now!"}
                          </span>
                        </div>
                      ) : (
                        <p className={`text-lg font-bold tabular-nums ${isUrgent ? "text-accent" : "text-foreground"}`}>
                          {formatTimeDisplay(time)}
                        </p>
                      )}
                    </div>
                  )}

                  {countdown.is_recurring && (
                    <p className="text-xs text-muted-foreground mt-1">🔄 Yearly</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LifeCountdowns;
