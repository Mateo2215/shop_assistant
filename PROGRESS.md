# Zakupowo — Progress

## Status: PRODUKCJA NA `zakupowo-v2` ✅
**Live:** https://zakupowo-v2.web.app
**Repo:** https://github.com/Mateo2215/shop_assistant (private, branch `main`)
**Aktualny etap:** Faza 4, migracja Firebase i redesign „Świeży Targ” są wdrożone. Bieżąca zmiana podłącza nowe logo jako ikonę PWA/home-screen.

---

## Faza 1 — Fundament ✅
- React 18 + Vite + TypeScript + Tailwind CSS 3 + Firebase SDK
- 21 kategorii, useShoppingList, real-time sync na 2 urządzeniach

## Faza 2 — Inteligencja ✅
- Autouzupełnianie (useProducts + DEFAULT_PRODUCTS fallback)
- 46 szablonów dań, tworzenie/edycja/usuwanie własnych, soft-delete domyślnych
- Sugestie "Może potrzebujesz?" (próg 5×, dismiss ×)
- Historia zakupów (30 sesji, powtarzanie)
- Dark mode (class-based, anti-FOUC)
- Statystyki (Recharts: KPI, BarChart, PieChart, ranking szablonów, reset)

## Faza 3 — Polish ✅
- **Service Worker** — Workbox (vite-plugin-pwa), precache 13 plików, autoUpdate
- **Manifest** — `display: standalone`, `theme_color: #161c17`, `lang: pl`, ikony PWA
- **Ikony** — 192×192, 512×512, 512×512 maskable, 180×180 apple-touch-icon; logo „Markiza targowa” z `design/logo`
- **Animacje** — checkbox pop (keyframe scale), slide-in nowych elementów listy
- **Deploy** — Firebase Hosting, `npm run deploy`, SPA rewrite, cache headers
- **Gazetka Kaufland** — zakładka z linkiem wychodzącym do gazetki (iframe blokowany przez X-Frame-Options, więc otwieranie w nowej karcie)

## Faza 4 — Tygodniowe planowanie posiłków 🚧
- Dni tygodnia przypisywane ręcznie do produktów
- Widoki listy `Kategorie` i `Dni`, z preferencją zapisywaną lokalnie
- Planowanie szablonów jako osobne dokumenty `mealPlans`
- Współdzielone składniki bez duplikowania zakupów
- Atomowe sprzątanie planów i produktów przez Firestore `writeBatch`
- Build i izolowany test mobilnego UI zakończone powodzeniem
- Funkcja jest wdrożona na `zakupowo-v2`
- Pozostało: ręczny smoke test live oraz potwierdzenie zapisu/synchronizacji Firestore na 2 urządzeniach

## Redesign — „Świeży Targ” ✅
- Wdrożono pełny redesign prezentacyjny według `design/dashboard/README.md`.
- Dodano fonty Quicksand / Nunito Sans, ciepłą paletę dark/light oraz ikony `lucide-react`.
- Odświeżono header, bottom nav, dodawanie produktu, sugestie, widoki `Kategorie` / `Dni`, produkt, kupione, szablony, edytor, historię, statystyki, gazetkę i modal dni.
- Logika hooków, Firestore, modele danych i zachowanie planów posiłków pozostały bez zmian.
- Logo z `design/logo` zostało podłączone jako favicon, manifest icons, maskable icon i `apple-touch-icon`; PNG generuje `scripts/generate-icons.mjs`.
- Weryfikacja: `npm run build` przechodzi; local smoke test w Chrome na viewportach 390×844 i 360×640 potwierdził header 72px, bottom nav 67px, brak zbyt małych przycisków i działające zakładki.

## Komendy
```bash
npm run dev          # development
npm run build        # build produkcyjny
npm run deploy       # build + firebase deploy
npm run generate-icons  # regeneruj ikony PWA z public/icons/*.svg
```

## Decyzje techniczne
- `household ID = "nasze-zakupy"` w VITE_HOUSEHOLD_ID
- Firebase v10 z `persistentLocalCache` (offline-first)
- Tailwind CSS 3.x z `darkMode: 'class'`
- Recharts 2.x (bundled TS types)
- Soft-delete domyślnych szablonów przez `{ deleted: true }` w Firestore
- Ikony PWA generowane przez `sharp` z brandowych SVG w `public/icons/`
- Ikony UI redesignu przez `lucide-react`
