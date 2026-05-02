import { LucideIcon, Sparkles } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Friendly empty-state used across trackers.
 * Includes a soft glow + icon orb to match the glassmorphism aesthetic.
 */
export const EmptyState = ({
  icon: Icon = Sparkles,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 py-10 rounded-2xl border border-border/30 bg-gradient-to-b from-muted/20 to-transparent ${className}`}
    >
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" aria-hidden />
        <div className="relative w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
