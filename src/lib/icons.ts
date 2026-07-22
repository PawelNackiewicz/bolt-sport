import type { LucideIcon } from "lucide-react";
import {
  Anchor,
  Award,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Factory,
  Goal,
  Hand,
  Headphones,
  Hexagon,
  Home,
  Layers,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  Ruler,
  ShieldCheck,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Target,
  Truck,
  Warehouse,
  Wrench,
} from "lucide-react";

/**
 * Jawna whitelista ikon dostępnych dla redaktorów Storybloka.
 *
 * Pola `icon` w schemacie to wolny tekst, więc kusi `import * as Icons from
 * "lucide-react"` — ale barrel import wyłącza tree-shaking i wciąga cały pakiet
 * ikon do bundla klienta. Zamiast tego trzymamy jawną mapę: dopisanie ikony to
 * jedna linijka, a bundle rośnie tylko o to, co faktycznie używane.
 *
 * Klucze są w kebab-case — dokładnie tak, jak nazwy ikon na lucide.dev, więc
 * redaktor przepisuje nazwę ze strony 1:1.
 */
export const ICONS = {
  anchor: Anchor,
  award: Award,
  boxes: Boxes,
  "building-2": Building2,
  "check-circle-2": CheckCircle2,
  "clipboard-list": ClipboardList,
  dumbbell: Dumbbell,
  factory: Factory,
  goal: Goal,
  hand: Hand,
  headphones: Headphones,
  hexagon: Hexagon,
  home: Home,
  layers: Layers,
  "map-pin": MapPin,
  "message-square": MessageSquare,
  phone: Phone,
  "phone-call": PhoneCall,
  ruler: Ruler,
  shield: Shield,
  "shield-check": ShieldCheck,
  "shopping-bag": ShoppingBag,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  truck: Truck,
  warehouse: Warehouse,
  wrench: Wrench,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

/** Nieznana nazwa → `undefined`, komponent po prostu nie renderuje ikony. */
export function resolveIcon(name?: string): LucideIcon | undefined {
  if (!name) return undefined;
  return ICONS[name.trim().toLowerCase() as IconName];
}
