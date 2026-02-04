"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  FileText,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "总览", icon: LayoutDashboard },
  { href: "/events", label: "事件", icon: Zap },
  { href: "/briefing", label: "高管简报", icon: FileText },
  { href: "/competitors", label: "竞对对比", icon: Users },
  { href: "/reports", label: "报告", icon: BarChart3 },
  { href: "/settings", label: "设置", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-bg-darker border-r border-border-default flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-border-default">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
            <span className="text-bg-darkest font-bold text-sm">BN</span>
          </div>
          <div>
            <h1 className="font-display text-sm font-bold text-text-primary">
              舆情监控中心
            </h1>
            <p className="text-[11px] text-text-tertiary">Social Sentiment Monitor</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-gold/10 text-gold font-medium"
                  : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-default">
        <div className="text-[11px] text-text-tertiary">
          <p>由 Grok AI 驱动</p>
          <p>每30分钟自动更新</p>
        </div>
      </div>
    </aside>
  );
}
