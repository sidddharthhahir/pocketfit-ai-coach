import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BodyMeasurement {
  id: string;
  log_date: string;
  waist_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  left_arm_cm: number | null;
  right_arm_cm: number | null;
  left_thigh_cm: number | null;
  right_thigh_cm: number | null;
  neck_cm: number | null;
  notes: string | null;
}

export type NewMeasurement = Omit<BodyMeasurement, "id">;

export const useBodyMeasurements = (userId: string) => {
  const [data, setData] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: rows } = await supabase
      .from("body_measurements")
      .select("*")
      .eq("user_id", userId)
      .order("log_date", { ascending: false })
      .limit(50);
    setData((rows as BodyMeasurement[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = async (m: NewMeasurement) => {
    const { error } = await supabase
      .from("body_measurements")
      .insert({ ...m, user_id: userId });
    if (!error) await refresh();
    return error;
  };

  const remove = async (id: string) => {
    await supabase.from("body_measurements").delete().eq("id", id);
    await refresh();
  };

  return { data, loading, add, remove, refresh };
};
