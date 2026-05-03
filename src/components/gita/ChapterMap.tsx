import { Card, CardContent } from "@/components/ui/card";
import { CHAPTER_VERSE_COUNTS } from "./constants";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChapterMapProps {
  currentChapter: number;
  currentVerse: number;
  onNavigate: (chapter: number, verse: number) => void;
}

export const ChapterMap = ({ currentChapter, currentVerse, onNavigate }: ChapterMapProps) => {
  const { t } = useTranslation("gita");
  const chapterNames = t("chapterNames", { returnObjects: true }) as string[];

  const getChapterStatus = (chapterIndex: number) => {
    const chapterNum = chapterIndex + 1;
    if (chapterNum < currentChapter) return "complete";
    if (chapterNum === currentChapter) return "current";
    return "locked";
  };

  return (
    <Card className="border-border/30">
      <CardContent className="p-4 space-y-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{t("chapters")}</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {chapterNames.map((name, i) => {
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
                  {status === "complete" && <Check className="w-3 h-3 text-primary" />}
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">{name}</p>
                <p className="text-[8px] text-muted-foreground/60 mt-0.5">
                  {t("versesCount", { count: CHAPTER_VERSE_COUNTS[i] })}
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
