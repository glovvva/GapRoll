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
import { ThemeToggle } from "@/components/ui/theme-toggle";

const pathLabels: Record<string, string> = {
  "/dashboard": "Strona Główna",
  "/dashboard/data": "Data Upload",
  "/dashboard/paygap": "Analiza Luki Płacowej",
  "/dashboard/evg": "Wartościowanie Stanowisk",
  "/dashboard/report": "Raport Art. 16",
  "/dashboard/solio": "Optymalizator Budżetowy",
};

function getBreadcrumb(pathname: string): string {
  const pageName = pathLabels[pathname] ?? (pathname.replace("/dashboard", "").replace(/^\//, "").replace(/-/g, " ") ? pathname.replace("/dashboard", "").replace(/^\//, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Strona Główna");
  return `Dashboard › ${pageName}`;
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
      <p className="text-sm font-medium text-text-primary">{breadcrumb}</p>

      {/* Prawa strona - notyfikacje, ustawienia, user */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Notyfikacje">
          <Bell className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Ustawienia">
          <Settings className="size-5" />
        </Button>
        <ThemeToggle />
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
              className="text-xs text-text-secondary"
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
