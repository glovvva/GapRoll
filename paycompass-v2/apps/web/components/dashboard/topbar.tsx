"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

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
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    }
    getUser();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Notyfikacje">
          <Bell className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Ustawienia">
          <Settings className="size-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              {userEmail ?? "User"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Moje Konto</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled
              className="text-xs text-muted-foreground"
            >
              {userEmail}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Wyloguj się
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
