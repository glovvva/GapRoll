"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  UserPlus,
  Wallet,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navItems: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
}[] = [
  { href: "/partner", label: "Dashboard", icon: BarChart3 },
  { href: "/partner/clients", label: "Moi klienci", icon: Users },
  { href: "/partner/onboard", label: "Dodaj klienta", icon: UserPlus },
  { href: "/partner/billing", label: "Rozliczenia", icon: Wallet },
  {
    href: "/partner/materials",
    label: "Materiały sprzedażowe",
    icon: FileText,
    soon: true, // placeholder: strona pokazuje "Wkrótce"
  },
];

function isLinkActive(pathname: string, href: string): boolean {
  if (href === "/partner") {
    return pathname === "/partner";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function PartnerSidebar() {
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
          href="/partner"
          className="text-xl font-bold text-white transition-colors duration-200 hover:opacity-90"
        >
          GapRoll Partner
        </Link>
      </div>

      <nav className="flex flex-col gap-2 p-4">
        {navItems.map(({ href, label, icon: Icon, soon }) => {
          const isActive = isLinkActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between rounded-lg border-l-4 border-transparent px-4 py-3 transition-colors duration-200",
                "hover:bg-card hover:text-white [&_svg]:hover:text-white",
                isActive
                  ? "border-l-neon-magenta bg-neon-magenta/10 font-semibold text-white [&_svg]:text-white"
                  : "text-text-secondary [&_svg]:text-text-secondary",
                soon && "opacity-90"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="size-5 shrink-0" />
                <span>{label}</span>
              </div>
              {soon && (
                <Badge variant="secondary" className="text-[10px]">
                  Wkrótce
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
