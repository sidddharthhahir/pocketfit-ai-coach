import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  icon: string;
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
    <div className="space-y-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 px-1 group cursor-pointer"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <span>{icon}</span>
          {title}
        </h2>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="space-y-6 animate-in fade-in-0 slide-in-from-top-2 duration-200">{children}</div>}
    </div>
  );
};
