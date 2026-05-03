import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PenLine, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface JournalEntryProps {
  userId: string;
  chapter: number;
  verse: number;
}

export const JournalEntry = ({ userId, chapter, verse }: JournalEntryProps) => {
  const { toast } = useToast();
  const { t } = useTranslation("gita");
  const [open, setOpen] = useState(false);
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!reflection.trim()) return;
    setSaving(true);
    try {
      await supabase.from("gita_journal").insert({
        user_id: userId,
        chapter,
        verse,
        reflection: reflection.trim(),
      });
      setSaved(true);
      setTimeout(() => {
        setOpen(false);
        setSaved(false);
        setReflection("");
      }, 1500);
    } catch (err: any) {
      toast({ title: t("errorTitle"), description: t("errorSaveReflection"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <Card className="border-primary/20 animate-fade-in">
        <CardContent className="p-4 flex items-center gap-2 justify-center text-sm text-primary">
          <Check className="w-4 h-4" />
          {t("reflectionSaved")}
        </CardContent>
      </Card>
    );
  }

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        <PenLine className="w-3.5 h-3.5 mr-1.5" />
        {t("journal")}
      </Button>
    );
  }

  return (
    <Card className="border-border/30 animate-fade-in">
      <CardContent className="p-4 space-y-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t("yourReflection")}</p>
        <Textarea
          placeholder={t("journalPlaceholder")}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          className="min-h-[60px] text-sm resize-none bg-transparent border-border/30"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => { setOpen(false); setReflection(""); }}>
            {t("cancel")}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !reflection.trim()}>
            {saving ? t("saving") : t("save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
