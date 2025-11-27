import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const PlanAdjustment = () => {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [adjustment, setAdjustment] = useState<any>(null);

  const quickReasons = [
    { label: "Missed Workout", value: "missed_workout" },
    { label: "Not Gaining Weight", value: "not_gaining_weight" },
    { label: "Not Losing Weight", value: "not_losing_weight" },
    { label: "Too Hungry", value: "too_hungry" },
    { label: "Too Full", value: "too_full" },
    { label: "Low Energy", value: "low_energy" },
  ];

  const handleAdjust = async (quickReason?: string) => {
    const adjustReason = quickReason || reason;
    if (!adjustReason.trim()) {
      toast.error("Please describe why you need an adjustment");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('adjust-plan', {
        body: { 
          reason: adjustReason,
          context: {}
        }
      });

      if (error) throw error;

      setAdjustment(data.adjustment);
      setReason("");
      toast.success("Plan adjusted successfully!");
    } catch (error: any) {
      console.error('Error adjusting plan:', error);
      toast.error(error.message || 'Failed to adjust plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Adjust Your Plan</h3>
            <p className="text-sm text-muted-foreground">
              Tell me what's not working, I'll help optimize
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Quick Adjustments</label>
            <div className="grid grid-cols-2 gap-2">
              {quickReasons.map((item) => (
                <Button
                  key={item.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdjust(item.value)}
                  disabled={isLoading}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Or describe your situation</label>
            <Textarea
              placeholder="e.g., I missed gym 3 days this week because of work, need to adjust schedule..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button 
            onClick={() => handleAdjust()}
            disabled={isLoading || !reason.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adjusting Plan...
              </>
            ) : (
              'Get Plan Adjustment'
            )}
          </Button>
        </div>
      </Card>

      {adjustment && (
        <Card className="p-6 border-border shadow-card bg-secondary/5">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Plan Adjustment
          </h4>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Summary:</p>
              <p className="text-sm text-muted-foreground">{adjustment.adjustment_summary}</p>
            </div>

            {(adjustment.calorie_adjustment || adjustment.protein_adjustment) && (
              <div className="p-3 bg-background rounded-lg">
                <p className="text-sm font-medium mb-2">Nutrition Updates:</p>
                {adjustment.calorie_adjustment && (
                  <p className="text-sm">Calories: <span className="font-semibold text-primary">{adjustment.calorie_adjustment}</span></p>
                )}
                {adjustment.protein_adjustment && (
                  <p className="text-sm">Protein: <span className="font-semibold text-secondary">{adjustment.protein_adjustment}g</span></p>
                )}
              </div>
            )}

            {adjustment.workout_adjustments?.notes && (
              <div className="p-3 bg-background rounded-lg">
                <p className="text-sm font-medium mb-1">Workout Changes:</p>
                <p className="text-sm text-muted-foreground">{adjustment.workout_adjustments.notes}</p>
              </div>
            )}

            {adjustment.diet_adjustments?.meal_swaps?.length > 0 && (
              <div className="p-3 bg-background rounded-lg">
                <p className="text-sm font-medium mb-2">Meal Swaps:</p>
                {adjustment.diet_adjustments.meal_swaps.map((swap: any, idx: number) => (
                  <p key={idx} className="text-sm text-muted-foreground">
                    Replace <span className="line-through">{swap.from}</span> with <span className="font-medium">{swap.to}</span>
                  </p>
                ))}
              </div>
            )}

            {adjustment.recommendations && (
              <div>
                <p className="text-sm font-medium mb-2">Recommendations:</p>
                <ul className="space-y-1">
                  {adjustment.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
