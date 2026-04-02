import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  icon: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export const CollapsibleSection = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: CollapsibleSectionProps) => {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-all group cursor-pointer mb-4"
      >
        <h2 className="text-base font-semibold flex items-center gap-2.5 text-foreground">
          <span className="text-lg">{icon}</span>
          {title}
        </h2>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="space-y-4 animate-fade-up">
          {children}
        </div>
      )}
    </div>
  );
};
