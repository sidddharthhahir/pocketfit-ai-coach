import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const todayISO = () => new Date().toISOString().slice(0, 10);

export const useRestDay = (userId: string | undefined) => {
  const [isRestDay, setIsRestDay] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("rest_days")
      .select("id")
      .eq("user_id", userId)
      .eq("rest_date", todayISO())
      .maybeSingle();
    setIsRestDay(!!data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleRestDay = useCallback(async () => {
    if (!userId) return;
    if (isRestDay) {
      await supabase
        .from("rest_days")
        .delete()
        .eq("user_id", userId)
        .eq("rest_date", todayISO());
      setIsRestDay(false);
    } else {
      await supabase
        .from("rest_days")
        .insert({ user_id: userId, rest_date: todayISO(), reason: "Planned recovery" });
      setIsRestDay(true);
    }
  }, [isRestDay, userId]);

  return { isRestDay, loading, toggleRestDay, refresh };
};
