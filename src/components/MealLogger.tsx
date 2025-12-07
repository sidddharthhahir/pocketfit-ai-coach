import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Utensils, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { mealDescriptionSchema } from "@/lib/validationSchemas";

export const MealLogger = () => {
  const [mealDescription, setMealDescription] = useState("");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [isLoading, setIsLoading] = useState(false);
  const [lastLog, setLastLog] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLogMeal = async () => {
    // Clear previous error
    setValidationError(null);
    
    // Validate input with zod schema
    const result = mealDescriptionSchema.safeParse({ 
      mealDescription: mealDescription.trim(), 
      mealType 
    });
    
    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || "Invalid input";
      setValidationError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-meal', {
        body: { 
          mealDescription: result.data.mealDescription, 
          mealType: result.data.mealType 
        }
      });

      if (error) throw error;

      setLastLog(data.meal);
      setMealDescription("");
      toast.success("Meal logged successfully!");
    } catch (error: any) {
      console.error('Error logging meal:', error);
      toast.error(error.message || 'Failed to log meal');
    } finally {
      setIsLoading(false);
    }
  };

  const remainingChars = 500 - mealDescription.length;

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Log Your Meal</h3>
            <p className="text-sm text-muted-foreground">
              Describe what you ate, AI will calculate nutrition
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Meal Type</label>
            <Select value={mealType} onValueChange={(v) => setMealType(v as typeof mealType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">What did you eat?</label>
            <Textarea
              placeholder="e.g., 2 eggs, 2 slices whole wheat toast, 1 banana, black coffee"
              value={mealDescription}
              onChange={(e) => {
                setMealDescription(e.target.value);
                setValidationError(null);
              }}
              maxLength={500}
              rows={4}
              className={`resize-none ${validationError ? 'border-destructive' : ''}`}
            />
            <div className="flex justify-between mt-1">
              {validationError ? (
                <p className="text-sm text-destructive">{validationError}</p>
              ) : (
                <span />
              )}
              <p className={`text-xs ${remainingChars < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {remainingChars} characters remaining
              </p>
            </div>
          </div>

          <Button 
            onClick={handleLogMeal} 
            disabled={isLoading || mealDescription.trim().length < 3}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Log Meal'
            )}
          </Button>
        </div>
      </Card>

      {lastLog && (
        <Card className="p-6 border-border shadow-card bg-accent/5">
          <h4 className="font-semibold mb-4">Last Logged Meal</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground">Total Calories</p>
              <p className="text-2xl font-bold text-primary">{lastLog.meal_total_cal}</p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground">Total Protein</p>
              <p className="text-2xl font-bold text-secondary">{lastLog.meal_total_protein}g</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Items:</p>
            {lastLog.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm p-2 bg-background rounded">
                <span>{item.name}</span>
                <span className="text-muted-foreground">
                  {item.estimated_cal} cal | {item.estimated_protein_g}g protein
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Confidence: {(lastLog.confidence_overall * 100).toFixed(0)}%
          </p>
        </Card>
      )}
    </div>
  );
};
