# bolt-sport

Strona marki **bolt-sport** (Next.js 16, App Router, React 19, Tailwind v4, Storyblok)
wraz z **pseudo-sklepem**: katalogiem, koszykiem, checkoutem, kontem użytkownika
i zapytaniami ofertowymi B2B.

## Uruchomienie

```bash
pnpm install
pnpm dev          # http://localhost:3000 → przekierowanie na /pl
```

Wymagana zmienna w `.env.local`:

```bash
STORYBLOK_DELIVERY_API_TOKEN=...   # potrzebny dla strony głównej (CMS)
AUTH_JWT_SECRET=...                # opcjonalny w dev, WYMAGANY na produkcji
```

Bez `AUTH_JWT_SECRET` w trybie deweloperskim używany jest stały sekret zastępczy.
W produkcji jego brak powoduje błąd przy pierwszym użyciu tokenu — celowo, żeby
nie podpisywać sesji losowym kluczem ginącym przy restarcie.

## ⚠️ Dane są ulotne (mock)

**Sklep nie ma bazy danych.** Cały stan żyje w pamięci procesu Node:

| Dane | Zachowanie przy restarcie serwera |
|---|---|
| Produkty i kategorie | wczytywane od nowa z `src/lib/db/seed/*.json` |
| Użytkownicy | **kasowane** — zostaje tylko konto testowe z seeda |
| Koszyki | **kasowane** |
| Zamówienia | **kasowane** — zostają 3 przykładowe z seeda |
| Tokeny resetu hasła | **kasowane** |
| Zapytania ofertowe | **kasowane** |

Store jest przypięty do `globalThis`, więc przeżywa hot reload w devie, ale nie
restart procesu. Wymiana na prawdziwą bazę to podmiana plików w
`src/lib/db/repositories/*` — reszta aplikacji korzysta wyłącznie z repozytoriów
o asynchronicznym interfejsie.

### Konto testowe

```
test@bolt-sport.pl / Test1234!
```

Ma przypisane 3 przykładowe zamówienia (`RS-2026-000001` … `000003`).

### Co jeszcze jest zamockowane

- **Płatności** — brak bramki. `paymentMethod: "card"` ustawia status `paid`
  od razu, `transfer` i `cod` zostawiają `pending`.
- **Reset hasła** — brak SMTP. Link z tokenem trafia do konsoli serwera, a poza
  produkcją także do odpowiedzi (`devToken`, `devLink`) i na ekran formularza.
- **Zapytania ofertowe** — zapisywane w pamięci i logowane do konsoli.
- **Dostawa** — 25,00 zł, gratis od 500,00 zł. Bez terminów i nazw kurierów.
- **Rate limiting** — licznik w pamięci procesu, nie współdzielony między instancjami.
- **Zdjęcia produktów** — lokalne placeholdery SVG w `public/products/`.
  Zero zewnętrznych requestów w runtime.

Wszystkie produkty **poza pięcioma** (trzy worki Super/Kolos, materac PVC T120,
mata ProMat) to wymyślone dane demo, realistyczne dla branży.

## Architektura

```
app/[lang]/…              strony sklepu (locale w ścieżce: /pl, /de, /en)
app/api/…                 Route Handlers
proxy.ts                  redirect locale + bramka /konto/**
src/lib/shop/             typy domenowe, koszyk, formatowanie cen
src/lib/db/               store w pamięci, repozytoria, seed JSON
src/lib/auth/             bcrypt, JWT (jose), cookies, sesja
src/lib/api/              koperta odpowiedzi, kody błędów, rate limit
src/lib/validation/       schematy zod współdzielone przez API i formularze
src/components/shop/      komponenty sklepu
```

Kilka decyzji, które warto znać przed wejściem w kod:

- **`proxy.ts`, nie `middleware.ts`.** Next 16 zmienił nazwę tej konwencji;
  plik może być tylko jeden, więc bramka `/konto/**` została dołożona do
  istniejącego proxy odpowiedzialnego za locale.
- **Wszystkie trasy są pod `/[lang]`.** Proxy przekierowuje `/sklep` → `/pl/sklep`,
  więc trasa bez prefiksu byłaby nieosiągalna.
- **Schematy zod zwracają klucze komunikatów, nie zdania.** Ten sam schemat
  obsługuje polskie API i trójjęzyczny frontend: API tłumaczy klucz na polski,
  UI na aktywny język (`src/lib/shop/i18n-helpers.ts`).
- **API zwraca stabilne `code` błędu.** Frontend mapuje kod na własny komunikat,
  dzięki czemu nie ma duplikacji treści między warstwami.
- **Koszyk ładuje się po stronie klienta.** Odczyt ciasteczka koszyka w layoucie
  przełączyłby całą stronę (łącznie z istniejącą stroną główną) na rendering
  dynamiczny — `/[lang]` pozostaje SSG.
- **Pozycje zamówienia to snapshoty.** Zmiana nazwy lub ceny produktu nie
  przepisuje historii zamówień.
- **Seed jest parsowany zodem przy starcie** (`src/lib/db/seed-schema.ts`) —
  literówka w JSON-ie ujawnia się od razu.

### Produkty „Cena na telefon"

Ringi i klatki MMA mają `price: null` i `pricingMode: "quote"`. Nie da się ich
dodać do koszyka (API zwraca `400 PRODUCT_NOT_PURCHASABLE`), a na karcie produktu
zamiast „Dodaj do koszyka" pojawia się CTA „Zapytaj o wycenę" z formularzem.

## API

Każda odpowiedź ma jeden z dwóch kształtów:

```jsonc
{ "data": <T>, "meta"?: { "page": 1, "perPage": 12, "total": 52, "totalPages": 5 } }
{ "error": { "code": "VALIDATION_ERROR", "message": "…", "fields"?: { "email": "…" } } }
```

Kody błędów: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`,
`CONFLICT`, `INVALID_CREDENTIALS`, `EMAIL_TAKEN`, `TOKEN_INVALID`, `TOKEN_EXPIRED`,
`INSUFFICIENT_STOCK`, `PRODUCT_NOT_PURCHASABLE`, `CART_EMPTY`, `RATE_LIMITED`,
`INTERNAL_ERROR`.

### Autoryzacja

| Metoda | Ścieżka | Opis |
|---|---|---|
| POST | `/api/auth/register` | tworzy konto, loguje, scala koszyk gościa *(limit 5/10 min)* |
| POST | `/api/auth/login` | loguje i **scala koszyk gościa z koszykiem konta** |
| POST | `/api/auth/logout` | czyści ciasteczka sesji (koszyk zostaje) |
| GET | `/api/auth/me` | zalogowany użytkownik albo `401` |
| POST | `/api/auth/refresh` | odświeża access token |
| POST | `/api/auth/password/forgot` | **zawsze 200** *(limit 5/10 min)* |
| POST | `/api/auth/password/reset` | ustawia hasło, unieważnia token i wszystkie sesje |
| POST | `/api/auth/password/change` | wymaga sesji |

Ciasteczka `rs_access` (15 min) i `rs_refresh` (7 dni) — `httpOnly`,
`sameSite: lax`, `secure` na produkcji.

Unieważnianie sesji opiera się na `sessionsValidFrom` porównywanym z czasem
wydania tokenu **z dokładnością do milisekundy** (własny claim `ims`) — standardowy
`iat` ma rozdzielczość sekundową, przez co reset hasła wykonany w tej samej
sekundzie co logowanie nie unieważniłby starego tokenu.

### Katalog, koszyk, zamówienia, wyceny

| Metoda | Ścieżka | Opis |
|---|---|---|
| GET | `/api/products` | `q`, `category`, `minPrice`, `maxPrice`, `tags`, `inStock`, `sort`, `page`, `perPage` |
| GET | `/api/products/[slug]` | produkt + 4 powiązane + kategoria |
| GET | `/api/categories` | kategorie z liczbą produktów |
| GET | `/api/cart` | koszyk z produktami, podsumowaniem i `warnings[]` |
| POST | `/api/cart/items` | `{ productId, quantity }` |
| PATCH | `/api/cart/items/[itemId]` | `{ quantity }` — `0` usuwa pozycję |
| DELETE | `/api/cart/items/[itemId]` | usuwa pozycję |
| DELETE | `/api/cart` | czyści koszyk |
| POST | `/api/orders` | checkout (także dla gościa) |
| GET | `/api/orders` | historia zamówień zalogowanego użytkownika |
| GET | `/api/orders/[id]` | szczegóły; `403` przy cudzym zamówieniu |
| POST | `/api/quotes` | zapytanie ofertowe *(limit 5/10 min)* |

Ceny są liczbami całkowitymi **w groszach**. `sort`: `price-asc`, `price-desc`,
`newest`, `name-asc`. `perPage` domyślnie 12, maksymalnie 48.

Koszyk jest re-walidowany przy każdym odczycie: znikające produkty są usuwane,
ilości przycinane do stanu magazynowego, a zmiany raportowane w `warnings[]`.

### Przykłady `curl`

```bash
BASE=http://localhost:3000/api

# katalog z filtrami
curl -s "$BASE/products?category=worki-bokserskie&sort=price-asc&perPage=3"
curl -s "$BASE/categories"
curl -s "$BASE/products/worek-bokserski-super-160x40-50kg"

# logowanie (ciasteczka trzymamy w pliku)
curl -s -c jar.txt -b jar.txt -X POST "$BASE/auth/login" \
  -H 'content-type: application/json' \
  -d '{"email":"test@bolt-sport.pl","password":"Test1234!"}'

# koszyk
curl -s -c jar.txt -b jar.txt -X POST "$BASE/cart/items" \
  -H 'content-type: application/json' -d '{"productId":"p-001","quantity":2}'
curl -s -c jar.txt -b jar.txt "$BASE/cart"

# produkt "na telefon" -> 400 PRODUCT_NOT_PURCHASABLE
curl -s -X POST "$BASE/cart/items" \
  -H 'content-type: application/json' -d '{"productId":"p-039","quantity":1}'

# checkout (card -> od razu "paid")
curl -s -c jar.txt -b jar.txt -X POST "$BASE/orders" \
  -H 'content-type: application/json' -d '{
    "customer":{"email":"test@bolt-sport.pl","firstName":"Jan","lastName":"Testowy","phone":"600100200"},
    "shippingAddress":{"street":"Kwiatowa 8","postalCode":"45-064","city":"Opole","country":"Polska"},
    "paymentMethod":"card"
  }'

curl -s -c jar.txt -b jar.txt "$BASE/orders"

# reset hasła — token wraca w odpowiedzi poza produkcją
curl -s -X POST "$BASE/auth/password/forgot" \
  -H 'content-type: application/json' -d '{"email":"test@bolt-sport.pl"}'

# zapytanie ofertowe
curl -s -X POST "$BASE/quotes" -H 'content-type: application/json' -d '{
  "name":"Klub Sportowy","email":"klub@example.com","phone":"600100200",
  "message":"Prosze o wycene ringu 6x6 do naszej sali.","type":"ring"
}'
```

## Strony

| Ścieżka | Opis |
|---|---|
| `/[lang]/sklep` | listing — filtry, sortowanie i paginacja **w URL** |
| `/[lang]/sklep/[slug]` | karta produktu |
| `/[lang]/koszyk` | koszyk |
| `/[lang]/zamowienie` | checkout (także jako gość) |
| `/[lang]/zamowienie/potwierdzenie/[id]` | potwierdzenie |
| `/[lang]/logowanie`, `/rejestracja`, `/przypomnij-haslo`, `/ustaw-nowe-haslo` | auth |
| `/[lang]/konto`, `/konto/zamowienia`, `/konto/zamowienia/[id]` | konto (chronione) |

## Weryfikacja

```bash
npx tsc --noEmit
npx eslint .
pnpm build
```

Uwaga: `notFound()` na stronie produktu zwraca HTTP **200**, nie 404. To
udokumentowane zachowanie Next.js — odpowiedź jest strumieniowana (obecność
`loading.tsx` otwiera granicę Suspense), więc nagłówki są już wysłane i status
nie może się zmienić. Next dokłada wtedy `<meta name="robots" content="noindex">`,
co zabezpiecza indeksowanie. Ścieżki niepasujące do żadnej trasy nadal zwracają 404.
