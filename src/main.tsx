import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { loadConfig, startReminders } from "@/lib/notifications";

createRoot(document.getElementById("root")!).render(<App />);

// Boot reminders if user previously enabled them
const cfg = loadConfig();
if (cfg.enabled) {
  startReminders(cfg);
}
