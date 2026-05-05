import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Globe, Copy, Check } from "lucide-react";

interface Props { userId: string }

export const PublicProfileSettings = ({ userId }: Props) => {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, display_name, bio, public_enabled")
        .eq("user_id", userId).maybeSingle();
      if (data) {
        setUsername(data.username || "");
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
        setEnabled(!!data.public_enabled);
      }
    })();
  }, [userId]);

  const save = async () => {
    if (enabled && !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      toast.error("Username must be 3-30 letters, numbers, or underscores");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      username: username || null,
      display_name: displayName || null,
      bio: bio || null,
      public_enabled: enabled,
    }).eq("user_id", userId);
    setSaving(false);
    if (error) {
      toast.error(error.message.includes("unique") ? "Username already taken" : "Save failed");
      return;
    }
    toast.success("Public profile updated");
  };

  const url = username ? `${window.location.origin}/u/${username}` : "";

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Public profile</h3>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Label htmlFor="public-toggle">Make my progress page public</Label>
        <Switch id="public-toggle" checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname" maxLength={30} />
        </div>
        <div>
          <Label htmlFor="dname">Display name</Label>
          <Input id="dname" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name" maxLength={50} />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)}
            placeholder="A line about your fitness journey" maxLength={200} rows={2} />
        </div>

        {enabled && username && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 text-sm">
            <span className="flex-1 truncate">{url}</span>
            <Button size="sm" variant="ghost" onClick={copyUrl}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        )}

        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </Card>
  );
};
