"use client";

import { usePathname } from "next/navigation";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const pathLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/data": "Data Upload",
  "/dashboard/paygap": "Pay Gap",
  "/dashboard/evg": "EVG Scoring",
  "/dashboard/report": "Art. 16 Report",
};

function getBreadcrumb(pathname: string): string {
  return pathLabels[pathname] ?? pathname.replace("/dashboard", "Dashboard").replace(/-/g, " ") ?? "Dashboard";
}

export function Topbar() {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card px-6",
        "transition-colors duration-200"
      )}
    >
      {/* Lewa strona - breadcrumb */}
      <p className="text-sm font-medium text-foreground">{breadcrumb}</p>

      {/* Prawa strona - notyfikacje, ustawienia, user */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notyfikacje">
          <Bell className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Ustawienia">
          <Settings className="size-5" />
        </Button>
        <div
          className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground transition-colors duration-200"
          title="Grażyna"
        >
          GK
        </div>
      </div>
    </header>
  );
}
