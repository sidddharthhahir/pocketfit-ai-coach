import { NavLink } from "@/components/NavLink";
import {
  Home,
  Dumbbell,
  Utensils,
  TrendingUp,
  User,
  MoreHorizontal,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Camera, Users, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MobileThemeItem = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <DropdownMenuItem
      className="flex items-center gap-3 cursor-pointer"
      onSelect={(e) => {
        e.preventDefault();
        setTheme(isDark ? "light" : "dark");
      }}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
    </DropdownMenuItem>
  );
};

const mainNavItems = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/nutrition", label: "Nutrition", icon: Utensils },
  { to: "/progress", label: "Progress", icon: TrendingUp },
];

const moreNavItems = [
  { to: "/photos", label: "Photos", icon: Camera },
  { to: "/accountability", label: "Buddy", icon: Users },
  { to: "/commitments", label: "Goals", icon: Target },
  { to: "/profile", label: "Profile", icon: User },
];

export const MobileNav = () => {
  const navigate = useNavigate();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center gap-1 w-16 h-full text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}

        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 w-16 h-full text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mb-2">
            {moreNavItems.map((item) => (
              <DropdownMenuItem
                key={item.to}
                onClick={() => navigate(item.to)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </DropdownMenuItem>
            ))}
            <MobileThemeItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};
