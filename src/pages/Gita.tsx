import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  ChevronRight, Layers, MessageCircle, BookOpen, X,
  Lock, UserPlus, Bookmark, Map,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGitaAccess } from "@/hooks/useGitaAccess";
import { useGitaBookmarks } from "@/hooks/useGitaBookmarks";
import { CHAPTER_VERSE_COUNTS, TOTAL_VERSES, VerseData, QuestionAnswer } from "@/components/gita/constants";
import { ChapterMap } from "@/components/gita/ChapterMap";
import { JournalEntry } from "@/components/gita/JournalEntry";
import { BookmarkList } from "@/components/gita/BookmarkList";

interface GitaPageProps {
  userId: string;
}

export const GitaPage = ({ userId }: GitaPageProps) => {
  const { toast } = useToast();
  const { hasAccess, loading: accessLoading } = useGitaAccess(userId);
  const { isBookmarked, toggleBookmark } = useGitaBookmarks(userId);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [chapter, setChapter] = useState(1);
  const [verse, setVerse] = useState(1);
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deeperLoading, setDeeperLoading] = useState(false);
  const [questionMode, setQuestionMode] = useState(false);
  const [question, setQuestion] = useState("");
  const [questionAnswer, setQuestionAnswer] = useState<QuestionAnswer | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [totalRead, setTotalRead] = useState(0);
  const [revealStage, setRevealStage] = useState(0);
  const [showChapterMap, setShowChapterMap] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Load progress
  useEffect(() => {
    if (!hasAccess || accessLoading) return;
    const loadProgress = async () => {
      const { data } = await supabase
        .from("gita_progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        setChapter(data.current_chapter);
        setVerse(data.current_verse || 1);
        setTotalRead(data.total_verses_read);
      } else {
        await supabase.from("gita_progress").insert({
          user_id: userId,
          current_chapter: 1,
          current_verse: 1,
        });
        setChapter(1);
        setVerse(1);
      }
    };
    loadProgress();
  }, [userId, hasAccess, accessLoading]);

  const fetchVerse = useCallback(async (ch: number, v: number) => {
    setLoading(true);
    setVerseData(null);
    setRevealStage(0);
    setQuestionAnswer(null);
    setQuestionMode(false);

    try {
      const { data, error } = await supabase.functions.invoke("gita-verse", {
        body: { chapter: ch, verse: v, action: "read" },
      });
      if (error) throw error;
      setVerseData(data);
      setTimeout(() => setRevealStage(1), 800);
      setTimeout(() => setRevealStage(2), 1600);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (hasAccess && !accessLoading && chapter && verse) {
      fetchVerse(chapter, verse);
    }
  }, [chapter, verse, fetchVerse, hasAccess, accessLoading]);

  // Access denied
  if (!accessLoading && !hasAccess) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-7 h-7 text-primary/60" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Exclusive Access Only</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Bhagavad Gita journey is a private, invite-only experience.
            Ask someone with access to invite you.
          </p>
        </div>
      </div>
    );
  }

  if (accessLoading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  const saveProgress = async (ch: number, v: number, incrementRead: boolean) => {
    const updates: any = {
      current_chapter: ch,
      current_verse: v,
      last_read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (incrementRead) {
      updates.total_verses_read = totalRead + 1;
      setTotalRead((prev) => prev + 1);
    }
    await supabase.from("gita_progress").update(updates).eq("user_id", userId);
  };

  const handleNext = async () => {
    let nextChapter = chapter;
    let nextVerse = verse + 1;
    if (nextVerse > CHAPTER_VERSE_COUNTS[chapter - 1]) {
      if (chapter < 18) {
        nextChapter = chapter + 1;
        nextVerse = 1;
      } else {
        toast({ title: "Journey Complete", description: "You have completed all 18 chapters of the Bhagavad Gita." });
        return;
      }
    }
    await saveProgress(nextChapter, nextVerse, true);
    setChapter(nextChapter);
    setVerse(nextVerse);
  };

  const handleNavigate = (ch: number, v: number) => {
    setShowChapterMap(false);
    setChapter(ch);
    setVerse(v);
    saveProgress(ch, v, false);
  };

  const handleExplainDeeper = async () => {
    setDeeperLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("gita-verse", {
        body: { chapter, verse, action: "explain_deeper" },
      });
      if (error) throw error;
      if (data?.deeper_understanding) {
        setVerseData((prev) => prev ? { ...prev, deeper_understanding: data.deeper_understanding } : prev);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeeperLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setQuestionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("gita-verse", {
        body: { chapter, verse, action: "question", question: question.trim() },
      });
      if (error) throw error;
      setQuestionAnswer(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke("gita-verse", {
        body: { action: "grant_access", email: inviteEmail.trim() },
      });
      if (error) throw error;
      toast({ title: "Access Granted", description: `${inviteEmail} now has access to the Gita journey.` });
      setInviteEmail("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not grant access.", variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  const progressPercent = Math.round((totalRead / TOTAL_VERSES) * 100);
  const bookmarked = isBookmarked(chapter, verse);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Bhagavad Gita</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          {totalRead} of {TOTAL_VERSES} verses read · {progressPercent}% complete
        </p>
        <div className="w-32 mx-auto h-0.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary/60 rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
        </div>
        {/* Quick actions */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowChapterMap(!showChapterMap); setShowBookmarks(false); }}
            className="text-[10px] text-muted-foreground h-7"
          >
            <Map className="w-3 h-3 mr-1" />
            Chapters
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowBookmarks(!showBookmarks); setShowChapterMap(false); }}
            className="text-[10px] text-muted-foreground h-7"
          >
            <Bookmark className="w-3 h-3 mr-1" />
            Saved
          </Button>
        </div>
      </div>

      {/* Chapter Map */}
      {showChapterMap && (
        <ChapterMap
          currentChapter={chapter}
          currentVerse={verse}
          totalRead={totalRead}
          onNavigate={handleNavigate}
        />
      )}

      {/* Bookmarks List */}
      {showBookmarks && (
        <BookmarkList userId={userId} onNavigate={handleNavigate} onClose={() => setShowBookmarks(false)} />
      )}

      {/* Verse Card */}
      {loading ? (
        <Card className="border-border/30">
          <CardContent className="p-8 space-y-4">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ) : verseData ? (
        <Card className="border-border/30 overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {verseData.chapter_intro && (
              <div className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-4 animate-fade-in">
                {verseData.chapter_intro}
              </div>
            )}

            {/* Reference + Bookmark */}
            <div className="flex items-center justify-center gap-3 animate-fade-in">
              <p className="text-xs text-primary/70 font-medium tracking-widest uppercase">
                {verseData.reference}
              </p>
              <button
                onClick={() => toggleBookmark(chapter, verse)}
                className="transition-all duration-300"
                title={bookmarked ? "Remove bookmark" : "Bookmark this verse"}
              >
                <Bookmark
                  className={`w-4 h-4 transition-colors ${
                    bookmarked ? "fill-primary text-primary" : "text-muted-foreground/40 hover:text-primary/60"
                  }`}
                />
              </button>
            </div>

            {verseData.shlok && (
              <div className="text-center space-y-2 animate-fade-in">
                <p className="text-lg leading-relaxed text-foreground font-serif">{verseData.shlok}</p>
                {verseData.transliteration && (
                  <p className="text-sm text-muted-foreground italic">{verseData.transliteration}</p>
                )}
              </div>
            )}

            <div className={`transition-all duration-700 ${revealStage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Meaning</p>
                <p className="text-sm text-foreground leading-relaxed">{verseData.meaning}</p>
              </div>
            </div>

            <div className={`space-y-5 transition-all duration-700 ${revealStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Context</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{verseData.context}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Deeper Understanding</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{verseData.deeper_understanding}</p>
              </div>
              <div className="bg-primary/5 rounded-xl p-4 space-y-1">
                <p className="text-[10px] text-primary uppercase tracking-widest font-medium">Today's Reflection</p>
                <p className="text-sm text-foreground leading-relaxed">{verseData.reflection}</p>
              </div>
              <p className="text-center text-sm text-muted-foreground italic">"{verseData.insight}"</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Question Answer */}
      {questionAnswer && (
        <Card className="border-primary/20 animate-fade-in">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-primary uppercase tracking-widest font-medium">Answer</p>
              <button onClick={() => setQuestionAnswer(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{questionAnswer.answer}</p>
            {questionAnswer.related_verse && (
              <p className="text-xs text-muted-foreground italic">Related: {questionAnswer.related_verse}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Question Input */}
      {questionMode && (
        <Card className="border-border/30 animate-fade-in">
          <CardContent className="p-4 space-y-3">
            <Textarea
              placeholder="Ask a question about this verse or its teachings..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[60px] text-sm resize-none bg-transparent border-border/30"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => { setQuestionMode(false); setQuestion(""); }}>Cancel</Button>
              <Button size="sm" onClick={handleAskQuestion} disabled={questionLoading || !question.trim()}>
                {questionLoading ? "Reflecting..." : "Ask"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {!loading && verseData && revealStage >= 2 && (
        <div className="flex flex-wrap items-center justify-center gap-2 animate-fade-in">
          <Button variant="ghost" size="sm" onClick={handleExplainDeeper} disabled={deeperLoading} className="text-xs text-muted-foreground hover:text-foreground">
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            {deeperLoading ? "Expanding..." : "Explain Deeper"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setQuestionMode(true)} className="text-xs text-muted-foreground hover:text-foreground">
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
            Ask
          </Button>
          <JournalEntry userId={userId} chapter={chapter} verse={verse} />
          <Button size="sm" onClick={handleNext} className="text-xs">
            Next Verse
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}

      {/* Invite Section */}
      <Card className="border-border/20 mt-8">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Invite someone to this journey</p>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Enter their email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="text-sm h-8" />
            <Button size="sm" onClick={handleInviteUser} disabled={inviting || !inviteEmail.trim()} className="text-xs h-8">
              {inviting ? "Inviting..." : "Invite"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GitaPage;
