import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingData } from "./OnboardingForm";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, Bot, User, Loader2, Sparkles, Utensils, Clock, Flame, Beef, 
  Droplets, TrendingUp, AlertCircle, Lightbulb, Apple, Pill, RefreshCw,
  ChevronRight, Zap, Target, Award, Heart
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface NutritionChatProps {
  userData: OnboardingData;
}

interface MealItem {
  name: string;
  quantity?: string;
  calories: number;
  protein_g: number;
  carbs_g?: number;
  fats_g?: number;
}

interface Meal {
  meal_type: string;
  time?: string;
  items: MealItem[];
  meal_calories?: number;
  meal_protein?: number;
}

interface DailyNutrition {
  type: "daily_nutrition";
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs?: number;
  total_fats?: number;
  meals: Meal[];
}

interface NutritionTargets {
  type: "nutrition_targets";
  goal: string;
  calories: number;
  macros: {
    protein_g: number;
    carbs_g: number;
    fats_g: number;
  };
  calculation_steps?: string[];
}

interface FoodQuality {
  type: "food_quality";
  score: number;
  breakdown?: {
    whole_food_ratio?: number;
    fiber_score?: number;
    sugar_control?: number;
    protein_distribution?: number;
    processed_food_penalty?: number;
  };
  improvements?: string[];
}

interface CheatMealAdjustment {
  type: "cheat_meal_adjustment";
  cheat_meal_logged?: boolean;
  estimated_extra_calories?: number;
  weekly_adjustment?: string;
  message: string;
}

interface Micronutrients {
  type: "micronutrients";
  possible_gaps: string[];
  food_suggestions: Record<string, string[]>;
  note?: string;
}

interface MealTiming {
  type: "meal_timing";
  training_day: boolean;
  recommendations: string[];
}

interface Hydration {
  type: "hydration";
  daily_water_liters: number;
  adjustments?: string[];
  reminders?: string[];
}

interface Supplements {
  type: "supplements";
  recommended: Array<{
    name: string;
    dose: string;
    timing: string;
    why: string;
  }>;
  optional?: string[];
  not_needed?: string[];
}

interface FoodSwaps {
  type: "food_swaps";
  original_food: string;
  healthier_alternatives: Array<{
    swap: string;
    calorie_saving: number;
    protein_change: string;
  }>;
}

interface NutritionInsights {
  type: "nutrition_insights";
  avg_calories: number;
  avg_protein: number;
  hydration_consistency: string;
  food_quality_avg: number;
  top_issues: string[];
  suggestions: string[];
}

const QUICK_PROMPTS = [
  { label: "Today's Meals", icon: Utensils, prompt: "What should I eat today?" },
  { label: "My Macros", icon: Target, prompt: "Calculate my macros" },
  { label: "Log Cheat Meal", icon: Apple, prompt: "I had pizza for dinner" },
  { label: "High Protein", icon: Beef, prompt: "Give me a high-protein breakfast" },
  { label: "Food Quality", icon: Award, prompt: "Rate my current diet quality" },
  { label: "Hydration", icon: Droplets, prompt: "How much water should I drink?" },
];

// Meal Card Component
const MealCard = ({ meal }: { meal: Meal }) => {
  const totalCalories = meal.meal_calories || meal.items.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = meal.meal_protein || meal.items.reduce((sum, item) => sum + item.protein_g, 0);
  const mealIcons: Record<string, string> = {
    breakfast: "🌅",
    lunch: "☀️",
    dinner: "🌙",
    snack: "🍎",
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-card to-muted/30 border-border/50 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg">
            {mealIcons[meal.meal_type.toLowerCase()] || "🍽️"}
          </div>
          <div>
            <p className="font-semibold capitalize text-foreground">{meal.meal_type}</p>
            {meal.time && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {meal.time}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-primary/15 text-primary border-0 font-medium">
            <Flame className="w-3 h-3 mr-1" /> {totalCalories} kcal
          </Badge>
          <Badge variant="outline" className="font-medium border-primary/30">
            <Beef className="w-3 h-3 mr-1" /> {totalProtein}g
          </Badge>
        </div>
      </div>
      <div className="space-y-2 mt-3">
        {meal.items.map((item, idx) => (
          <div 
            key={idx} 
            className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
          >
            <span className="text-foreground font-medium">
              {item.name}
              {item.quantity && <span className="text-muted-foreground font-normal ml-1">({item.quantity})</span>}
            </span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" /> {item.calories}
              </span>
              <span className="flex items-center gap-1">
                <Beef className="w-3 h-3 text-red-500" /> {item.protein_g}g
              </span>
              {item.carbs_g !== undefined && (
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-500" /> {item.carbs_g}g
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Daily Nutrition Card Component
const DailyNutritionCard = ({ data }: { data: DailyNutrition }) => (
  <div className="space-y-4">
    <Card className="p-5 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Daily Nutrition Plan</p>
          <p className="text-xs text-muted-foreground">{data.date || "Today"}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-3 rounded-xl bg-background/60 backdrop-blur">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{data.total_calories}</p>
          <p className="text-xs text-muted-foreground">Calories</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-background/60 backdrop-blur">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Beef className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{data.total_protein}g</p>
          <p className="text-xs text-muted-foreground">Protein</p>
        </div>
        {data.total_carbs !== undefined && (
          <div className="text-center p-3 rounded-xl bg-background/60 backdrop-blur">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{data.total_carbs}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
        )}
        {data.total_fats !== undefined && (
          <div className="text-center p-3 rounded-xl bg-background/60 backdrop-blur">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart className="w-4 h-4 text-pink-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{data.total_fats}g</p>
            <p className="text-xs text-muted-foreground">Fats</p>
          </div>
        )}
      </div>
    </Card>
    <div className="space-y-3">
      {data.meals.map((meal, idx) => (
        <MealCard key={idx} meal={meal} />
      ))}
    </div>
  </div>
);

// Nutrition Targets Card Component
const NutritionTargetsCard = ({ data }: { data: NutritionTargets }) => {
  const goalColors: Record<string, string> = {
    bulk: "from-green-500/20 to-emerald-500/10 border-green-500/30",
    cut: "from-red-500/20 to-orange-500/10 border-red-500/30",
    maintain: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
  };
  const goalEmoji: Record<string, string> = {
    bulk: "💪",
    cut: "🔥",
    maintain: "⚖️",
  };

  return (
    <Card className={`p-5 bg-gradient-to-br ${goalColors[data.goal.toLowerCase()] || goalColors.maintain} border`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center text-2xl">
          {goalEmoji[data.goal.toLowerCase()] || "🎯"}
        </div>
        <div>
          <p className="font-semibold text-lg capitalize text-foreground">{data.goal} Mode</p>
          <p className="text-sm text-muted-foreground">Your personalized targets</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="text-center p-4 bg-background/70 rounded-xl backdrop-blur">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{data.calories}</p>
          <p className="text-xs text-muted-foreground">Daily Calories</p>
        </div>
        <div className="text-center p-4 bg-background/70 rounded-xl backdrop-blur">
          <Beef className="w-5 h-5 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{data.macros.protein_g}g</p>
          <p className="text-xs text-muted-foreground">Protein</p>
        </div>
        <div className="text-center p-4 bg-background/70 rounded-xl backdrop-blur">
          <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{data.macros.carbs_g}g</p>
          <p className="text-xs text-muted-foreground">Carbs</p>
        </div>
        <div className="text-center p-4 bg-background/70 rounded-xl backdrop-blur">
          <Heart className="w-5 h-5 text-pink-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{data.macros.fats_g}g</p>
          <p className="text-xs text-muted-foreground">Fats</p>
        </div>
      </div>
      
      {data.calculation_steps && data.calculation_steps.length > 0 && (
        <div className="p-4 bg-background/50 rounded-xl backdrop-blur">
          <p className="font-medium text-sm mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            How we calculated this
          </p>
          <div className="space-y-2">
            {data.calculation_steps.map((step, idx) => (
              <p key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                {step}
              </p>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// Food Quality Card Component
const FoodQualityCard = ({ data }: { data: FoodQuality }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: "from-green-500/20 to-emerald-500/10", text: "text-green-500", ring: "ring-green-500/30" };
    if (score >= 60) return { bg: "from-yellow-500/20 to-orange-500/10", text: "text-yellow-500", ring: "ring-yellow-500/30" };
    return { bg: "from-red-500/20 to-rose-500/10", text: "text-red-500", ring: "ring-red-500/30" };
  };
  
  const colors = getScoreColor(data.score);

  return (
    <Card className={`p-5 bg-gradient-to-br ${colors.bg} border-0`}>
      <div className="flex items-center gap-4 mb-5">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold ${colors.text} ring-4 ${colors.ring} bg-background/80`}>
          {data.score}
        </div>
        <div>
          <p className="font-semibold text-lg text-foreground">Food Quality Score</p>
          <p className="text-sm text-muted-foreground">
            {data.score >= 80 ? "🌟 Excellent nutrition!" : data.score >= 60 ? "👍 Good, room to grow" : "💡 Let's improve together"}
          </p>
        </div>
      </div>
      
      {data.breakdown && Object.keys(data.breakdown).length > 0 && (
        <div className="space-y-3 mb-5">
          {Object.entries(data.breakdown).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-medium text-foreground">{value}%</span>
              </div>
              <Progress value={value} className="h-2" />
            </div>
          ))}
        </div>
      )}
      
      {data.improvements && data.improvements.length > 0 && (
        <div className="p-4 bg-background/50 rounded-xl">
          <p className="font-medium text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Ways to Improve
          </p>
          <div className="space-y-2">
            {data.improvements.map((item, idx) => (
              <p key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                {item}
              </p>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// Cheat Meal Card Component
const CheatMealCard = ({ data }: { data: CheatMealAdjustment }) => (
  <Card className="p-5 bg-gradient-to-br from-orange-500/15 via-yellow-500/10 to-transparent border-orange-500/20">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl">
        🍕
      </div>
      <div>
        <p className="font-semibold text-lg text-foreground">Cheat Meal Logged</p>
        <p className="text-sm text-muted-foreground">No guilt, just balance!</p>
      </div>
    </div>
    
    {data.estimated_extra_calories && (
      <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg mb-3">
        <Flame className="w-5 h-5 text-orange-500" />
        <div>
          <p className="text-sm text-muted-foreground">Estimated extra</p>
          <p className="font-semibold text-foreground">{data.estimated_extra_calories} kcal</p>
        </div>
      </div>
    )}
    
    {data.weekly_adjustment && (
      <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg mb-3">
        <RefreshCw className="w-5 h-5 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">Weekly adjustment</p>
          <p className="font-medium text-foreground">{data.weekly_adjustment}</p>
        </div>
      </div>
    )}
    
    <p className="text-sm text-foreground p-3 bg-primary/5 rounded-lg">{data.message}</p>
  </Card>
);

// Micronutrients Card Component
const MicronutrientsCard = ({ data }: { data: Micronutrients }) => (
  <Card className="p-5 bg-gradient-to-br from-purple-500/15 via-violet-500/10 to-transparent border-purple-500/20">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">
        🧬
      </div>
      <div>
        <p className="font-semibold text-lg text-foreground">Micronutrient Insights</p>
        <p className="text-sm text-muted-foreground">Potential gaps to address</p>
      </div>
    </div>
    
    {data.possible_gaps.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        {data.possible_gaps.map((gap, idx) => (
          <Badge key={idx} variant="outline" className="capitalize border-purple-500/30 text-purple-400">
            <AlertCircle className="w-3 h-3 mr-1" />
            {gap}
          </Badge>
        ))}
      </div>
    )}
    
    {Object.keys(data.food_suggestions).length > 0 && (
      <div className="space-y-3">
        {Object.entries(data.food_suggestions).map(([nutrient, foods]) => (
          <div key={nutrient} className="p-3 bg-background/50 rounded-lg">
            <p className="font-medium text-sm capitalize text-foreground mb-2">{nutrient} sources:</p>
            <p className="text-sm text-muted-foreground">{foods.join(", ")}</p>
          </div>
        ))}
      </div>
    )}
    
    {data.note && (
      <p className="text-sm text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg">{data.note}</p>
    )}
  </Card>
);

// Meal Timing Card Component
const MealTimingCard = ({ data }: { data: MealTiming }) => (
  <Card className="p-5 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent border-cyan-500/20">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-2xl">
        ⏰
      </div>
      <div>
        <p className="font-semibold text-lg text-foreground">Meal Timing</p>
        <Badge className={data.training_day ? "bg-green-500/20 text-green-500 border-0" : "bg-muted text-muted-foreground border-0"}>
          {data.training_day ? "Training Day" : "Rest Day"}
        </Badge>
      </div>
    </div>
    
    <div className="space-y-2">
      {data.recommendations.map((rec, idx) => (
        <div key={idx} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
          <Clock className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">{rec}</p>
        </div>
      ))}
    </div>
  </Card>
);

// Hydration Card Component
const HydrationCard = ({ data }: { data: Hydration }) => (
  <Card className="p-5 bg-gradient-to-br from-blue-500/15 via-sky-500/10 to-transparent border-blue-500/20">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">
        💧
      </div>
      <div>
        <p className="font-semibold text-lg text-foreground">Hydration Goals</p>
        <p className="text-sm text-muted-foreground">Stay hydrated for peak performance</p>
      </div>
    </div>
    
    <div className="text-center p-4 bg-background/50 rounded-xl mb-4">
      <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-2" />
      <p className="text-3xl font-bold text-foreground">{data.daily_water_liters}L</p>
      <p className="text-sm text-muted-foreground">Daily water target</p>
    </div>
    
    {data.adjustments && data.adjustments.length > 0 && (
      <div className="space-y-2 mb-3">
        {data.adjustments.map((adj, idx) => (
          <p key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
            <ChevronRight className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
            {adj}
          </p>
        ))}
      </div>
    )}
    
    {data.reminders && data.reminders.length > 0 && (
      <div className="p-3 bg-blue-500/10 rounded-lg">
        <p className="font-medium text-sm mb-2 text-foreground">💡 Reminders</p>
        {data.reminders.map((rem, idx) => (
          <p key={idx} className="text-sm text-muted-foreground">{rem}</p>
        ))}
      </div>
    )}
  </Card>
);

// Supplements Card Component
const SupplementsCard = ({ data }: { data: Supplements }) => (
  <Card className="p-5 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-500/20">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl">
        💊
      </div>
      <div>
        <p className="font-semibold text-lg text-foreground">Supplement Guide</p>
        <p className="text-sm text-muted-foreground">Safe, evidence-based options</p>
      </div>
    </div>
    
    {data.recommended.length > 0 && (
      <div className="space-y-3 mb-4">
        {data.recommended.map((supp, idx) => (
          <div key={idx} className="p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="w-4 h-4 text-emerald-500" />
              <p className="font-medium text-foreground">{supp.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <p><span className="text-foreground">Dose:</span> {supp.dose}</p>
              <p><span className="text-foreground">When:</span> {supp.timing}</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{supp.why}</p>
          </div>
        ))}
      </div>
    )}
    
    {data.optional && data.optional.length > 0 && (
      <div className="p-3 bg-muted/30 rounded-lg">
        <p className="font-medium text-sm mb-2 text-foreground">Optional</p>
        <p className="text-sm text-muted-foreground">{data.optional.join(", ")}</p>
      </div>
    )}
  </Card>
);

// Food Swaps Card Component
const FoodSwapsCard = ({ data }: { data: FoodSwaps }) => (
  <Card className="p-5 bg-gradient-to-br from-lime-500/15 via-green-500/10 to-transparent border-lime-500/20">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl bg-lime-500/20 flex items-center justify-center text-2xl">
        🔄
      </div>
      <div>
        <p className="font-semibold text-lg text-foreground">Smart Food Swaps</p>
        <p className="text-sm text-muted-foreground">Healthier alternatives for: <span className="text-foreground font-medium">{data.original_food}</span></p>
      </div>
    </div>
    
    <div className="space-y-2">
      {data.healthier_alternatives.map((alt, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
          <span className="font-medium text-foreground">{alt.swap}</span>
          <div className="flex gap-2">
            <Badge className="bg-green-500/20 text-green-500 border-0">
              -{alt.calorie_saving} kcal
            </Badge>
            <Badge variant="outline" className="border-primary/30">
              {alt.protein_change} protein
            </Badge>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

// Nutrition Insights Card Component
const NutritionInsightsCard = ({ data }: { data: NutritionInsights }) => (
  <Card className="p-5 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent border-indigo-500/20">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-2xl">
        📊
      </div>
      <div>
        <p className="font-semibold text-lg text-foreground">Weekly Nutrition Insights</p>
        <p className="text-sm text-muted-foreground">Your performance summary</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      <div className="text-center p-3 bg-background/50 rounded-xl">
        <p className="text-xl font-bold text-foreground">{data.avg_calories}</p>
        <p className="text-xs text-muted-foreground">Avg Calories</p>
      </div>
      <div className="text-center p-3 bg-background/50 rounded-xl">
        <p className="text-xl font-bold text-foreground">{data.avg_protein}g</p>
        <p className="text-xs text-muted-foreground">Avg Protein</p>
      </div>
      <div className="text-center p-3 bg-background/50 rounded-xl">
        <p className={`text-xl font-bold ${data.hydration_consistency === 'high' ? 'text-green-500' : data.hydration_consistency === 'medium' ? 'text-yellow-500' : 'text-red-500'}`}>
          {data.hydration_consistency}
        </p>
        <p className="text-xs text-muted-foreground">Hydration</p>
      </div>
      <div className="text-center p-3 bg-background/50 rounded-xl">
        <p className="text-xl font-bold text-foreground">{data.food_quality_avg}</p>
        <p className="text-xs text-muted-foreground">Quality Score</p>
      </div>
    </div>
    
    {data.top_issues.length > 0 && (
      <div className="p-3 bg-red-500/10 rounded-lg mb-3">
        <p className="font-medium text-sm mb-2 flex items-center gap-2 text-foreground">
          <AlertCircle className="w-4 h-4 text-red-500" />
          Areas to Improve
        </p>
        {data.top_issues.map((issue, idx) => (
          <p key={idx} className="text-sm text-muted-foreground">• {issue}</p>
        ))}
      </div>
    )}
    
    {data.suggestions.length > 0 && (
      <div className="p-3 bg-green-500/10 rounded-lg">
        <p className="font-medium text-sm mb-2 flex items-center gap-2 text-foreground">
          <Lightbulb className="w-4 h-4 text-green-500" />
          Suggestions
        </p>
        {data.suggestions.map((sug, idx) => (
          <p key={idx} className="text-sm text-muted-foreground">• {sug}</p>
        ))}
      </div>
    )}
  </Card>
);

// Generic Text Response Card
const TextResponseCard = ({ text }: { text: string }) => (
  <Card className="p-4 bg-gradient-to-br from-muted/50 to-transparent border-border/50">
    <p className="text-sm text-foreground whitespace-pre-wrap">{text}</p>
  </Card>
);

export const NutritionChat = ({ userData }: NutritionChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("nutrition-ai", {
        body: {
          message: messageText,
          userData,
          conversationHistory: messages,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get response. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatMessage = (content: string) => {
    // Try to find and parse JSON in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const json = JSON.parse(jsonMatch[0]);
        // Get text before and after JSON, clean it up
        const beforeJson = content.substring(0, content.indexOf(jsonMatch[0])).trim();
        const afterJson = content.substring(content.indexOf(jsonMatch[0]) + jsonMatch[0].length).trim();
        
        // Filter out any remaining JSON-like strings or "json" text
        const cleanText = (text: string) => {
          return text
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .replace(/^\s*json\s*/gi, '')
            .trim();
        };
        
        const cleanedAfter = cleanText(afterJson);
        const cleanedBefore = cleanText(beforeJson);

        // Render appropriate card based on type
        let cardContent = null;
        
        switch (json.type) {
          case "daily_nutrition":
            if (json.meals) cardContent = <DailyNutritionCard data={json as DailyNutrition} />;
            break;
          case "nutrition_targets":
            if (json.macros) cardContent = <NutritionTargetsCard data={json as NutritionTargets} />;
            break;
          case "food_quality":
            if (typeof json.score === "number") cardContent = <FoodQualityCard data={json as FoodQuality} />;
            break;
          case "cheat_meal_adjustment":
            cardContent = <CheatMealCard data={json as CheatMealAdjustment} />;
            break;
          case "micronutrients":
            cardContent = <MicronutrientsCard data={json as Micronutrients} />;
            break;
          case "meal_timing":
            cardContent = <MealTimingCard data={json as MealTiming} />;
            break;
          case "hydration":
            cardContent = <HydrationCard data={json as Hydration} />;
            break;
          case "supplements":
            cardContent = <SupplementsCard data={json as Supplements} />;
            break;
          case "food_swaps":
            cardContent = <FoodSwapsCard data={json as FoodSwaps} />;
            break;
          case "nutrition_insights":
            cardContent = <NutritionInsightsCard data={json as NutritionInsights} />;
            break;
        }

        if (cardContent) {
          return (
            <div className="space-y-3">
              {cleanedBefore && <TextResponseCard text={cleanedBefore} />}
              {cardContent}
              {cleanedAfter && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-sm text-foreground flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {cleanedAfter}
                  </p>
                </div>
              )}
            </div>
          );
        }
      } catch {
        // Not valid JSON, render as text
      }
    }
    
    return <TextResponseCard text={content} />;
  };

  return (
    <Card className="flex flex-col h-[650px] border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Nutrition AI Coach</h3>
            <p className="text-xs text-muted-foreground">
              Personalized diet advice powered by AI
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Hey there! 👋</h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              I'm your personal nutrition coach. Ask me anything about your diet,
              macros, meal planning, or get personalized recommendations.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg">
              {QUICK_PROMPTS.map(({ label, icon: Icon, prompt }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(prompt)}
                  className="flex items-center gap-2 h-auto py-3 px-4 justify-start hover:bg-primary/5 hover:border-primary/30 transition-colors"
                >
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-sm"
                      : ""
                  }`}
                >
                  {message.role === "assistant"
                    ? formatMessage(message.content)
                    : <p className="text-sm">{message.content}</p>}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-2xl p-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-muted/30">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about nutrition, meals, or macros..."
            className="min-h-[48px] max-h-[120px] resize-none bg-background"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="h-[48px] w-[48px] shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};
