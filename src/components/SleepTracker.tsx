import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Moon, Sunrise, Sunset } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SleepTrackerProps {
  userId: string;
  onLog: () => void;
}

const QUALITY_OPTIONS = [
  { value: "poor", label: "Poor 😴", emoji: "😴" },
  { value: "fair", label: "Fair 😐", emoji: "😐" },
  { value: "good", label: "Good 🙂", emoji: "🙂" },
  { value: "excellent", label: "Excellent 😊", emoji: "😊" },
];

export const SleepTracker = ({ userId, onLog }: SleepTrackerProps) => {
  const [sleepHours, setSleepHours] = useState("7");
  const [quality, setQuality] = useState("good");
  const [bedTime, setBedTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [isLogging, setIsLogging] = useState(false);
  const { toast } = useToast();

  const handleLog = async () => {
    const hours = parseFloat(sleepHours);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      toast({
        title: "Invalid hours",
        description: "Please enter a valid number of hours (0-24)",
        variant: "destructive",
      });
      return;
    }

    setIsLogging(true);
    try {
      const { error } = await supabase.from("sleep_logs").insert({
        user_id: userId,
        log_date: format(new Date(), "yyyy-MM-dd"),
        sleep_hours: hours,
        sleep_quality: quality,
        bed_time: bedTime,
        wake_time: wakeTime,
      });

      if (error) throw error;

      toast({
        title: "Sleep logged! 🌙",
        description: `${hours} hours of ${quality} sleep recorded`,
      });
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

  return (
    <Card className="p-4 border-border">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <Moon className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h3 className="font-semibold">Sleep Tracker</h3>
          <p className="text-sm text-muted-foreground">Log your sleep</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Sleep hours slider */}
        <div>
          <Label className="text-sm">Hours of Sleep</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className="w-20"
            />
            <span className="text-muted-foreground">hours</span>
          </div>
        </div>

        {/* Bed and wake time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm flex items-center gap-1">
              <Sunset className="w-3 h-3" /> Bed Time
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
              <Sunrise className="w-3 h-3" /> Wake Time
            </Label>
            <Input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Sleep quality */}
        <div>
          <Label className="text-sm">Sleep Quality</Label>
          <Select value={quality} onValueChange={setQuality}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUALITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
