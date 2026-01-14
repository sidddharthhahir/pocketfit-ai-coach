import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, addDays, isAfter } from "date-fns";
import { 
  Mail, Lock, Unlock, Clock, Heart, Brain, Flame, 
  Loader2, Sparkles, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FutureMessageProps {
  userId: string;
  currentSleepQuality?: string;
  currentMood?: string;
}

interface FutureMessageData {
  id: string;
  content: string;
  created_at: string;
  unlock_at: string;
  is_unlocked: boolean;
  sleep_quality_at_write: string | null;
  mood_at_write: string | null;
  reflection_response: string | null;
  tone: string | null;
}

const TONES = [
  { value: "encouraging", label: "Encouraging", emoji: "💛" },
  { value: "honest", label: "Honest", emoji: "🧠" },
  { value: "proud", label: "Proud", emoji: "🔥" },
];

const REFLECTION_OPTIONS = [
  { value: "calm", label: "Calm", emoji: "🟢" },
  { value: "emotional", label: "Emotional", emoji: "🟡" },
  { value: "motivated", label: "Motivated", emoji: "🔵" },
];

export const FutureMessage = ({ 
  userId, 
  currentSleepQuality, 
  currentMood 
}: FutureMessageProps) => {
  const [message, setMessage] = useState<FutureMessageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState("");
  const [unlockDays, setUnlockDays] = useState<7 | 30>(7);
  const [tone, setTone] = useState("encouraging");
  const [showReveal, setShowReveal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessage();
  }, [userId]);

  const fetchMessage = async () => {
    try {
      // Get the most recent locked or unlocked message
      const { data, error } = await supabase
        .from("future_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        const unlockDate = new Date(data.unlock_at);
        const now = new Date();

        // Auto-unlock if time has passed
        if (!data.is_unlocked && isAfter(now, unlockDate)) {
          const { error: updateError } = await supabase
            .from("future_messages")
            .update({ is_unlocked: true })
            .eq("id", data.id);

          if (!updateError) {
            setMessage({ ...data, is_unlocked: true });
            setShowReveal(true);
          }
        } else {
          setMessage(data);
          if (data.is_unlocked && !data.reflection_response) {
            setShowReveal(true);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching future message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockMessage = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      const unlockAt = addDays(new Date(), unlockDays);

      const { error } = await supabase.from("future_messages").insert({
        user_id: userId,
        content: content.trim(),
        unlock_at: unlockAt.toISOString(),
        sleep_quality_at_write: currentSleepQuality || null,
        mood_at_write: currentMood || null,
        tone,
      });

      if (error) throw error;

      toast({
        title: "Message locked ✉️",
        description: `Your message will unlock in ${unlockDays} days`,
      });

      setContent("");
      fetchMessage();
    } catch (error) {
      console.error("Error saving message:", error);
      toast({
        title: "Error",
        description: "Failed to save your message",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReflection = async (response: string) => {
    if (!message) return;

    try {
      const { error } = await supabase
        .from("future_messages")
        .update({ reflection_response: response })
        .eq("id", message.id);

      if (error) throw error;

      setMessage({ ...message, reflection_response: response });
      setShowReveal(false);

      toast({
        title: "Reflection saved 💜",
        description: "Thank you for sharing how you feel",
      });
    } catch (error) {
      console.error("Error saving reflection:", error);
    }
  };

  const handleWriteNew = () => {
    setMessage(null);
    setShowReveal(false);
  };

  if (isLoading) {
    return (
      <Card className="p-6 border-border">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  // Unlocked message - show reveal
  if (message?.is_unlocked && showReveal) {
    return (
      <Card className="p-0 border-0 overflow-hidden">
        <div className="relative bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-blue-900/30 p-8">
          {/* Soft background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
          
          <div className="relative text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/30">
              <Unlock className="w-8 h-8 text-purple-400" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                A message from Past You
              </h3>
              <p className="text-sm text-muted-foreground">
                You wrote this on {format(new Date(message.created_at), "MMMM d, yyyy")}
              </p>
            </div>

            {(message.sleep_quality_at_write || message.mood_at_write) && (
              <p className="text-xs text-muted-foreground/70">
                {message.sleep_quality_at_write && `Sleep quality that night: ${message.sleep_quality_at_write}`}
                {message.sleep_quality_at_write && message.mood_at_write && " • "}
                {message.mood_at_write && `Mood: ${message.mood_at_write}`}
              </p>
            )}

            {/* Message content with handwritten style */}
            <div className="max-w-md mx-auto py-6 px-4">
              <p className="text-lg leading-relaxed text-foreground/90 italic font-light">
                "{message.content}"
              </p>
            </div>

            {/* Reflection prompt */}
            <div className="pt-4 border-t border-border/30">
              <p className="text-sm text-muted-foreground mb-4">
                How does this make you feel now?
              </p>
              <div className="flex justify-center gap-3">
                {REFLECTION_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:bg-purple-500/10 hover:border-purple-500/30"
                    onClick={() => handleReflection(option.value)}
                  >
                    <span>{option.emoji}</span>
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Locked message - show countdown
  if (message && !message.is_unlocked) {
    const daysRemaining = differenceInDays(new Date(message.unlock_at), new Date());
    const displayDays = Math.max(0, daysRemaining);

    return (
      <Card className="p-6 border-border bg-gradient-to-br from-background to-muted/30">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20">
            <div className="relative">
              <Mail className="w-6 h-6 text-purple-400" />
              <Lock className="w-3 h-3 text-purple-500 absolute -bottom-1 -right-1" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">
              A message from your past self is waiting
            </h3>
            <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Unlocks in <span className="font-semibold text-purple-400">{displayDays}</span> {displayDays === 1 ? "day" : "days"}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
            Patience. Your past self wrote something meaningful for you to read.
          </p>
        </div>
      </Card>
    );
  }

  // Message already reflected on - option to write new
  if (message?.is_unlocked && message.reflection_response) {
    return (
      <Card className="p-6 border-border">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Heart className="w-6 h-6 text-emerald-400" />
          </div>

          <div>
            <h3 className="font-semibold text-foreground">
              You've read your message
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Written on {format(new Date(message.created_at), "MMM d")} • 
              You felt {message.reflection_response}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleWriteNew}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Write a new message
          </Button>
        </div>
      </Card>
    );
  }

  // No message - show write form
  return (
    <Card className="p-6 border-border">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold">Message to Future Me</h3>
            <p className="text-sm text-muted-foreground">
              If future you reads this, what should they remember?
            </p>
          </div>
        </div>

        {/* Message input */}
        <div>
          <Textarea
            placeholder="Write something meaningful to your future self..."
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 500))}
            className="min-h-[120px] resize-none"
          />
          <p className="text-xs text-muted-foreground text-right mt-1">
            {content.length}/500
          </p>
        </div>

        {/* Unlock time selector */}
        <div>
          <Label className="text-sm flex items-center gap-2 mb-3">
            <Calendar className="w-3 h-3" />
            Unlock after
          </Label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={unlockDays === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setUnlockDays(7)}
              className="flex-1"
            >
              7 days
            </Button>
            <Button
              type="button"
              variant={unlockDays === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setUnlockDays(30)}
              className="flex-1"
            >
              30 days
            </Button>
          </div>
        </div>

        {/* Tone selector */}
        <div>
          <Label className="text-sm mb-3 block">Tone (optional)</Label>
          <div className="flex gap-2">
            {TONES.map((t) => (
              <Button
                key={t.value}
                type="button"
                variant={tone === t.value ? "secondary" : "outline"}
                size="sm"
                onClick={() => setTone(t.value)}
                className={cn(
                  "flex-1 gap-1.5",
                  tone === t.value && "border-purple-500/30"
                )}
              >
                <span>{t.emoji}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Lock button */}
        <Button
          className="w-full gap-2"
          onClick={handleLockMessage}
          disabled={!content.trim() || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Locking...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Lock Message
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
