/**
 * Content for the "Wyposażenie sal" scrollytelling page (`/[lang]/wyposazenie-sal`).
 *
 * Polish only for now — the page renders the same copy under every locale.
 * When DE/EN land, this module is the seam: move the strings into
 * `src/i18n/dictionaries` and keep the shapes below as the dictionary types.
 *
 * WARNING: the figures carried over from the prototype (hall size, budgets,
 * project values, the "41 obiektów w tym przedziale" counters) are made up.
 * Towards a B2B client they read as a promise — replace them with real numbers
 * before this goes live.
 */

/* -------------------------------------------------------------------------- */
/*  Media                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Clips are re-encoded so that EVERY frame is a keyframe (`keyint=1`).
 * Without that, scrubbing by `currentTime` stutters beyond repair.
 */
type FacilitiesMedia = {
  heroVideo: string;
  heroParts: string[];
  heroPoster: string;
  ring360: string;
  ringPoster: string;
  closeVideo: string;
  closePoster: string;
};

export const facilitiesMedia: FacilitiesMedia = {
  /** Single concatenated hero file. Empty = play `heroParts` back to back. */
  heroVideo: "",
  heroParts: [
    // MISSING: '/media/hero-01-drzwi.mp4' — the opening-doors clip.
    "/media/hero-02-worki.mp4",
    "/media/hero-03-ring.mp4",
    "/media/hero-04-logo.mp4",
  ],
  heroPoster: "/media/poster-hero.jpg",

  ring360: "/media/ring-360.mp4",
  ringPoster: "/media/poster-ring.jpg",

  closeVideo: "/media/hero-04-logo.mp4",
  closePoster: "/media/poster-close.jpg",
};

/* -------------------------------------------------------------------------- */
/*  Contact                                                                   */
/* -------------------------------------------------------------------------- */

/** Phone, e-mail and address come from `company` in `site-data.ts`. */
export const officeHours = "Pn–Pt 7:00–16:00";

/* -------------------------------------------------------------------------- */
/*  Stats bar                                                                 */
/* -------------------------------------------------------------------------- */

export type StatCell = {
  value: string;
  /** Set to animate the number counting up; otherwise `value` is static. */
  countTo?: number;
  suffix?: string;
  label: string;
};

export const facilityStats: StatCell[] = [
  { value: "15", countTo: 15, label: "lat na rynku" },
  { value: "200+", countTo: 200, suffix: "+", label: "wyposażonych obiektów" },
  { value: "PL", label: "montaż w całej Polsce" },
  { value: "50–300", label: "tys. zł netto — typowy projekt" },
];

/* -------------------------------------------------------------------------- */
/*  Assembly — five stages                                                    */
/* -------------------------------------------------------------------------- */

export type AssemblyStep = {
  stage: string;
  title: string;
  description: string;
};

export const assemblySteps: AssemblyStep[] = [
  {
    stage: "Etap 01",
    title: "Pomiar i inwentaryzacja",
    description:
      "Przyjeżdżamy na miejsce. Mierzymy wysokość w świetle, rozstaw słupów, przebiegi instalacji i realną nośność stropu. Z tego powstaje rysunek, na którym pracuje produkcja — nie z Twojego rzutu w PDF.",
  },
  {
    stage: "Etap 02",
    title: "Maty i podłoga",
    description:
      "Dobór grubości i twardości pod dyscyplinę: inna mata pod zapasy i grappling, inna pod stójkę. Docinamy na wymiar sali, bez pasów odpadów przy ścianach.",
  },
  {
    stage: "Etap 03",
    title: "Mocowania i konstrukcja",
    description:
      "Wsporniki worków, ramy naścienne, podwieszenia. Każdy punkt kotwiony zgodnie z tym, co faktycznie jest w ścianie — beton, pustak, żelbet — i opisany w dokumentacji powykonawczej.",
  },
  {
    stage: "Etap 04",
    title: "Ring lub klatka",
    description:
      "Montaż podestu, konstrukcji, lin lub siatki. Ring stawiamy i poziomujemy na miejscu; klatkę składamy z segmentów, które przejdą przez Twoje drzwi.",
  },
  {
    stage: "Etap 05",
    title: "Odbiór i dokumentacja",
    description:
      "Test obciążeniowy mocowań, protokół odbioru, karty produktów i gwarancje. Pokazujemy, jak rozkręcić i złożyć to, co będziecie ruszać sami.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Production site — Krasiejów                                               */
/* -------------------------------------------------------------------------- */

export const productionMeta: Array<[label: string, value: string]> = [
  ["Hala produkcyjna", "1 400 m²"],
  ["Ekipy montażowe", "3 zespoły"],
  ["Typowy termin", "4–8 tygodni"],
  ["Zasięg montażu", "Cała Polska"],
];

/* -------------------------------------------------------------------------- */
/*  Facility types                                                            */
/* -------------------------------------------------------------------------- */

export type FacilityType = {
  kind: string;
  title: string;
  description: string;
  budget: string;
};

export const facilityTypes: FacilityType[] = [
  {
    kind: "Typ 01",
    title: "Klub bokserski",
    description:
      "Ring 5×5 lub 6×6, ściana worków, maty na całą powierzchnię treningową, lustra i drabinki. Najczęstszy pierwszy projekt klubu, który wychodzi z wynajmowanej salki.",
    budget: "50–110 tys. zł",
  },
  {
    kind: "Typ 02",
    title: "Klub MMA",
    description:
      "Klatka ośmiokątna 6–8 m, strefa grapplingu z matą 40 mm, worki wolnostojące i naścienne. Częściej niż w boksie liczy się rozbieralność — kluby przenoszą się co kilka lat.",
    budget: "90–180 tys. zł",
  },
  {
    kind: "Typ 03",
    title: "Obiekt sportowy i szkoła",
    description:
      "Wyposażenie pod użytkowanie zmianowe i kontrolę zarządcy: atesty, dokumentacja przetargowa, sprzęt składany i chowany. Rozliczenie z odroczonym terminem płatności.",
    budget: "70–200 tys. zł",
  },
  {
    kind: "Typ 04",
    title: "Arena zawodów",
    description:
      "Ring lub klatka gali, podest podwyższony, bandy sponsorskie, transport i montaż na miejscu w oknie 24 godzin. Wynajem albo zakup — zależnie od cyklu wydarzeń.",
    budget: "150–300 tys. zł",
  },
];

/* -------------------------------------------------------------------------- */
/*  360° ring details                                                         */
/* -------------------------------------------------------------------------- */

export type RingDetail = {
  label: string;
  title: string;
  description: string;
  spec: Record<string, string>;
  /** Hotspot position over the video stage, as CSS percentages. */
  position: { left: string; top: string };
};

/**
 * TODO: hotspot positions are fixed, but the clip is a camera orbit — at 180°
 * the "liny" marker no longer sits on the ropes. Positions should become a
 * function of the rotation angle reported by `onProgress`.
 */
export const ringDetails: RingDetail[] = [
  {
    label: "Detal 01",
    title: "Liny",
    description:
      "Rdzeń stalowy w powłoce poliuretanowej, obszyty bawełnianym rękawem. Nie „siada” po sezonie i nie ściera skóry na przedramieniu tak jak goła plandeka.",
    spec: {
      Materiał: "Stal ⌀8 mm + PU + bawełna",
      Napinacze: "Śruby rzymskie M16, stal ocynk",
      Kolory: "Czerwony · biały · niebieski",
    },
    position: { left: "50%", top: "38%" },
  },
  {
    label: "Detal 02",
    title: "Narożnik",
    description:
      "Słupek ze stali konstrukcyjnej z osłoną z pianki wysokoelastycznej w powłoce PVC. Na osłonie nadruk — logo klubu, sponsora albo nasze.",
    spec: {
      Słupek: "Stal S235, ⌀102 mm",
      Osłona: "Pianka HR 60 mm + PVC 650 g",
      Nadruk: "Sitodruk, odporny na pot i UV",
    },
    position: { left: "22%", top: "52%" },
  },
  {
    label: "Detal 03",
    title: "Podest",
    description:
      "Rama skręcana z profili zamkniętych, płyta OSB 22 mm i pianka amortyzująca pod płótnem. Rozbieralny — wchodzi przez standardowe drzwi.",
    spec: {
      Rama: "Profil 60×40×3 mm",
      Poszycie: "OSB 22 mm + pianka 30 mm",
      Wysokość: "20 / 60 / 100 cm",
    },
    position: { left: "50%", top: "76%" },
  },
  {
    label: "Detal 04",
    title: "Mata",
    description:
      "Płótno ringowe na piance o kontrolowanym powrocie — dość miękkie, żeby padać, dość twarde, żeby pracować nogami. Antypoślizgowe i zmywalne.",
    spec: {
      Płótno: "PCV 900 g, antypoślizgowe",
      Pianka: "30 mm, gęstość 200 kg/m³",
      Kolor: "Czerń, opcjonalne pasy",
    },
    position: { left: "64%", top: "60%" },
  },
];

/* -------------------------------------------------------------------------- */
/*  Recent projects                                                           */
/* -------------------------------------------------------------------------- */

export type ProjectRow = {
  city: string;
  scope: string;
  area: string;
  value: string;
};

export const projectRows: ProjectRow[] = [
  {
    city: "Opole",
    scope: "Klub bokserski — ring 6×6, ściana worków",
    area: "240 m²",
    value: "96 tys. zł",
  },
  {
    city: "Katowice",
    scope: "Klub MMA — klatka 8 m, strefa grapplingu",
    area: "410 m²",
    value: "178 tys. zł",
  },
  {
    city: "Wrocław",
    scope: "Hala miejska — wyposażenie zmianowe",
    area: "620 m²",
    value: "204 tys. zł",
  },
  {
    city: "Lublin",
    scope: "Szkoła sportowa — maty, worki, drabinki",
    area: "180 m²",
    value: "71 tys. zł",
  },
  {
    city: "Gdynia",
    scope: "Arena gali — ring podwyższony, bandy",
    area: "900 m²",
    value: "286 tys. zł",
  },
  {
    city: "Rzeszów",
    scope: "Klub bokserski — ring 5×5, maty",
    area: "150 m²",
    value: "58 tys. zł",
  },
];

export const beforeAfter = {
  before: "Przed — hala magazynowa, 340 m²",
  after: "Po — klub MMA, klatka 8 m + strefa grapplingu",
  caption: "Ruda Śląska · 2025",
  hint: "Przeciągnij, żeby porównać",
};

/* -------------------------------------------------------------------------- */
/*  Coverage map — cities with completed installs                             */
/* -------------------------------------------------------------------------- */

/** `[name, longitude, latitude, isReference]` */
export type MapCity = [name: string, lon: number, lat: number, big: boolean];

export const mapCities: MapCity[] = [
  ["Warszawa", 21.01, 52.23, true],
  ["Kraków", 19.94, 50.06, true],
  ["Łódź", 19.46, 51.76, true],
  ["Wrocław", 17.03, 51.11, true],
  ["Poznań", 16.93, 52.41, true],
  ["Gdańsk", 18.65, 54.35, true],
  ["Szczecin", 14.55, 53.43, true],
  ["Katowice", 19.02, 50.26, true],
  ["Lublin", 22.57, 51.25, true],
  ["Białystok", 23.16, 53.13, false],
  ["Bydgoszcz", 18.0, 53.12, false],
  ["Toruń", 18.6, 53.01, false],
  ["Rzeszów", 22.0, 50.04, true],
  ["Kielce", 20.63, 50.87, false],
  ["Olsztyn", 20.49, 53.78, false],
  ["Opole", 17.93, 50.67, true],
  ["Gdynia", 18.53, 54.52, true],
  ["Zielona Góra", 15.51, 51.94, false],
  ["Gorzów Wlkp.", 15.24, 52.74, false],
  ["Częstochowa", 19.12, 50.81, false],
  ["Radom", 21.15, 51.4, false],
  ["Sosnowiec", 19.13, 50.29, false],
  ["Gliwice", 18.67, 50.3, false],
  ["Zabrze", 18.79, 50.3, false],
  ["Bytom", 18.92, 50.35, false],
  ["Ruda Śląska", 18.86, 50.26, true],
  ["Rybnik", 18.55, 50.1, false],
  ["Tychy", 18.99, 50.13, false],
  ["Bielsko-Biała", 19.05, 49.82, false],
  ["Nowy Sącz", 20.7, 49.62, false],
  ["Tarnów", 20.99, 50.01, false],
  ["Legnica", 16.16, 51.21, false],
  ["Wałbrzych", 16.28, 50.78, false],
  ["Kalisz", 18.09, 51.76, false],
  ["Konin", 18.25, 52.22, false],
  ["Płock", 19.71, 52.55, false],
  ["Elbląg", 19.4, 54.16, false],
  ["Słupsk", 17.03, 54.46, false],
  ["Koszalin", 16.18, 54.19, false],
  ["Piła", 16.74, 53.15, false],
  ["Ostrołęka", 21.57, 53.09, false],
  ["Siedlce", 22.29, 52.17, false],
  ["Chełm", 23.47, 51.14, false],
  ["Zamość", 23.25, 50.72, false],
  ["Przemyśl", 22.77, 49.78, false],
  ["Jelenia Góra", 15.73, 50.9, false],
  ["Ostrów Wlkp.", 17.81, 51.65, false],
];

/* -------------------------------------------------------------------------- */
/*  Process — from phone call to handover                                     */
/* -------------------------------------------------------------------------- */

export type ProcessPhase = {
  number: string;
  title: string;
  description: string;
  duration: string;
};

export const processPhases: ProcessPhase[] = [
  {
    number: "01",
    title: "Konsultacja",
    description:
      "Rozmowa o dyscyplinie, liczbie trenujących i tym, co już macie. Kończy się listą sprzętu, nie ofertą.",
    duration: "1 dzień",
  },
  {
    number: "02",
    title: "Wizja lokalna",
    description:
      "Pomiar sali, sprawdzenie stropu i ścian, zdjęcia. Bezpłatna w całej Polsce.",
    duration: "do 10 dni",
  },
  {
    number: "03",
    title: "Produkcja",
    description:
      "Spawanie, tapicerka, lakierowanie w Krasiejowie. Zdjęcia postępu co tydzień.",
    duration: "3–6 tygodni",
  },
  {
    number: "04",
    title: "Montaż",
    description:
      "Wejście ekipy, składanie i kotwienie na miejscu. Typowa sala — dwa dni.",
    duration: "1–4 dni",
  },
  {
    number: "05",
    title: "Odbiór",
    description:
      "Test mocowań, protokół, gwarancje, instruktaż. Serwis w 48 h w całym kraju.",
    duration: "ten sam dzień",
  },
];

/* -------------------------------------------------------------------------- */
/*  Qualifier — four questions                                                */
/* -------------------------------------------------------------------------- */

export type QualifierOption = {
  eyebrow: string;
  label: string;
  /** Social-proof counter shown after picking this budget bracket. */
  proofCount?: number;
};

export type QualifierQuestion = {
  group: "typ" | "metraz" | "budzet";
  legend: string;
  options: QualifierOption[];
};

export const qualifierSteps = [
  "Typ obiektu",
  "Metraż",
  "Budżet",
  "Kontakt",
] as const;

export const qualifierQuestions: QualifierQuestion[] = [
  {
    group: "typ",
    legend: "Co wyposażasz?",
    options: [
      { eyebrow: "Typ 01", label: "Klub bokserski" },
      { eyebrow: "Typ 02", label: "Klub MMA" },
      { eyebrow: "Typ 03", label: "Obiekt sportowy lub szkoła" },
      { eyebrow: "Typ 04", label: "Arena zawodów" },
    ],
  },
  {
    group: "metraz",
    legend: "Jaka powierzchnia?",
    options: [
      { eyebrow: "Metraż", label: "do 150 m²" },
      { eyebrow: "Metraż", label: "150–300 m²" },
      { eyebrow: "Metraż", label: "300–600 m²" },
      { eyebrow: "Metraż", label: "powyżej 600 m²" },
    ],
  },
  {
    group: "budzet",
    legend: "Jaki budżet netto?",
    options: [
      { eyebrow: "Budżet", label: "50–100 tys. zł", proofCount: 41 },
      { eyebrow: "Budżet", label: "100–150 tys. zł", proofCount: 37 },
      { eyebrow: "Budżet", label: "150–220 tys. zł", proofCount: 14 },
      { eyebrow: "Budżet", label: "220–300 tys. zł", proofCount: 9 },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

export type FaqEntry = { question: string; answer: string };

export const facilitiesFaq: FaqEntry[] = [
  {
    question: "Czy mój strop uniesie ring i podwieszane worki?",
    answer:
      "Na wizji lokalnej sprawdzamy typ stropu i dostępną dokumentację budynku. Ring rozkłada obciążenie na całą powierzchnię podestu i w praktyce rzadko bywa problemem; podwieszane worki — częściej. Jeśli strop nie daje pewności, przechodzimy na konstrukcje wolnostojące albo ramy przenoszące obciążenie na ściany nośne. Nie montujemy „na oko” i nie prosimy klienta, żeby wziął to ryzyko na siebie.",
  },
  {
    question: "Faktura z odroczonym terminem płatności — możliwe?",
    answer:
      "Tak. Standardowo pracujemy na zaliczce i płatności końcowej po odbiorze. Dla jednostek samorządowych, szkół i obiektów miejskich stosujemy odroczenie 30 lub 60 dni bez zaliczki, na podstawie umowy lub zamówienia publicznego.",
  },
  {
    question: "Przygotujecie dokumentację do przetargu?",
    answer:
      "Tak. Dostarczamy opis przedmiotu zamówienia, karty techniczne, atesty i certyfikaty materiałowe oraz kosztorys w układzie wymaganym przez zamawiającego. Opisy przygotowujemy równoważnie, bez wskazywania na konkretny produkt, żeby postępowanie nie zostało zakwestionowane.",
  },
  {
    question: "Sala ma nietypowy kształt i niską wysokość. Da się coś zrobić?",
    answer:
      "Zwykle tak. Produkujemy u siebie, więc wymiar ringu, wysokość słupków i długość ram to zmiana w rysunku, nie osobne zlecenie u zewnętrznego producenta. Przy niskim suficie schodzimy z podwieszeń na konstrukcje naścienne i wolnostojące — z reguły kończy się to lepszym wykorzystaniem sali niż w pierwotnym planie.",
  },
  {
    question: "Ile realnie trwa całość?",
    answer:
      "Od podpisu do odbioru zwykle 4–8 tygodni: 3–6 tygodni produkcji i 1–4 dni montażu. Termin podajemy po pomiarze, nie przed. Jeśli macie sztywną datę otwarcia lub gali, mówimy od razu, czy się w nią mieścimy.",
  },
  {
    question: "Dojedziecie na drugi koniec Polski?",
    answer:
      "Tak — montujemy w całej Polsce własnymi ekipami, bez podwykonawców. Dojazd, nocleg i sprzęt montażowy są wliczone w wycenę, niezależnie od odległości od Krasiejowa. Serwis gwarancyjny realizujemy w 48 godzin.",
  },
];
