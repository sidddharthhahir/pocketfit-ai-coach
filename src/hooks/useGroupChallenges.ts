import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GroupChallenge {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  challenge_type: string;
  target_per_day: number;
  duration_days: number;
  start_date: string;
  invite_code: string;
  created_at: string;
}

export interface ChallengeMember {
  id: string;
  challenge_id: string;
  user_id: string;
  display_name: string | null;
  joined_at: string;
}

export interface ChallengeCheckin {
  id: string;
  challenge_id: string;
  user_id: string;
  day_date: string;
  value: number;
  note: string | null;
}

export const useMyChallenges = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["challenges", "mine", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: memberships, error: e1 } = await supabase
        .from("challenge_members")
        .select("challenge_id")
        .eq("user_id", userId!);
      if (e1) throw e1;
      const ids = (memberships || []).map((m) => m.challenge_id);
      if (!ids.length) return [] as GroupChallenge[];
      const { data, error } = await supabase
        .from("group_challenges")
        .select("*")
        .in("id", ids)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as GroupChallenge[];
    },
  });
};

export const useChallenge = (challengeId: string | undefined) => {
  return useQuery({
    queryKey: ["challenge", challengeId],
    enabled: !!challengeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_challenges")
        .select("*")
        .eq("id", challengeId!)
        .maybeSingle();
      if (error) throw error;
      return data as GroupChallenge | null;
    },
  });
};

export const useChallengeMembers = (challengeId: string | undefined) => {
  return useQuery({
    queryKey: ["challenge-members", challengeId],
    enabled: !!challengeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenge_members")
        .select("*")
        .eq("challenge_id", challengeId!);
      if (error) throw error;
      return (data || []) as ChallengeMember[];
    },
  });
};

export const useChallengeCheckins = (challengeId: string | undefined) => {
  return useQuery({
    queryKey: ["challenge-checkins", challengeId],
    enabled: !!challengeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenge_checkins")
        .select("*")
        .eq("challenge_id", challengeId!)
        .order("day_date", { ascending: false });
      if (error) throw error;
      return (data || []) as ChallengeCheckin[];
    },
  });
};

export const useCreateChallenge = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      challenge_type?: string;
      target_per_day?: number;
      duration_days?: number;
      start_date?: string;
      display_name?: string;
    }) => {
      const { data: ch, error } = await supabase
        .from("group_challenges")
        .insert({
          owner_id: userId,
          name: input.name,
          description: input.description ?? null,
          challenge_type: input.challenge_type ?? "custom",
          target_per_day: input.target_per_day ?? 1,
          duration_days: input.duration_days ?? 30,
          start_date: input.start_date ?? new Date().toISOString().slice(0, 10),
        })
        .select()
        .single();
      if (error) throw error;
      const { error: jErr } = await supabase
        .from("challenge_members")
        .insert({ challenge_id: ch.id, user_id: userId, display_name: input.display_name ?? null });
      if (jErr) throw jErr;
      return ch as GroupChallenge;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges"] }),
  });
};

export const useJoinChallenge = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { invite_code: string; display_name?: string }) => {
      const { data: ch, error } = await supabase
        .from("group_challenges")
        .select("*")
        .eq("invite_code", input.invite_code.trim().toLowerCase())
        .maybeSingle();
      if (error) throw error;
      if (!ch) throw new Error("Invite code not found");
      const { error: jErr } = await supabase
        .from("challenge_members")
        .upsert(
          { challenge_id: ch.id, user_id: userId, display_name: input.display_name ?? null },
          { onConflict: "challenge_id,user_id" },
        );
      if (jErr) throw jErr;
      return ch as GroupChallenge;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges"] }),
  });
};

export const useCheckIn = (challengeId: string, userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { value?: number; note?: string }) => {
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase
        .from("challenge_checkins")
        .upsert(
          {
            challenge_id: challengeId,
            user_id: userId,
            day_date: today,
            value: input.value ?? 1,
            note: input.note ?? null,
          },
          { onConflict: "challenge_id,user_id,day_date" },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenge-checkins", challengeId] }),
  });
};

export const useLeaveChallenge = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (challengeId: string) => {
      const { error } = await supabase
        .from("challenge_members")
        .delete()
        .eq("challenge_id", challengeId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges"] }),
  });
};
