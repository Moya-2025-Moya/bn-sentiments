import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  headerRight?: React.ReactNode;
}

export function Card({ children, className, title, headerRight }: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card rounded-xl border border-border-default p-5",
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
          {headerRight}
        </div>
      )}
      {children}
    </div>
  );
}
