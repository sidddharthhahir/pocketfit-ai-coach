import { Card, CardContent } from "@/components/ui/card";
import { CHAPTER_VERSE_COUNTS, CHAPTER_NAMES } from "./constants";
import { Check } from "lucide-react";

interface ChapterMapProps {
  currentChapter: number;
  currentVerse: number;
  totalRead: number;
  onNavigate: (chapter: number, verse: number) => void;
}

export const ChapterMap = ({ currentChapter, currentVerse, totalRead, onNavigate }: ChapterMapProps) => {
  // Calculate cumulative verse counts to determine which chapters are complete
  const getChapterStatus = (chapterIndex: number) => {
    let versesBeforeChapter = 0;
    for (let i = 0; i < chapterIndex; i++) {
      versesBeforeChapter += CHAPTER_VERSE_COUNTS[i];
    }
    const chapterNum = chapterIndex + 1;
    
    if (chapterNum < currentChapter) return "complete";
    if (chapterNum === currentChapter) return "current";
    return "locked";
  };

  return (
    <Card className="border-border/30">
      <CardContent className="p-4 space-y-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Chapters</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {CHAPTER_NAMES.map((name, i) => {
            const status = getChapterStatus(i);
            const chapterNum = i + 1;
            
            return (
              <button
                key={i}
                onClick={() => {
                  if (status !== "locked") {
                    onNavigate(chapterNum, status === "current" ? currentVerse : 1);
                  }
                }}
                disabled={status === "locked"}
                className={`relative p-2 rounded-lg text-left transition-all duration-300 ${
                  status === "complete"
                    ? "bg-primary/10 hover:bg-primary/15 cursor-pointer"
                    : status === "current"
                    ? "bg-primary/20 ring-1 ring-primary/30 cursor-pointer"
                    : "bg-muted/30 opacity-40 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{chapterNum}</span>
                  {status === "complete" && (
                    <Check className="w-3 h-3 text-primary" />
                  )}
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">{name}</p>
                <p className="text-[8px] text-muted-foreground/60 mt-0.5">
                  {CHAPTER_VERSE_COUNTS[i]} verses
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
