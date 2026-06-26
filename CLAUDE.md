# CLAUDE.md — Zakupowo

## Projekt

**Zakupowo** — wspólna lista zakupów dla pary. PWA (Progressive Web App), mobile-first, po polsku, z real-time synchronizacją.

> **Status: dostarczony i w użyciu.** Aplikacja jest live na https://zakupowo-28267.web.app i używana na co dzień. Tygodniowe planowanie posiłków jest zaimplementowane lokalnie i oczekuje na test Firestore oraz osobny deploy. Aktualizacje: `npm run deploy`.

### Użytkownicy

Dwoje ludzi (para). Mix iPhone + Android. Appka działa w przeglądarce — zero instalacji ze sklepu. Nie projektujemy pod wielu użytkowników — to prywatna appka dla 2 osób.

### Stack technologiczny

- **Frontend:** React 18+ z Vite, Tailwind CSS 3+
- **Backend/Sync:** Firebase (Firestore jako baza + Firebase Hosting do deploy)
- **Język kodu:** TypeScript (preferowany) lub JavaScript
- **PWA:** Service Worker + Web App Manifest (instalowalna na ekranie głównym)
- **Linting:** ESLint + Prettier

### Struktura katalogów (stan rzeczywisty)

```
Zakupowo/
├── CLAUDE.md
├── PROGRESS.md
├── README.md
├── package.json
├── vite.config.ts            # Vite + vite-plugin-pwa (manifest + SW)
├── tailwind.config.ts        # darkMode: 'class'
├── tsconfig.json
├── postcss.config.js
├── firebase.json             # Hosting + SPA rewrite + cache headers
├── .firebaserc               # project ID
├── index.html                # zawiera anti-FOUC inline script (dark mode)
├── scripts/
│   └── generate-icons.mjs    # PNG z public/icon.svg przez sharp
├── public/
│   ├── icon.svg              # źródłowa ikona (gradient indigo→violet, "Z" jako path)
│   ├── icons/                # icon-192.png, icon-512.png (maskable), apple-touch-icon.png
│   └── manifest.json
├── src/
│   ├── main.tsx
│   ├── App.tsx               # routing zakładek (list/templates/historia/statystyki/gazetka)
│   ├── firebase.ts           # Firebase v10 + persistentLocalCache (offline-first)
│   ├── index.css             # Tailwind + keyframes (checkbox pop, slide-in)
│   ├── components/
│   │   ├── Header.tsx                # tytuł + przełącznik dark mode
│   │   ├── AddProduct.tsx            # pole szybkiego dodawania + autouzupełnianie
│   │   ├── ProductItem.tsx
│   │   ├── ShoppingList.tsx          # przełączanie widoków + sekcja "Kupione"
│   │   ├── CategoryListView.tsx      # grupowanie po kategoriach
│   │   ├── DayListView.tsx           # grupowanie po dniach i posiłkach
│   │   ├── DayPickerModal.tsx        # mobilny wybór wielu dni
│   │   ├── ListViewToggle.tsx        # przełącznik Kategorie / Dni
│   │   ├── Suggestions.tsx           # "Może potrzebujesz?"
│   │   ├── Templates.tsx             # szablony przepisów
│   │   ├── TemplateEditor.tsx        # tworzenie/edycja szablonów
│   │   ├── History.tsx               # historia zakupów
│   │   ├── Statistics.tsx            # statystyki (Recharts)
│   │   └── BottomNav.tsx             # dolna nawigacja (5 zakładek)
│   ├── hooks/
│   │   ├── useShoppingList.ts        # CRUD + real-time onSnapshot
│   │   ├── useProducts.ts            # baza znanych produktów + purchaseCount
│   │   ├── useSuggestions.ts
│   │   ├── useTemplates.ts           # CRUD + soft-delete defaultów + useCount
│   │   ├── useMealPlans.ts           # plany posiłków + atomowe sprzątanie
│   │   ├── useHistory.ts             # zapis/odczyt zamkniętych list
│   │   ├── useStatistics.ts          # agregacje pod wykresy
│   │   └── useTheme.ts               # dark mode (localStorage)
│   ├── types/
│   │   └── index.ts                  # Product, Template, ActiveTab, ...
│   └── data/
│       ├── categories.ts             # 21 kategorii + ikony + kolory (źródło prawdy)
│       ├── weekdays.ts               # kolejność dni i obliczanie efektywnych tagów
│       ├── defaultProducts.ts        # baza popularnych produktów PL
│       └── defaultTemplates.ts       # 46 gotowych szablonów przepisów
└── tasks/
    ├── todo.md                       # plan i postęp
    └── lessons.md                    # wnioski z budowy
```

> Uwaga: zakładka **Gazetka** to nie osobny komponent — jest renderowana inline w `App.tsx` jako link wychodzący (zob. funkcja #6 niżej). Nie ma katalogów `utils/` ani `styles/` — logika sugestii żyje w hookach, style w `index.css` + Tailwind.

---

## Funkcjonalności — specyfikacja

### 1. Lista zakupów (rdzeń appki)

- Dodawanie produktów na aktywną listę
- Odhaczanie produktów (checkbox z animacją — produkt przesuwa się na dół listy w sekcję "Kupione")
- Edycja nazwy/ilości produktu inline (tap → edytuj)
- Usuwanie produktu (swipe left lub ikona kosza)
- Produkty **automatycznie grupowane po kategoriach** (nabiał, warzywa/owoce, pieczywo, mięso/ryby, chemia, napoje, mrożonki, przekąski, przyprawy, inne)
- Każda kategoria ma swoją **ikonkę emoji** i **kolor akcentowy**
- Real-time sync przez Firestore — oboje widzą zmiany natychmiast
- Możliwość wyczyszczenia listy po zakupach (z opcją przeniesienia do historii)

### 2. Inteligentne sugestie — "Może potrzebujesz?"

- Sekcja na górze ekranu głównego
- Wyświetla produkty kupowane regularnie, których nie ma na aktualnej liście
- Algorytm: produkt kupiony ≥3 razy w historii + nie kupiony w ciągu ostatnich X dni (X = średni interwał między zakupami tego produktu × 1.2)
- **One-tap dodawanie** — tapnięcie = produkt ląduje na liście
- Maksymalnie 6-8 sugestii widocznych (scrollowalne chipsy/pills)

### 3. Szybkie dodawanie z autouzupełnianiem

- Pole tekstowe na górze listy
- Podpowiedzi z: (a) bazy popularnych produktów, (b) wcześniej kupowanych produktów
- Po wybraniu — automatyczne przypisanie do kategorii
- Możliwość podania ilości (np. "Mleko x2" lub "Jabłka 1kg")

### 4. Szablony przepisów/zestawów

- **Gotowe szablony na start** (~15-20 popularnych dań polskiej kuchni + kilka uniwersalnych):
  - Spaghetti bolognese → makaron, sos pomidorowy/passata, mięso mielone, cebula, marchewka, czosnek
  - Naleśniki → mąka, mleko, jajka, masło, szczypta soli
  - Schabowy z ziemniakami → schab, bułka tarta, jajka, mąka, ziemniaki, surówka z kapusty
  - Rosół → kurczak, marchewka, pietruszka, seler, lubczyk, makaron
  - Jajecznica na śniadanie → jajka, masło, szczypiorek, chleb
  - Sałatka grecka → pomidory, ogórek, oliwki, feta, cebula czerwona, oliwa
  - Placki ziemniaczane → ziemniaki, cebula, jajko, mąka, sól
  - Pierogi (farsz ziemniaczano-serowy) → mąka, jajka, ziemniaki, twaróg, cebula
  - Kotlety mielone → mięso mielone, bułka, jajko, cebula, przyprawy
  - Grillowanie → kiełbasa, karkówka, chleb, ketchup, musztarda, ogórki, cebula
  - Pizza domowa → mąka, drożdże, passata, mozzarella, salami/szynka
  - ...i kilka więcej
- **Tworzenie własnych szablonów**: użytkownik wpisuje nazwę + listę produktów
- **Edycja/usuwanie** szablonów (własnych i gotowych)
- Dodanie szablonu do listy = **wszystkie produkty szablonu trafiają na listę jednym kliknięciem**
- Jeśli produkt z szablonu już jest na liście — nie duplikuje, zwiększa ilość

### 5. Historia zakupów

- Automatyczny zapis każdej "zamkniętej" listy (data + lista produktów)
- Przeglądanie historii po datach
- Możliwość "powtórzenia" starych zakupów (przywróć całą listę)
- Historia służy też jako źródło danych dla sugestii (pkt 2)

### 6. Gazetka Kaufland ✅ (zrealizowane jako link)

- Osobna zakładka **Gazetka** 🗞️ w dolnej nawigacji
- Zrealizowana jako **link wychodzący** (nie iframe) — iframe Kauflandu jest blokowany przez X-Frame-Options, więc otwieramy w nowej karcie
- URL w kodzie: `https://www.kaufland.pl/oferta/gazetka.html` (zob. [`src/App.tsx`](src/App.tsx))
- Przycisk „Otwórz gazetkę →"

### 7. Statystyki ✅ (dodane poza pierwotnym scope)

- Zakładka **Statystyki** 📊 z wykresami (Recharts)
- KPI, BarChart (najczęstsze produkty), PieChart (ulubione kategorie), ranking szablonów
- Reset statystyk (zeruje `purchaseCount`/`useCount`, nie kasuje dokumentów)

### 8. Tryb ciemny ✅ (dodane poza pierwotnym scope)

- Przełącznik w nagłówku, class-based (`darkMode: 'class'`), preferencja w `localStorage`
- Anti-FOUC: inline `<script>` w `index.html` ustawia klasę `.dark` przed renderem Reacta

### 9. Tygodniowe planowanie posiłków 🚧 (lokalnie, przed deployem)

- Produkt może mieć wiele ręcznie przypisanych dni tygodnia
- Lista ma widoki `Kategorie` i `Dni`; wybór jest zapisywany w `localStorage`
- Szablon można dodać zwyczajnie albo zaplanować na jeden lub kilka dni
- Plan posiłku przechowuje migawkę nazwy i składników z chwili planowania
- Wspólny składnik wielu posiłków pozostaje jednym dokumentem listy zakupów
- Dni odziedziczone z posiłku są edytowane przez cały plan, nie przez pojedynczy produkt
- Historia celowo nie zapisuje dni ani planów
- Usuwanie kupionych produktów czyści puste plany automatycznie

---

## Design i UX

### Styl wizualny

- **Kolorowy i przyjazny** — ikonki emoji przy kategoriach, pastelowe kolory akcentowe
- **Mobile-first** — projektujemy pod telefon, desktop to bonus
- Duże touch-targety (min. 44px) — wygodne tapanie w sklepie
- Zaokrąglone rogi, miękkie cienie, przyjemna typografia
- Jasny motyw (light mode) jako domyślny
- Paleta kolorów: ciepłe, przyjazne odcienie — główny akcent w tonacji zieleni/teal (skojarzenie ze świeżymi zakupami)

### Kategorie — ikony i kolory

Każda kategoria ma emoji i kolor akcentowy. **Źródło prawdy: [`src/data/categories.ts`](src/data/categories.ts)** — finalnie zdefiniowano **21 kategorii** (nie 10 z pierwotnego szkicu). Nie kopiuj listy tutaj — edytuj plik danych, aby uniknąć rozjazdu dokumentacji z kodem.

### Layout głównego ekranu

```
┌─────────────────────────────┐
│  🛒 Zakupowo          [≡]  │  ← Header z hamburger menu
├─────────────────────────────┤
│  [+ Dodaj produkt...]       │  ← Pole szybkiego dodawania
├─────────────────────────────┤
│  Może potrzebujesz?         │
│  [Mleko] [Chleb] [Jajka].. │  ← Chipsy z sugestiami (one-tap)
├─────────────────────────────┤
│  🥛 Nabiał                  │
│    ☐ Mleko × 2              │
│    ☐ Jogurt naturalny       │
│  🥕 Warzywa i owoce         │
│    ☐ Marchewka              │
│    ☐ Cebula × 3             │
│  🍞 Pieczywo                │
│    ☐ Chleb                  │
├─────────────────────────────┤
│  ✅ Kupione (3)             │  ← Zwijana sekcja
│    ✓ Masło                  │
│    ✓ Ser żółty              │
│    ✓ Szynka                 │
├─────────────────────────────┤
│  [Lista] [Szablony] [📰]   │  ← Bottom nav (Lista/Szablony/Gazetka)
│  [Historia]                 │
└─────────────────────────────┘
```

### Nawigacja (bottom tabs) — 5 zakładek

1. **Lista** 🛒 — główny ekran z listą zakupów
2. **Szablony** 📋 — przeglądanie i dodawanie szablonów przepisów
3. **Historia** 🕘 — poprzednie zakupy
4. **Statystyki** 📊 — wykresy zakupowe
5. **Gazetka** 🗞️ — link do gazetki Kaufland

> Klucze zakładek w kodzie: `'list' | 'templates' | 'historia' | 'statystyki' | 'gazetka'` ([`src/types/index.ts`](src/types/index.ts)).

---

## Firebase — struktura danych (Firestore)

### Kolekcje

> Wszystkie kolekcje są **zagnieżdżone pod `households/{HOUSEHOLD_ID}/`** (a nie na top-level), gdzie `HOUSEHOLD_ID = "nasze-zakupy"`. To realizacja „Opcji A" z reguł bezpieczeństwa — jeden współdzielony household.

```
households/{householdId}/

  shoppingList/           # Aktywna lista zakupów
  {productId}/
    name: string
    quantity: string
    unit: string         # "szt", "kg", "l", "op" (opakowanie)
    category: string     # klucz kategorii
    checked: boolean
    manualDays: string[] # ręcznie przypisane dni
    mealPlanIds: string[]
    isStandalone: boolean
    createdAt: timestamp
    updatedAt: timestamp

mealPlans/              # Zaplanowane użycia szablonów
  {templateId}/
    templateId: string
    name: string
    emoji: string
    days: string[]
    items: [
      { shoppingItemId: string, name: string, quantity: string, unit: string, category: string }
    ]
    createdAt: timestamp
    updatedAt: timestamp

products/               # Baza znanych produktów (do autouzupełniania)
  {productId}/
    name: string
    category: string
    purchaseCount: number
    lastPurchased: timestamp

templates/              # Szablony przepisów
  {templateId}/
    name: string
    isDefault: boolean   # true = wbudowany, false = własny
    items: [
      { name: string, quantity: number, unit: string, category: string }
    ]

history/                # Historia zakupów
  {historyId}/
    date: timestamp
    items: [
      { name: string, quantity: number, unit: string, category: string }
    ]
```

### Reguły Firestore (Security Rules)

Appka jest prywatna dla 2 osób — najprostsze podejście:
- Opcja A: Jeden współdzielony "household" ID, hardcoded lub w konfiguracji
- Opcja B: Firebase Anonymous Auth + współdzielony kod/link do dołączenia
- **Na start: Opcja A** (prostsze, wystarczające dla 2 osób). Zabezpieczenie reguł Firestore na poziomie jednego household ID.

---

## Konwencje kodu

### Nazewnictwo

- Komponenty: PascalCase (`ShoppingList.tsx`)
- Hooki: camelCase z prefixem `use` (`useShoppingList.ts`)
- Pliki utility: camelCase (`suggestions.ts`)
- Typy: PascalCase (`Product`, `Template`, `ShoppingItem`)
- Zmienne/funkcje: camelCase
- Stałe: UPPER_SNAKE_CASE (`DEFAULT_CATEGORIES`)
- Komentarze w kodzie: po angielsku
- UI/strings widoczne dla użytkownika: **po polsku**

### Styl kodu

- Functional components z hookami (zero klas)
- Custom hooks do logiki biznesowej — komponenty czyste (render only)
- Tailwind utility classes (nie pisz custom CSS chyba że absolutnie konieczne)
- Unikaj `any` w TypeScript — definiuj typy w `types/index.ts`
- Jeden komponent na plik
- Destructuring propsów

---

## Plan implementacji (fazy) — ✅ UKOŃCZONE

> Wszystkie 3 fazy zamknięte, aplikacja **live i w użyciu**: https://zakupowo-28267.web.app
> Szczegółowy stan końcowy: [`PROGRESS.md`](PROGRESS.md) i [`tasks/todo.md`](tasks/todo.md). Poniższy plan zachowany jako zapis pierwotnego zakresu.

### Faza 1 — Fundament
1. Inicjalizacja projektu (Vite + React + TS + Tailwind)
2. Konfiguracja Firebase (Firestore + Hosting)
3. Modele danych (types)
4. Podstawowa lista zakupów: dodawanie, odhaczanie, usuwanie
5. Real-time sync (Firestore `onSnapshot`)
6. Grupowanie po kategoriach z ikonkami

### Faza 2 — Inteligencja
7. Baza produktów z autouzupełnianiem
8. Szablony przepisów (gotowe + własne)
9. Historia zakupów
10. Sugestie "Może potrzebujesz?"

### Faza 3 — Polish
11. PWA setup (manifest, service worker, ikony)
12. Gazetka Kaufland (link/embed)
13. Animacje i mikro-interakcje (odhaczanie, dodawanie)
14. Testy na iPhone + Android
15. Deploy na Firebase Hosting

---

## Ważne zasady

- **NIE buduj auth z loginem/hasłem** — to appka dla 2 osób, nie SaaS
- **NIE overengineeruj** — YAGNI. Lepiej prosta appka która działa niż skomplikowana z bugami
- **Mobile-first ZAWSZE** — jeśli wygląda dobrze na telefonie, desktop się dopasuje
- **Real-time sync to must-have** — bez tego appka nie ma sensu (Firestore onSnapshot)
- **Polskie UI** — wszystkie teksty, labele, placeholdery po polsku
- **Offline-first myślenie** — Firestore ma wbudowany offline cache, upewnij się że jest włączony (enablePersistence)

---

## Session Handoff Protocol

Na koniec każdej sesji zaktualizuj `PROGRESS.md`:
- Co zostało zrobione (konkretne pliki, funkcje)
- Co jest następne
- Znane problemy / blokery
- Decyzje podjęte w tej sesji

---

## Kontekst zewnętrzny

- **Deploy URL (live):** https://zakupowo-28267.web.app
- **Firebase project ID:** `zakupowo-28267` (zob. `.firebaserc`); konsola: https://console.firebase.google.com/project/zakupowo-28267
- **Household ID:** `nasze-zakupy` (zmienna `VITE_HOUSEHOLD_ID` w `.env`)
- **Repo (git remote):** https://github.com/Mateo2215/Zakupowo
- **Kaufland Polska gazetka:** https://www.kaufland.pl/oferta/gazetka.html
- Sekrety (klucze Firebase) wyłącznie w `.env` — nie commitować.
