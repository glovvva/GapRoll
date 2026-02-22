"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-md border border-border hover:bg-elevated"
          aria-label="Zmień motyw"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-surface border-border min-w-[140px]"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer hover:bg-elevated"
        >
          <Sun className="mr-2 h-4 w-4 text-[#C4934A]" />
          <span>Jasny</span>
          {theme === "light" && (
            <span className="ml-auto text-[#6B9FD4] text-xs">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer hover:bg-elevated"
        >
          <Moon className="mr-2 h-4 w-4 text-[#6B9FD4]" />
          <span>Ciemny</span>
          {theme === "dark" && (
            <span className="ml-auto text-[#6B9FD4] text-xs">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer hover:bg-elevated"
        >
          <span className="mr-2 h-4 w-4 text-center text-xs">💻</span>
          <span>Systemowy</span>
          {theme === "system" && (
            <span className="ml-auto text-[#6B9FD4] text-xs">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
