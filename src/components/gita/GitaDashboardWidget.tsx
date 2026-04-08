import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Flame, ArrowRight } from "lucide-react";
import { useGitaAccess } from "@/hooks/useGitaAccess";
import { CHAPTER_NAMES, TOTAL_VERSES } from "@/components/gita/constants";
import { useNavigate } from "react-router-dom";

interface GitaDashboardWidgetProps {
  userId: string;
}

export const GitaDashboardWidget = ({ userId }: GitaDashboardWidgetProps) => {
  const { hasAccess, loading: accessLoading } = useGitaAccess(userId);
  const [progress, setProgress] = useState<{
    current_chapter: number;
    current_verse: number;
    total_verses_read: number;
    current_streak: number;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasAccess) return;
    const load = async () => {
      const { data } = await supabase
        .from("gita_progress")
        .select("current_chapter, current_verse, total_verses_read, current_streak")
        .eq("user_id", userId)
        .maybeSingle();
      if (data) setProgress(data);
    };
    load();
  }, [userId, hasAccess]);

  if (accessLoading || !hasAccess || !progress) return null;

  const percent = Math.round((progress.total_verses_read / TOTAL_VERSES) * 100);

  return (
    <Card
      className="border-border/30 cursor-pointer hover:border-primary/20 transition-all duration-300 group"
      onClick={() => navigate("/gita")}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <p className="text-xs font-medium text-foreground">Gita Journey</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Ch. {progress.current_chapter} · V. {progress.current_verse}</span>
          <span className="text-[10px]">{CHAPTER_NAMES[progress.current_chapter - 1]}</span>
        </div>

        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/50 rounded-full transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{progress.total_verses_read} verses read</span>
          {progress.current_streak > 0 && (
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              {progress.current_streak} day streak
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
