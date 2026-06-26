# Zakupowo — Plan i Progress

## Current State
- Faza 1 UKOŃCZONA
- Faza 2 UKOŃCZONA
- Faza 3 UKOŃCZONA
- Faza 4, migracja Firebase i redesign „Świeży Targ” wdrożone na https://zakupowo-v2.web.app
- Ikony PWA/home-screen zostały przełączone na logo „Markiza targowa” z `design/logo`

---

## Krok 0 — Setup plików zarządzania
- [x] Utwórz tasks/todo.md
- [x] Utwórz tasks/lessons.md
- [x] Utwórz .gitignore
- [x] Utwórz .env

---

## Faza 1 — Fundament ✅
- [x] Bootstrap projektu (Vite + React + TypeScript)
- [x] Instalacja zależności (Tailwind CSS, Firebase SDK)
- [x] Konfiguracja Firebase (firebase.ts + .env)
- [x] Typy TypeScript (src/types/index.ts)
- [x] Dane kategorii (src/data/categories.ts — 21 kategorii z emoji)
- [x] Hook useShoppingList (CRUD + real-time onSnapshot)
- [x] Komponenty: Header, AddProduct, ProductItem, ShoppingList, BottomNav
- [x] Firestore Rules + household ID
- [x] Weryfikacja: real-time sync na 2 urządzeniach

---

## Faza 2 — Inteligencja ✅
- [x] Hook useProducts (baza znanych produktów + purchaseCount)
- [x] Autouzupełnianie w AddProduct (Firestore + DEFAULT_PRODUCTS)
- [x] Dane szablonów (src/data/defaultTemplates.ts — 46 szablonów)
- [x] Hook useTemplates (CRUD + soft-delete defaultów + useCount tracking)
- [x] Widok Szablony z edytorem (tworzenie, edycja, usuwanie — w tym domyślnych)
- [x] Hook useSuggestions + Komponent Suggestions ("Może potrzebujesz?")
- [x] Historia zakupów (saveToHistory + clearChecked)
- [x] Widok Historia z powtarzaniem sesji
- [x] Dark mode (Tailwind darkMode: 'class' + useTheme + anti-FOUC w index.html)
- [x] Zakładka Statystyki (📊) z Recharts (KPI, BarChart, PieChart, ranking szablonów, reset)

---

## Faza 3 — Polish ✅
- [x] vite-plugin-pwa (Service Worker auto-generowany przez Workbox)
- [x] Web App Manifest (manifest.webmanifest — ikony, theme_color, display: standalone, `lang: pl`)
- [x] Ikony PWA (192×192, 512×512, 512×512 maskable, 180×180 apple-touch-icon — logo „Markiza targowa”)
- [x] Animacje (checkbox pop scale 1→1.35→0.9→1, slide-in nowych elementów)
- [x] Firebase Hosting (firebase.json, .firebaserc, npm run deploy)
- [x] Deploy — aplikacja live: https://zakupowo-28267.web.app

---

## Stan po Fazie 3 ✅

## Faza 4 — Tygodniowe planowanie posiłków 🚧
- [x] Dodać model dni tygodnia i planów posiłków
- [x] Dodać atomowe operacje planowania i sprzątania
- [x] Dodać panel wyboru dni przy produkcie
- [x] Dodać akcję „Zaplanuj” w szablonach
- [x] Dodać widoki „Kategorie” i „Dni”
- [x] Zintegrować historię i „Usuń kupione”
- [x] Zweryfikować build i izolowany mobilny UI
- [ ] P1: Sprawdzić zapis i synchronizację Firestore na 2 urządzeniach
- [x] P1: Wykonać osobny deploy po teście ręcznym — Faza 4 live na zakupowo-v2 (deploy 28242807430), 2026-06-26

Szczegóły: `docs/plans/weekly-meal-planning.md`.

## Migracja Firebase do `zakupowo-v2` 🚧
- [x] Przygotować bezpieczne narzędzie inventory / migrate / verify
- [x] Zapisać lokalne reguły Firestore dla docelowego household
- [x] Wykonać inwentaryzację starego i nowego projektu
- [x] Przenieść atomowo 259 dokumentów do `zakupowo-v2`
- [x] Zweryfikować historię, produkty, szablony i aktualną listę
- [x] Przełączyć konfigurację aplikacji na `zakupowo-v2`
- [x] Wykonać kontrolowany ręczny deploy do `zakupowo-v2`
- [x] Skonfigurować GitHub Actions dla kolejnych deployów
- [ ] Zachować `zakupowo-28267` jako rollback przez minimum 7 dni

Szczegóły: `docs/plans/firebase-project-migration.md`.

## Redesign „Świeży Targ” 🚧
- [x] Dodać tokeny kolorów, fonty i `lucide-react`
- [x] Odświeżyć header, bottom nav, motyw dark/light i sticky offsety
- [x] Przestylować główną listę zakupów i widoki `Kategorie` / `Dni`
- [x] Przestylować szablony, historię, statystyki, gazetkę i modal dni
- [x] Zweryfikować build oraz podstawowe scenariusze mobile dark/light
- [x] Podłączyć logo z `design/logo` jako favicon, manifest icons, maskable icon i `apple-touch-icon`
- [ ] P1: Po deployu dodać PWA ponownie na telefonie i potwierdzić, że ekran główny pokazuje nowe logo (warunek: deploy logo wykonany 2026-06-26)
