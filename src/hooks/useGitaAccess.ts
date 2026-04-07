import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useGitaAccess = (userId: string | undefined) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const check = async () => {
      const { data } = await supabase
        .from("gita_access")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      setHasAccess(!!data);
      setLoading(false);
    };

    check();
  }, [userId]);

  return { hasAccess, loading };
};
