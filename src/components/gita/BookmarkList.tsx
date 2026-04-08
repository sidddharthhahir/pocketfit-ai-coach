import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, X } from "lucide-react";

interface BookmarkListProps {
  userId: string;
  onNavigate: (chapter: number, verse: number) => void;
  onClose: () => void;
}

interface BookmarkItem {
  id: string;
  chapter: number;
  verse: number;
  note: string | null;
  created_at: string;
}

export const BookmarkList = ({ userId, onNavigate, onClose }: BookmarkListProps) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("gita_bookmarks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (data) setBookmarks(data);
      setLoading(false);
    };
    load();
  }, [userId]);

  return (
    <Card className="border-border/30 animate-fade-in">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-3.5 h-3.5 text-primary" />
            <p className="text-[10px] text-primary uppercase tracking-widest font-medium">Saved Verses</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-muted-foreground">Loading...</p>
        ) : bookmarks.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No saved verses yet. Bookmark verses that resonate with you.</p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {bookmarks.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  onNavigate(b.chapter, b.verse);
                  onClose();
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors text-sm text-foreground"
              >
                Chapter {b.chapter}, Verse {b.verse}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
