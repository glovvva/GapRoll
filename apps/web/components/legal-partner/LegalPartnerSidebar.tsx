"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Scale, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/legal-partner", label: "Dashboard", icon: BarChart3 },
  { href: "/legal-partner/settings", label: "Branding raportu", icon: Settings },
];

function isLinkActive(pathname: string, href: string): boolean {
  if (href === "/legal-partner") return pathname === "/legal-partner";
  return pathname === href || pathname.startsWith(href + "/");
}

export function LegalPartnerSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border",
        "bg-[#0d0d0d] transition-colors duration-200"
      )}
    >
      <div className="border-b border-border p-4">
        <Link
          href="/legal-partner"
          className="text-xl font-bold text-white transition-colors duration-200 hover:opacity-90"
        >
          <span className="flex items-center gap-2">
            <Scale className="size-5" />
            Portal Kancelarii
          </span>
        </Link>
      </div>
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = isLinkActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg border-l-4 border-transparent px-4 py-3 transition-colors duration-200",
                "hover:bg-card hover:text-white [&_svg]:hover:text-white",
                isActive
                  ? "border-l-emerald-600 bg-emerald-600/10 font-semibold text-white [&_svg]:text-white"
                  : "text-text-secondary [&_svg]:text-text-secondary"
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
