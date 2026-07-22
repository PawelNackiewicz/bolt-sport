"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "../atoms";
import { useI18n } from "@/src/i18n/i18n-provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { dictionary } = useI18n();

  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore storage failures (private mode, etc.) */
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={dictionary.nav.themeLabel}
      className={className}
    >
      <Sun className="hidden size-5 dark:block" />
      <Moon className="block size-5 dark:hidden" />
    </Button>
  );
}
