import { format } from "date-fns";

interface HeaderProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children?: React.ReactNode;
}

export function Header({ title, subtitle, lastUpdated, children }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
        )}
        {lastUpdated && (
          <p className="text-xs text-text-tertiary mt-1">
            最后更新：{format(new Date(lastUpdated), "yyyy-MM-dd HH:mm")} UTC
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
