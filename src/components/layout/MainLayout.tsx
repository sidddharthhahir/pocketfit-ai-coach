import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { OnboardingHint } from "./OnboardingHint";

interface MainLayoutProps {
  children: ReactNode;
  onSignOut: () => void;
}

export const MainLayout = ({ children, onSignOut }: MainLayoutProps) => {
  const location = useLocation();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Show hint for first-time users
    const hasSeenHint = localStorage.getItem("fitai-nav-hint-seen");
    if (!hasSeenHint) {
      setShowHint(true);
    }
  }, []);

  const dismissHint = () => {
    localStorage.setItem("fitai-nav-hint-seen", "true");
    setShowHint(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop Navigation */}
      <DesktopNav onSignOut={onSignOut} />

      {/* Main Content - constrained width for better readability on large screens */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        <div className="mx-auto max-w-6xl w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* First-time user hint */}
      {showHint && <OnboardingHint onDismiss={dismissHint} />}
    </div>
  );
};
