import type { LucideIcon } from "lucide-react";
import type { Dictionary } from "@/src/i18n/config";
import {
  Dumbbell,
  Building2,
  Boxes,
  Hexagon,
  ShoppingBag,
  Layers,
  Anchor,
  Shield,
  Hand,
  Target,
  Goal,
  Warehouse,
  ClipboardList,
  Wrench,
  Truck,
  Headphones,
  Factory,
  MessageSquare,
  Award,
  Star,
  Home,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Company — real bolt-sport data                                            */
/* -------------------------------------------------------------------------- */

export const company = {
  name: "bolt-sport",
  legalName: "bolt-sport sp. z o.o.",
  tagline: "Polski producent sprzętu do sportów walki",
  phone: "694 297 160",
  phoneHref: "tel:+48694297160",
  email: "biuro@bolt-sport.pl",
  emailHref: "mailto:biuro@bolt-sport.pl",
  address: {
    street: "Młyńska 14",
    city: "46-040 Krasiejów",
    country: "Polska",
  },
  registry: {
    nip: "9910542866",
    krs: "0000942323",
    regon: "520810848",
  },
  rating: {
    score: "4.9",
    scale: "5.0",
    count: 200,
  },
  experienceYears: 15,
} as const;

/* -------------------------------------------------------------------------- */
/*  Navigation                                                                */
/* -------------------------------------------------------------------------- */

/** `key` wskazuje na wpis w `nav.items` w słownikach `src/i18n/dictionaries`. */
export type NavItem = { key: keyof Dictionary["nav"]["items"]; href: string };

/**
 * UWAGA: etykiety są tłumaczone, ale slugi zostają polskie we wszystkich
 * językach (`/de/sklep`, nie `/de/shop`). Świadoma decyzja na czas PoC —
 * tłumaczenie ścieżek wymaga mapy slugów per locale w `localePath` i w `proxy.ts`.
 */

export const navItems: NavItem[] = [
  { key: "shop", href: "/sklep" },
  { key: "configurator", href: "/konfigurator" },
  { key: "bagConfigurator", href: "/konfigurator-worka" },
  { key: "facilities", href: "/#wyposazenie" },
  { key: "rings", href: "/#ringi" },
  { key: "projects", href: "/#realizacje" },
  { key: "guide", href: "/#poradnik" },
  { key: "contact", href: "/#kontakt" },
];

/* -------------------------------------------------------------------------- */
/*  Hero trust proof                                                          */
/* -------------------------------------------------------------------------- */

export type TrustChip = { label: string; icon: LucideIcon };

export const heroTrust: TrustChip[] = [
  { label: "Polski producent", icon: Factory },
  { label: "Krasiejów", icon: Warehouse },
  { label: "15-letnie doświadczenie", icon: Award },
  { label: "4.9/5 z 200 opinii", icon: Star },
];

/* -------------------------------------------------------------------------- */
/*  "Czego potrzebujesz?" — intent cards                                      */
/* -------------------------------------------------------------------------- */

export type Intent = {
  title: string;
  description: string;
  icon: LucideIcon;
  cta: string;
  href: string;
};

export const intents: Intent[] = [
  {
    title: "Kupuję sprzęt do treningu",
    description: "Worki, rękawice, tarcze i ochraniacze.",
    icon: Dumbbell,
    cta: "Przejdź do sklepu",
    href: "/sklep",
  },
  {
    title: "Wyposażam klub lub salę",
    description: "Maty, mocowania, worki i kompletne zestawy.",
    icon: Building2,
    cta: "Dobierz wyposażenie",
    href: "#wyposazenie",
  },
  {
    title: "Szukam ringu lub klatki MMA",
    description: "Produkcja, personalizacja i wycena.",
    icon: Hexagon,
    cta: "Poproś o wycenę",
    href: "#ringi",
  },
  {
    title: "Kupuję hurtowo",
    description: "Oferta dla klubów, szkół i partnerów.",
    icon: Boxes,
    cta: "Zapytaj o ofertę",
    href: "#kontakt",
  },
];

/* -------------------------------------------------------------------------- */
/*  Product highlights — real products & prices                               */
/* -------------------------------------------------------------------------- */

export type Product = {
  name: string;
  specs: string;
  category: string;
  price: string | null;
  priceNote?: string;
  tag?: string;
};

export const products: Product[] = [
  {
    name: "Worek bokserski Super",
    specs: "160 x 40 cm, 50 kg",
    category: "Worki treningowe",
    price: "349,00 zł",
    tag: "Bestseller",
  },
  {
    name: "Worek bokserski Kolos",
    specs: "180 x 45 cm, 60 kg, czerwony",
    category: "Worki treningowe",
    price: "370,00 zł",
  },
  {
    name: "Worek bokserski Super",
    specs: "140 x 40 cm, 40 kg",
    category: "Worki treningowe",
    price: "330,00 zł",
  },
  {
    name: "Materac gimnastyczny PVC T120",
    specs: "200 x 120 x 5 cm, szary",
    category: "Materace i maty",
    price: "494,00 zł",
  },
  {
    name: "Mata ProMat do sportów walki",
    specs: "4 cm — na wymiar, MMA, zapaśnicza",
    category: "Materace i maty",
    price: "220,00 zł",
    priceNote: "od",
  },
  {
    name: "Profesjonalne ringi i klatki MMA",
    specs: "Produkcja na wymiar pod Twój obiekt",
    category: "Ringi i klatki",
    price: null,
    priceNote: "Cena na telefon",
    tag: "Na zamówienie",
  },
];

/* -------------------------------------------------------------------------- */
/*  Categories                                                                */
/* -------------------------------------------------------------------------- */

export type Category = { label: string; icon: LucideIcon };

export const categories: Category[] = [
  { label: "Worki treningowe", icon: Dumbbell },
  { label: "Rękawice", icon: Hand },
  { label: "Tarcze treningowe", icon: Target },
  { label: "Ochraniacze", icon: Shield },
  { label: "Materace i maty", icon: Layers },
  { label: "Mocowania i uchwyty", icon: Anchor },
  { label: "Akcesoria treningowe", icon: ShoppingBag },
  { label: "Ringi i klatki", icon: Hexagon },
  { label: "Wyposażenie obiektów sportowych", icon: Warehouse },
  { label: "Wyposażenie boisk", icon: Goal },
];

/* -------------------------------------------------------------------------- */
/*  Facilities — kompletne wyposażenie sal                                    */
/* -------------------------------------------------------------------------- */

export type Facility = {
  title: string;
  description: string;
  icon: LucideIcon;
  items: string[];
};

export const facilities: Facility[] = [
  {
    title: "Sala bokserska",
    description: "Stanowiska workowe, ring i strefa kondycyjna.",
    icon: Dumbbell,
    items: ["Worki i mocowania", "Ring bokserski", "Tarcze i łapy", "Ochraniacze"],
  },
  {
    title: "Sala MMA",
    description: "Mata na całą powierzchnię, klatka i sprzęt do grapplingu.",
    icon: Hexagon,
    items: ["Maty ProMat", "Klatka MMA", "Worki i tarcze", "Ochraniacze"],
  },
  {
    title: "Szkoła i obiekt sportowy",
    description: "Bezpieczne wyposażenie sal gimnastycznych i obiektów.",
    icon: Building2,
    items: ["Materace gimnastyczne", "Maty ochronne", "Wyposażenie boisk", "Akcesoria"],
  },
  {
    title: "Domowa sala treningowa",
    description: "Kompaktowy zestaw do treningu w domu lub garażu.",
    icon: Home,
    items: ["Worek i mocowanie", "Mata treningowa", "Rękawice", "Akcesoria"],
  },
];

/* -------------------------------------------------------------------------- */
/*  Rings & cages — premium B2B                                               */
/* -------------------------------------------------------------------------- */

export type RingItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const ringItems: RingItem[] = [
  {
    title: "Profesjonalne ringi bokserskie",
    description: "Konstrukcje pod kluby, hale i aren walki, zgodne z wymiarami treningowymi i turniejowymi.",
    icon: Goal,
  },
  {
    title: "Profesjonalne klatki MMA",
    description: "Klatki ośmiokątne i na wymiar, z bezpiecznym wypełnieniem i siatką.",
    icon: Hexagon,
  },
  {
    title: "Maty do ringów",
    description: "Maty i pokrycia dobierane do konstrukcji ringu i sposobu użytkowania.",
    icon: Layers,
  },
  {
    title: "Produkty na wymiar",
    description: "Personalizacja wymiarów, kolorystyki i brandingu pod Twój obiekt.",
    icon: Wrench,
  },
];

/* -------------------------------------------------------------------------- */
/*  Process — jak wygląda realizacja                                          */
/* -------------------------------------------------------------------------- */

export type ProcessStep = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const processSteps: ProcessStep[] = [
  {
    title: "Konsultacja",
    description: "Poznajemy potrzeby, przeznaczenie sali i budżet.",
    icon: MessageSquare,
  },
  {
    title: "Dobór sprzętu",
    description: "Proponujemy sprzęt i układ dopasowany do obiektu.",
    icon: ClipboardList,
  },
  {
    title: "Produkcja",
    description: "Wytwarzamy produkty w naszym zakładzie w Krasiejowie.",
    icon: Factory,
  },
  {
    title: "Dostawa lub montaż",
    description: "Dostarczamy i w razie potrzeby montujemy na miejscu.",
    icon: Truck,
  },
  {
    title: "Wsparcie po zakupie",
    description: "Pomagamy w eksploatacji i uzupełnianiu wyposażenia.",
    icon: Headphones,
  },
];

/* -------------------------------------------------------------------------- */
/*  Trust section                                                             */
/* -------------------------------------------------------------------------- */

export const trustPoints: TrustChip[] = [
  { label: "Produkty wykonujemy w Krasiejowie", icon: Factory },
  { label: "Profesjonalne doradztwo", icon: Headphones },
  { label: "15-letnie doświadczenie", icon: Award },
  { label: "4.9/5 z 200 opinii", icon: Star },
];

/* -------------------------------------------------------------------------- */
/*  Poradnik — guide                                                          */
/* -------------------------------------------------------------------------- */

export type GuideArticle = {
  title: string;
  category: string;
  readingTime: string;
};

export const guideArticles: GuideArticle[] = [
  {
    title: "Jaki sprzęt zabrać na obóz sportowy? Checklista fightera",
    category: "Jak wybrać sprzęt",
    readingTime: "6 min",
  },
  {
    title: "Jak wyposażyć domową siłownię? Praktyczny przewodnik dla osób aktywnych",
    category: "Trening w domu",
    readingTime: "8 min",
  },
  {
    title: "Jak dobrać sprzęt do sali treningowej?",
    category: "Wyposażenie klubu",
    readingTime: "7 min",
  },
];

export const guideCategories: string[] = [
  "Jak wybrać sprzęt",
  "Wyposażenie klubu",
  "Bezpieczeństwo i montaż",
  "Trening w domu",
];
