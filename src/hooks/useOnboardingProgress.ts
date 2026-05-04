import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OnboardingStep {
  key: string;
  label: string;
  done: boolean;
}

export const useOnboardingProgress = (userId: string) => {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [profile, plan, meal, workout, water, sleep] = await Promise.all([
        supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle(),
        supabase.from("fitness_plans").select("id").eq("user_id", userId).limit(1).maybeSingle(),
        supabase.from("meal_logs").select("id").eq("user_id", userId).limit(1).maybeSingle(),
        supabase.from("workout_logs").select("id").eq("user_id", userId).limit(1).maybeSingle(),
        supabase.from("water_logs").select("id").eq("user_id", userId).limit(1).maybeSingle(),
        supabase.from("sleep_logs").select("id").eq("user_id", userId).limit(1).maybeSingle(),
      ]);

      setSteps([
        { key: "profile", label: "Complete profile", done: !!profile.data },
        { key: "plan", label: "Generate fitness plan", done: !!plan.data },
        { key: "meal", label: "Log first meal", done: !!meal.data },
        { key: "workout", label: "Log first workout", done: !!workout.data },
        { key: "water", label: "Log water", done: !!water.data },
        { key: "sleep", label: "Log sleep", done: !!sleep.data },
      ]);
      setLoading(false);
    };
    load();
  }, [userId]);

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return { steps, completed, total, percent, loading };
};
