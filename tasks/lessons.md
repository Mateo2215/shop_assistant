# Zakupowo — Lekcje Projektowe

## Format
`Problem → Rozwiązanie → Co robić następnym razem`

---

## Soft-delete dla wbudowanych danych
**Problem:** Szablony domyślne istnieją tylko w kodzie — nie można ich "usunąć" przez deleteDoc.
**Rozwiązanie:** Zapis `{ deleted: true }` w Firestore jako soft-delete. Przy merge `allTemplates` filtrujemy ID z flagą deleted.
**Następnym razem:** Gdy dane mają dwa źródła (kod + Firestore), zawsze projektuj soft-delete od razu.

## Gradient text w Tailwind
**Problem:** Gradient na tekście nie działa przez samo `bg-gradient-to-r`.
**Rozwiązanie:** Trzy klasy łącznie: `bg-gradient-to-r from-X to-Y bg-clip-text text-transparent`.
**Następnym razem:** Gradient text = zawsze te trzy klasy razem.

## Anti-FOUC dla dark mode
**Problem:** Przy page load przez chwilę widać jasny motyw zanim React wczyta preferencję z localStorage.
**Rozwiązanie:** Inline `<script>` w `<head>` index.html — czyta localStorage i dodaje klasę `.dark` do `<html>` synchronicznie, przed jakimkolwiek renderem.
**Następnym razem:** Każda appka z class-based dark mode wymaga tego inline script w HTML.

## Statystyki: liczniki vs obecność w bazie
**Problem:** "Unikalnych produktów" nie resetowało się po resecie statystyk — liczyło `firestoreProducts.length` (wszystkie dokumenty), a reset tylko zeruje `purchaseCount`, nie usuwa dokumentów.
**Rozwiązanie:** Liczyć `firestoreProducts.filter(p => p.purchaseCount > 0).length`.
**Następnym razem:** Metryki statystyk powinny bazować na wartościach pól, nie na obecności dokumentu w kolekcji.

## setDoc vs updateDoc przy tracking
**Problem:** `recordTemplateUse` musi działać dla szablonów domyślnych, które mogą nie mieć jeszcze dokumentu w Firestore.
**Rozwiązanie:** `setDoc(ref, { useCount: increment(1) }, { merge: true })` — tworzy dokument jeśli nie istnieje.
**Następnym razem:** Dla increment na dokumentach które mogą nie istnieć — zawsze `setDoc` z `merge: true`, nigdy `updateDoc`.

## Recharts w Vite/TypeScript
**Problem:** Czy trzeba instalować osobno typy?
**Rozwiązanie:** `npm install recharts` wystarczy — Recharts 2+ zawiera bundled TypeScript types.
**Następnym razem:** Sprawdzaj czy biblioteka ma bundled types przed instalacją @types/X.

## vite-plugin-pwa — manifest vs public/manifest.json
**Problem:** Jeśli masz `<link rel="manifest" href="/manifest.json">` w index.html i jednocześnie vite-plugin-pwa generuje własny manifest, mogą być konflikty.
**Rozwiązanie:** Usunąć ręczny link do manifest.json z index.html — plugin wstrzykuje własny `manifest.webmanifest` automatycznie. Zachować tylko `<link rel="apple-touch-icon">`.
**Następnym razem:** vite-plugin-pwa = manifest definiuj w vite.config.ts, nie w public/manifest.json.

## Firebase Hosting deploy — pierwsza konfiguracja
**Problem:** `npx firebase-tools deploy` wymaga wcześniejszego logowania przez przeglądarkę.
**Rozwiązanie:** `npx firebase-tools login` (raz) → otwiera przeglądarkę → potem `npm run deploy` działa autonomicznie.
**Następnym razem:** Dodaj `firebase login` do instrukcji setup projektu. `.firebaserc` z project ID musi być w repo.

## PWA ikony — generowanie przez sharp
**Problem:** Potrzebujemy PNG ikon (192×192, 512×512) bez narzędzi graficznych.
**Rozwiązanie:** SVG źródłowy w `public/icon.svg` + skrypt `scripts/generate-icons.mjs` + `sharp` jako devDep. Ikona jako path SVG (nie tekst) — brak zależności od fontów systemowych.
**Następnym razem:** Zawsze używaj path zamiast `<text>` w SVG przeznaczonych do rasteryzacji — fonty mogą nie być dostępne w środowisku budowania.
