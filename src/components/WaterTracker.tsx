import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface WaterTrackerProps {
  userId: string;
  todayTotal: number;
  dailyGoal: number;
  onLog: () => void;
}

const QUICK_AMOUNTS = [250, 500, 750, 1000];

export const WaterTracker = ({ userId, todayTotal, dailyGoal, onLog }: WaterTrackerProps) => {
  const [amount, setAmount] = useState(250);
  const [isLogging, setIsLogging] = useState(false);
  const { toast } = useToast();

  const handleLog = async () => {
    setIsLogging(true);
    try {
      const { error } = await supabase.from("water_logs").insert({
        user_id: userId,
        log_date: format(new Date(), "yyyy-MM-dd"),
        amount_ml: amount,
      });

      if (error) throw error;

      toast({
        title: "Water logged! 💧",
        description: `Added ${amount}ml to your daily intake`,
      });
      onLog();
    } catch (error) {
      console.error("Error logging water:", error);
      toast({
        title: "Error",
        description: "Failed to log water intake",
        variant: "destructive",
      });
    } finally {
      setIsLogging(false);
    }
  };

  const percentage = Math.min((todayTotal / dailyGoal) * 100, 100);

  return (
    <Card className="p-4 border-border">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Droplets className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="font-semibold">Water Intake</h3>
          <p className="text-sm text-muted-foreground">
            {todayTotal}ml / {dailyGoal}ml
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Quick add buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {QUICK_AMOUNTS.map((amt) => (
          <Button
            key={amt}
            variant={amount === amt ? "default" : "outline"}
            size="sm"
            onClick={() => setAmount(amt)}
            className="text-xs"
          >
            {amt}ml
          </Button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setAmount(Math.max(50, amount - 50))}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <div className="flex-1 text-center font-semibold">{amount}ml</div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setAmount(amount + 50)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Button
        className="w-full"
        onClick={handleLog}
        disabled={isLogging}
      >
        {isLogging ? "Logging..." : "Log Water"}
      </Button>
    </Card>
  );
};
