# CLAUDE.md — Zakupowo

## Projekt

**Zakupowo** — wspólna lista zakupów dla pary. PWA (Progressive Web App), mobile-first, po polsku, z real-time synchronizacją.

### Użytkownicy

Dwoje ludzi (para). Mix iPhone + Android. Appka działa w przeglądarce — zero instalacji ze sklepu. Nie projektujemy pod wielu użytkowników — to prywatna appka dla 2 osób.

### Stack technologiczny

- **Frontend:** React 18+ z Vite, Tailwind CSS 3+
- **Backend/Sync:** Firebase (Firestore jako baza + Firebase Hosting do deploy)
- **Język kodu:** TypeScript (preferowany) lub JavaScript
- **PWA:** Service Worker + Web App Manifest (instalowalna na ekranie głównym)
- **Linting:** ESLint + Prettier

### Struktura katalogów (docelowa)

```
zakupowo/
├── CLAUDE.md
├── PROGRESS.md
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── index.html
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── icons/          # Ikony PWA (192x192, 512x512)
│   └── favicon.ico
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── firebase.ts     # Konfiguracja Firebase
│   ├── components/
│   │   ├── ShoppingList.tsx
│   │   ├── ProductItem.tsx
│   │   ├── AddProduct.tsx
│   │   ├── CategoryGroup.tsx
│   │   ├── Suggestions.tsx       # "Może potrzebujesz?"
│   │   ├── Templates.tsx         # Szablony przepisów
│   │   ├── TemplateEditor.tsx    # Tworzenie/edycja szablonów
│   │   ├── History.tsx           # Historia zakupów
│   │   ├── KauflandFlyer.tsx     # Gazetka Kaufland
│   │   └── ui/                   # Reusable UI components
│   ├── hooks/
│   │   ├── useShoppingList.ts
│   │   ├── useProducts.ts
│   │   ├── useSuggestions.ts
│   │   └── useTemplates.ts
│   ├── types/
│   │   └── index.ts
│   ├── data/
│   │   ├── categories.ts         # Kategorie + ikony + kolory
│   │   ├── defaultProducts.ts    # Baza popularnych produktów PL
│   │   └── defaultTemplates.ts   # Gotowe szablony przepisów
│   ├── utils/
│   │   └── suggestions.ts        # Logika sugestii na podstawie historii
│   └── styles/
│       └── globals.css
└── tasks/
    └── lessons.md
```

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

### 6. Gazetka Kaufland

- Sekcja/tab z embed lub linkiem do aktualnej gazetki Kaufland Polska
- URL do gazetki: `https://www.kaufland.pl/oferty/oferta-tygodnia.html` (lub aktualny)
- Otwierane w iframe lub jako zewnętrzny link (zdecyduj co działa lepiej — iframe może być blokowany przez CORS/X-Frame-Options, wtedy link)
- Opcjonalnie: przycisk "Sprawdź promocje" w widocznym miejscu

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

| Kategoria | Emoji | Kolor akcentowy |
|-----------|-------|-----------------|
| Nabiał | 🥛 | #60A5FA (jasny niebieski) |
| Warzywa i owoce | 🥕 | #34D399 (zielony) |
| Pieczywo | 🍞 | #FBBF24 (złoty) |
| Mięso i ryby | 🥩 | #F87171 (czerwony) |
| Chemia/Dom | 🧹 | #A78BFA (fioletowy) |
| Napoje | 🥤 | #38BDF8 (cyan) |
| Mrożonki | 🧊 | #93C5FD (jasny blue) |
| Przekąski | 🍪 | #FB923C (pomarańczowy) |
| Przyprawy | 🌶️ | #F472B6 (różowy) |
| Inne | 🛒 | #9CA3AF (szary) |

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

### Nawigacja (bottom tabs)

1. **Lista** — główny ekran z listą zakupów
2. **Szablony** — przeglądanie i dodawanie szablonów przepisów
3. **Gazetka** — aktualna gazetka Kaufland
4. **Historia** — poprzednie zakupy

---

## Firebase — struktura danych (Firestore)

### Kolekcje

```
shoppingList/           # Aktywna lista zakupów
  {productId}/
    name: string
    quantity: number
    unit: string         # "szt", "kg", "l", "op" (opakowanie)
    category: string     # klucz kategorii
    checked: boolean
    addedAt: timestamp
    checkedAt: timestamp | null

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

## Plan implementacji (fazy)

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

- Kaufland Polska gazetka: https://www.kaufland.pl/oferty/oferta-tygodnia.html
- Firebase Console: (do uzupełnienia po stworzeniu projektu)
- Deploy URL: (do uzupełnienia po pierwszym deploy)
