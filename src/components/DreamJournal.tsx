import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { 
  CloudMoon, 
  Sparkles, 
  Loader2, 
  Plus, 
  Trash2,
  Brain,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DreamJournalProps {
  userId: string;
}

interface DreamLog {
  id: string;
  log_date: string;
  dream_title: string | null;
  dream_content: string;
  mood: string | null;
  themes: string[] | null;
  lucidity_level: number;
  ai_interpretation: string | null;
  created_at: string;
}

const MOOD_OPTIONS = [
  { value: "peaceful", emoji: "😌", label: "Peaceful" },
  { value: "anxious", emoji: "😰", label: "Anxious" },
  { value: "exciting", emoji: "🤩", label: "Exciting" },
  { value: "scary", emoji: "😨", label: "Scary" },
  { value: "confusing", emoji: "🤔", label: "Confusing" },
  { value: "happy", emoji: "😊", label: "Happy" },
  { value: "sad", emoji: "😢", label: "Sad" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
];

export const DreamJournal = ({ userId }: DreamJournalProps) => {
  const [dreams, setDreams] = useState<DreamLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [lucidityLevel, setLucidityLevel] = useState([0]);
  const [aiInterpretation, setAiInterpretation] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchDreams();
  }, [userId]);

  const fetchDreams = async () => {
    try {
      const { data, error } = await supabase
        .from("dream_logs")
        .select("*")
        .eq("user_id", userId)
        .order("log_date", { ascending: false })
        .limit(10);

      if (error) throw error;
      setDreams(data || []);
    } catch (error) {
      console.error("Error fetching dreams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeDream = async () => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-dream", {
        body: { dreamContent: content, mood, lucidityLevel: lucidityLevel[0] },
      });

      if (error) throw error;
      
      setAiInterpretation(data.interpretation);
    } catch (error) {
      console.error("Error analyzing dream:", error);
      // Fallback interpretation
      const themes = extractThemes(content);
      setAiInterpretation(
        `Your dream contains themes of ${themes.join(", ")}. ` +
        `${lucidityLevel[0] > 50 ? "The high lucidity suggests awareness during dreaming." : ""} ` +
        "Dreams often reflect our subconscious thoughts and emotions from daily life."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractThemes = (text: string): string[] => {
    const themePatterns: Record<string, RegExp> = {
      "travel": /travel|journey|flying|road|path|adventure/i,
      "relationships": /friend|family|love|partner|people|crowd/i,
      "water": /water|ocean|river|swim|rain|flood/i,
      "animals": /animal|dog|cat|bird|snake|horse/i,
      "chase": /chase|run|escape|flee|follow/i,
      "falling": /fall|falling|drop|descend/i,
      "nature": /tree|forest|mountain|sky|garden|flower/i,
      "work": /work|office|school|test|exam|job/i,
    };

    return Object.entries(themePatterns)
      .filter(([_, pattern]) => pattern.test(text))
      .map(([theme]) => theme);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Missing content",
        description: "Please describe your dream",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const themes = extractThemes(content);
      
      const { error } = await supabase.from("dream_logs").insert({
        user_id: userId,
        log_date: format(new Date(), "yyyy-MM-dd"),
        dream_title: title || null,
        dream_content: content,
        mood: mood || null,
        themes: themes.length > 0 ? themes : null,
        lucidity_level: lucidityLevel[0],
        ai_interpretation: aiInterpretation || null,
      });

      if (error) throw error;

      toast({
        title: "Dream recorded! 🌙",
        description: "Your dream has been saved to your journal",
      });
      
      // Reset form
      setTitle("");
      setContent("");
      setMood("");
      setLucidityLevel([0]);
      setAiInterpretation("");
      setShowForm(false);
      fetchDreams();
    } catch (error) {
      console.error("Error saving dream:", error);
      toast({
        title: "Error",
        description: "Failed to save dream",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("dream_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setDreams(dreams.filter((d) => d.id !== id));
      toast({
        title: "Dream deleted",
        description: "Dream entry removed from journal",
      });
    } catch (error) {
      console.error("Error deleting dream:", error);
    }
  };

  return (
    <Card className="p-4 border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <CloudMoon className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="font-semibold">Dream Journal</h3>
            <p className="text-sm text-muted-foreground">Record & analyze your dreams</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-4 h-4 mr-1" />
          New
        </Button>
      </div>

      {showForm && (
        <div className="space-y-4 mb-4 p-4 rounded-lg bg-muted/30 border border-border">
          <div>
            <Label className="text-sm">Dream Title (optional)</Label>
            <Input
              placeholder="Give your dream a name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm">Dream Description</Label>
            <Textarea
              placeholder="Describe your dream in as much detail as you remember..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 min-h-[100px] resize-none"
            />
          </div>

          <div>
            <Label className="text-sm">Dream Mood</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {MOOD_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={mood === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMood(option.value)}
                  className="text-sm"
                >
                  {option.emoji} {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center gap-1">
                <Eye className="w-3 h-3" /> Lucidity Level
              </Label>
              <span className="text-sm text-muted-foreground">
                {lucidityLevel[0]}%
              </span>
            </div>
            <Slider
              value={lucidityLevel}
              onValueChange={setLucidityLevel}
              max={100}
              step={10}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {lucidityLevel[0] < 30 ? "No awareness" : 
               lucidityLevel[0] < 60 ? "Partial awareness" : 
               "Lucid dreaming"}
            </p>
          </div>

          {content.trim() && !aiInterpretation && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={analyzeDream}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-2" />
                  Analyze Dream with AI
                </>
              )}
            </Button>
          )}

          {aiInterpretation && (
            <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium">AI Dream Interpretation</span>
              </div>
              <p className="text-sm text-muted-foreground">{aiInterpretation}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Dream"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setTitle("");
                setContent("");
                setMood("");
                setLucidityLevel([0]);
                setAiInterpretation("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : dreams.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CloudMoon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No dreams recorded yet</p>
          <p className="text-xs">Start journaling your dreams!</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {dreams.map((dream) => (
              <div
                key={dream.id}
                className="p-3 rounded-lg bg-muted/30 border border-border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {dream.dream_title || "Untitled Dream"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(dream.log_date), "MMM d")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {dream.dream_content}
                    </p>
                    {dream.themes && dream.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {dream.themes.map((theme) => (
                          <Badge key={theme} variant="secondary" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {dream.mood && (
                      <div className="mt-2">
                        <span className="text-xs">
                          {MOOD_OPTIONS.find(m => m.value === dream.mood)?.emoji}{" "}
                          {MOOD_OPTIONS.find(m => m.value === dream.mood)?.label}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(dream.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};
