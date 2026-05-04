import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Circle, Sparkles } from "lucide-react";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";

interface Props {
  userId: string;
}

export const OnboardingProgress = ({ userId }: Props) => {
  const { steps, percent, completed, total, loading } =
    useOnboardingProgress(userId);

  if (loading) return null;
  if (percent === 100) return null;

  return (
    <Card className="p-5 glass-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Getting started</h3>
        </div>
        <span className="text-sm font-semibold text-primary">
          {completed}/{total}
        </span>
      </div>
      <Progress value={percent} className="h-2" />
      <p className="text-xs text-muted-foreground">
        You're {percent}% set up. Finish these to unlock the full experience.
      </p>
      <div className="space-y-1.5">
        {steps.map((s) => (
          <div
            key={s.key}
            className="flex items-center gap-2 text-sm"
          >
            {s.done ? (
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <span
              className={
                s.done
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
