import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingData } from "./OnboardingForm";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, Loader2, Sparkles, Utensils, Clock, Flame, Beef } from "lucide-react";

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
  breakdown?: Record<string, number>;
  improvements?: string[];
}

interface CheatMealAdjustment {
  type: "cheat_meal_adjustment";
  estimated_extra_calories?: number;
  weekly_adjustment?: string;
  message: string;
}

const QUICK_PROMPTS = [
  "What should I eat today?",
  "Calculate my macros",
  "I had pizza for dinner",
  "Give me a high-protein breakfast",
  "Am I eating enough protein?",
];

const MealCard = ({ meal }: { meal: Meal }) => {
  const totalCalories = meal.meal_calories || meal.items.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = meal.meal_protein || meal.items.reduce((sum, item) => sum + item.protein_g, 0);

  return (
    <Card className="p-4 bg-card/50 border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Utensils className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium capitalize">{meal.meal_type}</p>
            {meal.time && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {meal.time}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">
            <Flame className="w-3 h-3 mr-1" /> {totalCalories} kcal
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Beef className="w-3 h-3 mr-1" /> {totalProtein}g
          </Badge>
        </div>
      </div>
      <ul className="space-y-2">
        {meal.items.map((item, idx) => (
          <li key={idx} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
            <span className="text-foreground">
              {item.name}
              {item.quantity && <span className="text-muted-foreground ml-1">({item.quantity})</span>}
            </span>
            <span className="text-muted-foreground text-xs">
              {item.calories} kcal · {item.protein_g}g protein
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

const DailyNutritionCard = ({ data }: { data: DailyNutrition }) => (
  <div className="space-y-4">
    <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-0">
      <p className="text-sm text-muted-foreground mb-2">Daily Targets for {data.date}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{data.total_calories}</p>
          <p className="text-xs text-muted-foreground">Calories</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary-foreground">{data.total_protein}g</p>
          <p className="text-xs text-muted-foreground">Protein</p>
        </div>
        {data.total_carbs && (
          <div className="text-center">
            <p className="text-2xl font-bold text-accent-foreground">{data.total_carbs}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
        )}
        {data.total_fats && (
          <div className="text-center">
            <p className="text-2xl font-bold text-muted-foreground">{data.total_fats}g</p>
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

const NutritionTargetsCard = ({ data }: { data: NutritionTargets }) => (
  <Card className="p-4 border-border">
    <div className="flex items-center gap-2 mb-4">
      <Badge className="capitalize">{data.goal}</Badge>
      <span className="text-sm text-muted-foreground">Goal</span>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
      <div className="text-center p-3 bg-primary/10 rounded-lg">
        <p className="text-2xl font-bold text-primary">{data.calories}</p>
        <p className="text-xs text-muted-foreground">Daily Calories</p>
      </div>
      <div className="text-center p-3 bg-secondary/10 rounded-lg">
        <p className="text-2xl font-bold">{data.macros.protein_g}g</p>
        <p className="text-xs text-muted-foreground">Protein</p>
      </div>
      <div className="text-center p-3 bg-accent/10 rounded-lg">
        <p className="text-2xl font-bold">{data.macros.carbs_g}g</p>
        <p className="text-xs text-muted-foreground">Carbs</p>
      </div>
      <div className="text-center p-3 bg-muted rounded-lg">
        <p className="text-2xl font-bold">{data.macros.fats_g}g</p>
        <p className="text-xs text-muted-foreground">Fats</p>
      </div>
    </div>
    {data.calculation_steps && data.calculation_steps.length > 0 && (
      <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
        <p className="font-medium mb-2">How we calculated this:</p>
        {data.calculation_steps.map((step, idx) => (
          <p key={idx}>• {step}</p>
        ))}
      </div>
    )}
  </Card>
);

const FoodQualityCard = ({ data }: { data: FoodQuality }) => (
  <Card className="p-4 border-border">
    <div className="flex items-center gap-4 mb-4">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
        data.score >= 80 ? 'bg-green-500/20 text-green-500' :
        data.score >= 60 ? 'bg-yellow-500/20 text-yellow-500' :
        'bg-red-500/20 text-red-500'
      }`}>
        {data.score}
      </div>
      <div>
        <p className="font-semibold">Food Quality Score</p>
        <p className="text-sm text-muted-foreground">
          {data.score >= 80 ? 'Excellent!' : data.score >= 60 ? 'Good, room for improvement' : 'Needs attention'}
        </p>
      </div>
    </div>
    {data.improvements && data.improvements.length > 0 && (
      <div className="space-y-2">
        <p className="text-sm font-medium">Suggestions:</p>
        {data.improvements.map((item, idx) => (
          <p key={idx} className="text-sm text-muted-foreground">• {item}</p>
        ))}
      </div>
    )}
  </Card>
);

const CheatMealCard = ({ data }: { data: CheatMealAdjustment }) => (
  <Card className="p-4 border-border bg-gradient-to-r from-orange-500/10 to-yellow-500/10">
    <p className="font-medium mb-2">🍕 Cheat Meal Logged</p>
    {data.estimated_extra_calories && (
      <p className="text-sm text-muted-foreground mb-2">
        Estimated extra: <span className="font-medium">{data.estimated_extra_calories} kcal</span>
      </p>
    )}
    {data.weekly_adjustment && (
      <p className="text-sm text-muted-foreground mb-2">Adjustment: {data.weekly_adjustment}</p>
    )}
    <p className="text-sm">{data.message}</p>
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
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const json = JSON.parse(jsonMatch[0]);
        const textAfterJson = content.replace(jsonMatch[0], "").trim();

        // Render appropriate card based on type
        let cardContent = null;
        if (json.type === "daily_nutrition" && json.meals) {
          cardContent = <DailyNutritionCard data={json as DailyNutrition} />;
        } else if (json.type === "nutrition_targets" && json.macros) {
          cardContent = <NutritionTargetsCard data={json as NutritionTargets} />;
        } else if (json.type === "food_quality" && typeof json.score === "number") {
          cardContent = <FoodQualityCard data={json as FoodQuality} />;
        } else if (json.type === "cheat_meal_adjustment") {
          cardContent = <CheatMealCard data={json as CheatMealAdjustment} />;
        }

        if (cardContent) {
          return (
            <div className="space-y-3">
              {cardContent}
              {textAfterJson && (
                <p className="text-sm text-foreground mt-3">{textAfterJson}</p>
              )}
            </div>
          );
        }
      } catch {
        // Not valid JSON, render as text
      }
    }
    return <p className="text-sm whitespace-pre-wrap">{content}</p>;
  };

  return (
    <Card className="flex flex-col h-[600px] border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Nutrition AI Coach</h3>
            <p className="text-xs text-muted-foreground">
              Ask about meals, macros, or get personalized advice
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Bot className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              Hi! I'm your nutrition coach. Ask me anything about your diet,
              macros, or meal planning.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(prompt)}
                  className="text-xs"
                >
                  {prompt}
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
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground p-3"
                      : "bg-transparent"
                  }`}
                >
                  {message.role === "assistant"
                    ? formatMessage(message.content)
                    : <p className="text-sm">{message.content}</p>}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about nutrition, meals, or macros..."
            className="min-h-[44px] max-h-[120px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};
