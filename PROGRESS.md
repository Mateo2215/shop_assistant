# Zakupowo — Progress

## Status: FAZA 4 ZAIMPLEMENTOWANA LOKALNIE 🚧
**Live:** https://zakupowo-28267.web.app
**Repo:** https://github.com/Mateo2215/shop_assistant (private, branch `main`)
**Nowa funkcja:** tygodniowe planowanie posiłków jest gotowe lokalnie; wymaga jeszcze testu Firestore na 2 urządzeniach i osobnego deployu.

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
- **Manifest** — `display: standalone`, `theme_color: #6366f1`, ikony PWA
- **Ikony** — 192×192, 512×512 (maskable), 180×180 apple-touch-icon; gradient indigo→violet, "Z" jako path
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
- Pozostało: test zapisu/synchronizacji Firestore na 2 urządzeniach oraz deploy

## Komendy
```bash
npm run dev          # development
npm run build        # build produkcyjny
npm run deploy       # build + firebase deploy
npm run generate-icons  # regeneruj ikony z public/icon.svg
```

## Decyzje techniczne
- `household ID = "nasze-zakupy"` w VITE_HOUSEHOLD_ID
- Firebase v10 z `persistentLocalCache` (offline-first)
- Tailwind CSS 3.x z `darkMode: 'class'`
- Recharts 2.x (bundled TS types)
- Soft-delete domyślnych szablonów przez `{ deleted: true }` w Firestore
- Ikony generowane przez `sharp` z SVG źródłowego (`public/icon.svg`)
