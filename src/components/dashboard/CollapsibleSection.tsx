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
        className="w-full flex items-center justify-between py-3.5 px-5 rounded-2xl glass-card glow-border hover:shadow-card-hover transition-all duration-500 group cursor-pointer mb-4"
      >
        <h2 className="text-base font-semibold flex items-center gap-2.5 text-foreground">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300">
            {icon}
          </span>
          {title}
        </h2>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-500 ${
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