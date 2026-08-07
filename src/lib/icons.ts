import type { LucideIcon } from "lucide-react";
import {
  Factory,
  Headset,
  MessageSquare,
  Phone,
  ShoppingCart,
  Van
} from "lucide-react";

export const ICONS = {
  "messages-square": MessageSquare,
  "shopping-cart": ShoppingCart,
  "factory": Factory,
  "van": Van,
  "headset": Headset,
  "phone": Phone
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

/** Nieznana nazwa → `undefined`, komponent po prostu nie renderuje ikony. */
export function resolveIcon(name?: string): LucideIcon | undefined {
  if (!name) return undefined;
  return ICONS[name.trim().toLowerCase() as IconName];
}
