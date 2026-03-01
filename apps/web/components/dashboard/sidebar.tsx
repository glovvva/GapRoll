"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Calculator,
  FileText,
  Home,
  Scale,
  Table2,
  TrendingUp,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navItems: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/data", label: "Data Upload", icon: Upload },
  { href: "/dashboard/dane", label: "Podgląd danych", icon: Table2 },
  { href: "/dashboard/paygap", label: "Pay Gap", icon: TrendingUp },
  { href: "/dashboard/evg", label: "EVG Scoring", icon: Scale },
  {
    href: "/dashboard/root-cause",
    label: "Analiza przyczyn",
    icon: BarChart2,
    badge: "Strategia",
  },
  { href: "/dashboard/solio", label: "Optymalizator Budżetowy", icon: Calculator },
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
  const [isLegalPartner, setIsLegalPartner] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user?.id) {
        setIsLegalPartner(false);
        return;
      }
      supabase
        .from("profiles")
        .select("partner_type")
        .eq("id", session.user.id)
        .single()
        .then(({ data }) => {
          setIsLegalPartner((data?.partner_type ?? "").toString().toLowerCase() === "legal");
        })
        .catch(() => setIsLegalPartner(false));
    });
  }, []);

  const legalPartnerActive = pathname === "/legal-partner" || pathname.startsWith("/legal-partner/");

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border",
        "bg-[#0d0d0d] transition-colors duration-200"
      )}
    >
      {/* Logo / tytuł */}
      <div className="border-b border-border p-4">
        <Link
          href="/dashboard"
          className="text-xl font-bold text-white transition-colors duration-200 hover:opacity-90"
        >
          GapRoll
        </Link>
      </div>

      {/* Nawigacja */}
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = isLinkActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                "transition-all duration-150 ease-brand",
                isActive
                  ? "bg-[#6B9FD4]/15 text-[#6B9FD4] border border-[#6B9FD4]/30 [&_svg]:text-[#6B9FD4]"
                  : "text-muted-foreground hover:bg-elevated hover:text-foreground [&_svg]:text-current"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="rounded border border-teal-400/40 bg-teal-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-300">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
        {isLegalPartner && (
          <Link
            href="/legal-partner"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
              "transition-all duration-150 ease-brand",
              legalPartnerActive
                ? "bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 [&_svg]:text-emerald-400"
                : "text-muted-foreground hover:bg-elevated hover:text-foreground [&_svg]:text-current"
            )}
          >
            <Scale className="h-4 w-4 shrink-0" />
            <span className="flex-1">Portal Kancelarii</span>
          </Link>
        )}
      </nav>
    </aside>
  );
}
