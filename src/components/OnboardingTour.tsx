import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, X, ArrowRight } from "lucide-react";

const STORAGE_KEY = "boomstart-tour-v1";

interface Step {
  title: string;
  body: string;
  emoji: string;
}

const steps: Step[] = [
  {
    emoji: "🍽️",
    title: "Log your first meal",
    body: "Open Nutrition from the nav. Snap a photo or type — AI estimates calories & protein in seconds.",
  },
  {
    emoji: "🏋️",
    title: "Log your first workout",
    body: "Go to Workouts → tap a session → mark sets done. Your streak starts the moment you log.",
  },
  {
    emoji: "📖",
    title: "Read today's verse",
    body: "Visit the Gita tab for one verse a day with meaning, reflection, and a journal — calm wins.",
  },
  {
    emoji: "📊",
    title: "Track your progress",
    body: "Progress shows weight trends and weekly AI insights. Profile shows how your plan adapts.",
  },
];

export const OnboardingTour = () => {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  if (!open) return null;
  const step = steps[idx];
  const isLast = idx === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md glass-card rounded-2xl p-6 space-y-4 border border-primary/30 shadow-2xl shadow-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Welcome to BoomStartAI
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={close}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-5xl">{step.emoji}</div>
        <h2 className="text-2xl font-bold">{step.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.body}
        </p>

        <div className="flex items-center gap-1.5 pt-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === idx
                  ? "w-6 bg-primary"
                  : i < idx
                  ? "w-1.5 bg-primary/60"
                  : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={close}>
            Skip tour
          </Button>
          <Button
            size="sm"
            onClick={() => (isLast ? close() : setIdx(idx + 1))}
          >
            {isLast ? "Got it" : "Next"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
