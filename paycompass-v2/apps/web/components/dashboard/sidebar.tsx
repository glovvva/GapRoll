"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Home,
  Scale,
  TrendingUp,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/data", label: "Data Upload", icon: Upload },
  { href: "/dashboard/paygap", label: "Pay Gap", icon: TrendingUp },
  { href: "/dashboard/evg", label: "EVG Scoring", icon: Scale },
  { href: "/dashboard/report", label: "Art. 16 Report", icon: FileText },
];

function isLinkActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r border-teal-primary/15 bg-forest-card",
        "transition-colors duration-200"
      )}
    >
      {/* Logo / tytuł */}
      <div className="border-b border-teal-primary/15 p-4">
        <Link
          href="/dashboard"
          className="text-xl font-bold text-primary transition-colors duration-200 hover:opacity-90"
        >
          GapRoll
        </Link>
      </div>

      {/* Nawigacja */}
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = isLinkActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200",
                "hover:bg-secondary/50 hover:text-text-primary",
                isActive
                  ? "bg-secondary font-semibold text-primary"
                  : "text-text-secondary"
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
