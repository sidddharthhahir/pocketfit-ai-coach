import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  loadConfig, saveConfig, startReminders, clearAll,
  requestPermission, registerSW, ReminderConfig, DEFAULT_CONFIG,
} from "@/lib/notifications";

const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();

export const ReminderSettings = () => {
  const [cfg, setCfg] = useState<ReminderConfig>(DEFAULT_CONFIG);
  const [perm, setPerm] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setSupported(false);
      return;
    }
    setCfg(loadConfig());
    setPerm(Notification.permission);
  }, []);

  const update = (patch: Partial<ReminderConfig>) => {
    const next = { ...cfg, ...patch };
    setCfg(next);
    saveConfig(next);
    if (next.enabled) {
      startReminders(next);
    } else {
      clearAll();
    }
  };

  const enable = async () => {
    const ok = await requestPermission();
    setPerm(Notification.permission);
    if (!ok) {
      toast.error("Notifications blocked. Enable them in your browser settings (lock icon → Notifications → Allow).");
      return;
    }
    update({ enabled: true });
    toast.success("Reminders activated");
  };

  const sendTest = async () => {
    const ok = await requestPermission();
    setPerm(Notification.permission);
    if (!ok) {
      toast.error("Notifications blocked. Allow them in browser settings first.");
      return;
    }
    const reg = await registerSW();
    if (!reg) {
      toast.error("Service worker unavailable in this context.");
      return;
    }
    try {
      await reg.showNotification("BoomStartAI test 🔔", {
        body: "If you see this, reminders will work.",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
      });
      toast.success("Test sent — check your system tray");
    } catch {
      toast.error("Could not show notification.");
    }
  };

  if (!supported) {
    return (
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Reminders</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Your browser doesn't support web notifications.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        {cfg.enabled ? <Bell className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
        <h3 className="font-semibold">Reminders</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Web push nudges for meals, water, sleep, and your daily Gita verse. Keep this tab open or install the app.
      </p>

      {isInIframe && (
        <div className="mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Notifications don't work inside the Lovable preview. Open the published app at <strong>boomstart.lovable.app</strong> to use them.</span>
        </div>
      )}

      {perm === "denied" && (
        <div className="mb-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Notifications blocked. Click the lock icon in your address bar → Notifications → Allow, then reload.</span>
        </div>
      )}

      {!cfg.enabled ? (
        <Button onClick={enable} className="w-full" disabled={perm === "denied"}>
          {perm === "denied" ? "Notifications blocked" : "Enable reminders"}
        </Button>
      ) : (
        <div className="space-y-3">
          <Toggle id="meals" label="Meal times (8:30, 13:00, 19:30)" checked={cfg.meals}
            onChange={(v) => update({ meals: v })} />
          <Toggle id="water" label="Water (every 2h, 9–21)" checked={cfg.water}
            onChange={(v) => update({ water: v })} />
          <Toggle id="sleep" label="Sleep wind-down (22:30)" checked={cfg.sleep}
            onChange={(v) => update({ sleep: v })} />
          <Toggle id="verse" label="Daily verse (8:00)" checked={cfg.verse}
            onChange={(v) => update({ verse: v })} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={sendTest} className="flex-1">
              Send test
            </Button>
            <Button variant="outline" onClick={() => update({ enabled: false })} className="flex-1">
              Turn off
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

const Toggle = ({ id, label, checked, onChange }: {
  id: string; label: string; checked: boolean; onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between">
    <Label htmlFor={id} className="text-sm">{label}</Label>
    <Switch id={id} checked={checked} onCheckedChange={onChange} />
  </div>
);
