import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useGitaBookmarks = (userId: string) => {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const key = (ch: number, v: number) => `${ch}:${v}`;

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("gita_bookmarks")
        .select("chapter, verse")
        .eq("user_id", userId);

      if (data) {
        setBookmarks(new Set(data.map((b) => key(b.chapter, b.verse))));
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  const isBookmarked = (ch: number, v: number) => bookmarks.has(key(ch, v));

  const toggleBookmark = async (ch: number, v: number) => {
    const k = key(ch, v);
    if (bookmarks.has(k)) {
      await supabase
        .from("gita_bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("chapter", ch)
        .eq("verse", v);
      setBookmarks((prev) => {
        const next = new Set(prev);
        next.delete(k);
        return next;
      });
    } else {
      await supabase
        .from("gita_bookmarks")
        .insert({ user_id: userId, chapter: ch, verse: v });
      setBookmarks((prev) => new Set(prev).add(k));
    }
  };

  return { bookmarks, isBookmarked, toggleBookmark, loading };
};
