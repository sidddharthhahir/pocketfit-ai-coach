import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import {
  Home, Dumbbell, Utensils, TrendingUp, User,
  Camera, Users, Target, LogOut, BookOpen,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DesktopNavProps {
  onSignOut: () => void;
}

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/nutrition", label: "Nutrition", icon: Utensils },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/photos", label: "Photos", icon: Camera },
  { to: "/accountability", label: "Buddy", icon: Users },
  { to: "/commitments", label: "Goals", icon: Target },
  { to: "/gita", label: "Gita", icon: BookOpen },
  { to: "/profile", label: "Profile", icon: User },
];

export const DesktopNav = ({ onSignOut }: DesktopNavProps) => {
  return (
    <header className="hidden md:block glass-card border-b border-border/40 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between h-14">
            <NavLink to="/dashboard" className="flex items-center gap-2 shrink-0">
              <h1 className="text-lg font-bold shimmer-text">
                FitAI
              </h1>
            </NavLink>

            <nav className="flex items-center gap-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-300 whitespace-nowrap"
                  activeClassName="text-primary bg-primary/10 hover:text-primary shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
                >
                  <item.icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1 shrink-0">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={onSignOut} className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-3.5 h-3.5 lg:mr-1.5" />
                <span className="hidden lg:inline text-xs">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};