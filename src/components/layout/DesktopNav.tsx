import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import {
  Home,
  Dumbbell,
  Utensils,
  TrendingUp,
  User,
  Camera,
  Users,
  Target,
  LogOut,
} from "lucide-react";

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
  { to: "/profile", label: "Profile", icon: User },
];

export const DesktopNav = ({ onSignOut }: DesktopNavProps) => {
  return (
    <header className="hidden md:block border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/dashboard" className="flex items-center gap-2 shrink-0">
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                FitAI
              </h1>
            </NavLink>

            {/* Navigation Links */}
            <nav className="flex items-center gap-0.5 lg:gap-1 overflow-x-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-1.5 px-2 lg:px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap"
                  activeClassName="text-primary bg-primary/10 hover:text-primary"
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:inline">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Sign Out */}
            <Button variant="ghost" size="sm" onClick={onSignOut} className="shrink-0">
              <LogOut className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
