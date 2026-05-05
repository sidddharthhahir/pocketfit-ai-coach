import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  loadConfig, saveConfig, startReminders, clearAll,
  requestPermission, ReminderConfig, DEFAULT_CONFIG,
} from "@/lib/notifications";

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
      toast.error("Notifications blocked. Enable them in browser settings.");
      return;
    }
    update({ enabled: true });
    toast.success("Reminders activated");
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
      <p className="text-sm text-muted-foreground mb-4">
        Web push nudges for meals, water, sleep, and your daily Gita verse. Keep this tab open or install the app.
      </p>

      {!cfg.enabled ? (
        <Button onClick={enable} className="w-full">
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
          <Button variant="outline" onClick={() => update({ enabled: false })} className="w-full">
            Turn off reminders
          </Button>
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
