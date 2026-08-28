/**
 * Locale-independent content for the "Wyposażenie sal" scrollytelling page.
 *
 * Everything that is actual copy (headings, labels, FAQ, project rows, ...)
 * lives in `src/i18n/dictionaries/{pl,de,en}.json` under the `facilities` key
 * instead — see the component props for the corresponding types. This module
 * only keeps what doesn't change with the locale: media files and map
 * coordinates.
 *
 * WARNING: the figures carried over from the prototype (hall size, budgets,
 * project values, the qualifier's proof counters) are made up. Towards a B2B
 * client they read as a promise — replace them with real numbers before this
 * goes live.
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
/*  360° ring — hotspot placement                                            */
/* -------------------------------------------------------------------------- */

/**
 * Hotspot position over the video stage, as CSS percentages — one entry per
 * `ring360.details` item in the dictionary, matched by index.
 *
 * TODO: positions are fixed, but the clip is a camera orbit — at 180° the
 * "ropes" marker no longer sits on the ropes. Positions should become a
 * function of the rotation angle reported by `onProgress`.
 */
export const ringHotspotPositions: Array<{ left: string; top: string }> = [
  { left: "50%", top: "38%" },
  { left: "22%", top: "52%" },
  { left: "50%", top: "76%" },
  { left: "64%", top: "60%" },
];

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
