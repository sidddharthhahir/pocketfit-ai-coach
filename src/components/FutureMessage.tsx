import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, isAfter, isBefore, startOfDay, addDays } from "date-fns";
import { 
  Mail, Lock, Unlock, Clock, Heart, Brain, Flame, 
  Loader2, Sparkles, CalendarIcon, Plus, ChevronRight
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
  { value: "encouragement", label: "Encouragement", emoji: "💛" },
  { value: "reminder", label: "Reminder", emoji: "🧠" },
  { value: "reflection", label: "Reflection", emoji: "🔥" },
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
  const [messages, setMessages] = useState<FutureMessageData[]>([]);
  const [unlockedMessages, setUnlockedMessages] = useState<FutureMessageData[]>([]);
  const [lockedMessages, setLockedMessages] = useState<FutureMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState("");
  const [unlockDate, setUnlockDate] = useState<Date | undefined>(addDays(new Date(), 7));
  const [tone, setTone] = useState("encouragement");
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [viewingMessage, setViewingMessage] = useState<FutureMessageData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("future_messages")
        .select("*")
        .eq("user_id", userId)
        .order("unlock_at", { ascending: true });

      if (error) throw error;

      const now = new Date();
      const allMessages = (data || []) as FutureMessageData[];
      
      // Auto-unlock messages that should be unlocked
      const toUnlock = allMessages.filter(
        m => !m.is_unlocked && isAfter(now, new Date(m.unlock_at))
      );

      if (toUnlock.length > 0) {
        await Promise.all(
          toUnlock.map(m => 
            supabase
              .from("future_messages")
              .update({ is_unlocked: true })
              .eq("id", m.id)
          )
        );
        // Refetch after unlocking
        const { data: refreshed } = await supabase
          .from("future_messages")
          .select("*")
          .eq("user_id", userId)
          .order("unlock_at", { ascending: true });
        
        if (refreshed) {
          processMessages(refreshed as FutureMessageData[]);
        }
      } else {
        processMessages(allMessages);
      }
    } catch (error) {
      console.error("Error fetching future messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processMessages = (allMessages: FutureMessageData[]) => {
    setMessages(allMessages);
    setUnlockedMessages(allMessages.filter(m => m.is_unlocked));
    setLockedMessages(allMessages.filter(m => !m.is_unlocked));
    
    // Auto-show newly unlocked message without reflection
    const newlyUnlocked = allMessages.find(
      m => m.is_unlocked && !m.reflection_response
    );
    if (newlyUnlocked && !viewingMessage) {
      setViewingMessage(newlyUnlocked);
    }
  };

  const handleLockMessage = async () => {
    if (!content.trim() || !unlockDate) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("future_messages").insert({
        user_id: userId,
        content: content.trim(),
        unlock_at: unlockDate.toISOString(),
        sleep_quality_at_write: currentSleepQuality || null,
        mood_at_write: currentMood || null,
        tone,
      });

      if (error) throw error;

      toast({
        title: "Message locked ✉️",
        description: `Your message will unlock on ${format(unlockDate, "MMM d, yyyy")}`,
      });

      setContent("");
      setUnlockDate(addDays(new Date(), 7));
      setTone("encouragement");
      setShowNewMessageDialog(false);
      fetchMessages();
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

  const handleReflection = async (messageId: string, response: string) => {
    try {
      const { error } = await supabase
        .from("future_messages")
        .update({ reflection_response: response })
        .eq("id", messageId);

      if (error) throw error;

      setViewingMessage(null);
      fetchMessages();

      toast({
        title: "Reflection saved 💜",
        description: "Thank you for sharing how you feel",
      });
    } catch (error) {
      console.error("Error saving reflection:", error);
    }
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

  // Viewing an unlocked message
  if (viewingMessage) {
    return (
      <Card className="p-0 border-0 overflow-hidden">
        <div className="relative bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-blue-900/30 p-8">
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
                You wrote this on {format(new Date(viewingMessage.created_at), "MMMM d, yyyy")}
              </p>
            </div>

            {(viewingMessage.sleep_quality_at_write || viewingMessage.mood_at_write) && (
              <p className="text-xs text-muted-foreground/70">
                {viewingMessage.sleep_quality_at_write && `Sleep quality that night: ${viewingMessage.sleep_quality_at_write}`}
                {viewingMessage.sleep_quality_at_write && viewingMessage.mood_at_write && " • "}
                {viewingMessage.mood_at_write && `Mood: ${viewingMessage.mood_at_write}`}
              </p>
            )}

            <div className="max-w-md mx-auto py-6 px-4">
              <p className="text-lg leading-relaxed text-foreground/90 italic font-light">
                "{viewingMessage.content}"
              </p>
            </div>

            {!viewingMessage.reflection_response && (
              <div className="pt-4 border-t border-border/30">
                <p className="text-sm text-muted-foreground mb-4">
                  How does this make you feel now?
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {REFLECTION_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      size="sm"
                      className="gap-2 hover:bg-purple-500/10 hover:border-purple-500/30"
                      onClick={() => handleReflection(viewingMessage.id, option.value)}
                    >
                      <span>{option.emoji}</span>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {viewingMessage.reflection_response && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingMessage(null)}
                className="mt-4"
              >
                Back to messages
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Main messages list view
  return (
    <Card className="p-6 border-border">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">Messages from Your Past Self</h3>
              <p className="text-sm text-muted-foreground">
                {lockedMessages.length > 0 
                  ? `${lockedMessages.length} message${lockedMessages.length > 1 ? 's' : ''} waiting`
                  : "Write to your future self"
                }
              </p>
            </div>
          </div>

          <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-500" />
                  Write to Your Future Self
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  What would future you need to hear?
                </p>

                <Textarea
                  placeholder="Write something meaningful..."
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, 600))}
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {content.length}/600
                </p>

                {/* Date picker */}
                <div>
                  <Label className="text-sm flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-3 h-3" />
                    Unlock date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !unlockDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {unlockDate ? format(unlockDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={unlockDate}
                        onSelect={setUnlockDate}
                        disabled={(date) => isBefore(date, startOfDay(new Date()))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll receive this message on that day.
                  </p>
                </div>

                {/* Tone selector */}
                <div>
                  <Label className="text-sm mb-2 block">Tag (optional)</Label>
                  <div className="flex gap-2 flex-wrap">
                    {TONES.map((t) => (
                      <Button
                        key={t.value}
                        type="button"
                        variant={tone === t.value ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setTone(t.value)}
                        className={cn(
                          "gap-1.5",
                          tone === t.value && "border-purple-500/30"
                        )}
                      >
                        <span>{t.emoji}</span>
                        {t.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleLockMessage}
                  disabled={!content.trim() || !unlockDate || isSaving}
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
            </DialogContent>
          </Dialog>
        </div>

        {/* Locked messages preview */}
        {lockedMessages.length > 0 && (
          <div className="space-y-2">
            {lockedMessages.slice(0, 3).map((msg) => {
              const daysRemaining = Math.max(0, differenceInDays(new Date(msg.unlock_at), new Date()));
              return (
                <div 
                  key={msg.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="relative flex-shrink-0">
                    <Mail className="w-5 h-5 text-purple-400" />
                    <Lock className="w-2.5 h-2.5 text-purple-500 absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">
                      {daysRemaining === 0 
                        ? "Unlocks today"
                        : daysRemaining === 1
                        ? "Unlocks tomorrow"
                        : `Unlocks in ${daysRemaining} days`
                      }
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {format(new Date(msg.unlock_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-muted-foreground/40" />
                </div>
              );
            })}
            
            {lockedMessages.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{lockedMessages.length - 3} more message{lockedMessages.length - 3 > 1 ? 's' : ''} waiting
              </p>
            )}
          </div>
        )}

        {/* Unlocked messages to read */}
        {unlockedMessages.filter(m => !m.reflection_response).length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <p className="text-xs text-purple-400 font-medium">Ready to read</p>
            {unlockedMessages
              .filter(m => !m.reflection_response)
              .map((msg) => (
                <Button
                  key={msg.id}
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20"
                  onClick={() => setViewingMessage(msg)}
                >
                  <div className="flex items-center gap-3">
                    <Unlock className="w-5 h-5 text-purple-400" />
                    <span className="text-sm">
                      From {format(new Date(msg.created_at), "MMM d")}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
              ))}
          </div>
        )}

        {/* Previously read messages */}
        {unlockedMessages.filter(m => m.reflection_response).length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground font-medium">Previously read</p>
            {unlockedMessages
              .filter(m => m.reflection_response)
              .slice(0, 2)
              .map((msg) => (
                <Button
                  key={msg.id}
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto hover:bg-muted/50"
                  onClick={() => setViewingMessage(msg)}
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(msg.created_at), "MMM d")} • You felt {msg.reflection_response}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </Button>
              ))}
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Write a message to your future self
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowNewMessageDialog(true)}
            >
              <Plus className="w-4 h-4" />
              Write your first message
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};