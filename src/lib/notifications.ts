// Local scheduled notifications via Service Worker + setTimeout (web push without server)
const STORAGE_KEY = "boomstart-reminders";

export interface ReminderConfig {
  enabled: boolean;
  meals: boolean;       // breakfast/lunch/dinner
  water: boolean;       // every 2h between 9-21
  sleep: boolean;       // 22:30
  verse: boolean;       // 08:00
}

export const DEFAULT_CONFIG: ReminderConfig = {
  enabled: false,
  meals: true,
  water: true,
  sleep: true,
  verse: true,
};

export const loadConfig = (): ReminderConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
};

export const saveConfig = (cfg: ReminderConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
};

export const registerSW = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
};

export const requestPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
};

interface ScheduledItem {
  hour: number;
  minute: number;
  title: string;
  body: string;
  url: string;
}

const buildSchedule = (cfg: ReminderConfig): ScheduledItem[] => {
  const items: ScheduledItem[] = [];
  if (cfg.meals) {
    items.push({ hour: 8, minute: 30, title: "Breakfast time 🍳", body: "Log your breakfast in 30s.", url: "/nutrition" });
    items.push({ hour: 13, minute: 0, title: "Lunch time 🥗", body: "Log your lunch.", url: "/nutrition" });
    items.push({ hour: 19, minute: 30, title: "Dinner time 🍛", body: "Log your dinner.", url: "/nutrition" });
  }
  if (cfg.water) {
    for (let h = 9; h <= 21; h += 2) {
      items.push({ hour: h, minute: 0, title: "Hydrate 💧", body: "Log a glass of water.", url: "/dashboard" });
    }
  }
  if (cfg.sleep) {
    items.push({ hour: 22, minute: 30, title: "Wind down 🌙", body: "Time to start sleep prep.", url: "/dashboard" });
  }
  if (cfg.verse) {
    items.push({ hour: 8, minute: 0, title: "Daily verse 📖", body: "Your Gita verse for today is ready.", url: "/gita" });
  }
  return items;
};

const timers: number[] = [];

export const clearAll = () => {
  timers.forEach((t) => clearTimeout(t));
  timers.length = 0;
};

const scheduleNext = (item: ScheduledItem, reg: ServiceWorkerRegistration) => {
  const now = new Date();
  const next = new Date();
  next.setHours(item.hour, item.minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next.getTime() - now.getTime();
  const id = window.setTimeout(async () => {
    try {
      await reg.showNotification(item.title, {
        body: item.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: `${item.title}-${item.hour}`,
        data: { url: item.url },
      });
    } catch {
      // ignore
    }
    scheduleNext(item, reg); // reschedule for tomorrow
  }, delay);
  timers.push(id);
};

export const startReminders = async (cfg: ReminderConfig) => {
  clearAll();
  if (!cfg.enabled) return;
  const ok = await requestPermission();
  if (!ok) return;
  const reg = await registerSW();
  if (!reg) return;
  const items = buildSchedule(cfg);
  items.forEach((it) => scheduleNext(it, reg));
};
