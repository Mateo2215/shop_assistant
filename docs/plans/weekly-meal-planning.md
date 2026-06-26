# Plan: Tygodniowe planowanie posiłków

## Goal
Rozszerzyć listę zakupów o opcjonalne dni tygodnia oraz lekkie planowanie posiłków na podstawie szablonów, bez dodawania osobnej zakładki.

## Current State
- Lista zakupów grupuje produkty wyłącznie według kategorii.
- Szablony dodają składniki bez dodatkowego kontekstu.
- Produkty są przechowywane w `households/{householdId}/shoppingList`.
- Historia zapisuje wyłącznie kupione produkty.

## Assumptions
- Używamy nazw dni tygodnia bez konkretnych dat.
- Jeden produkt może należeć do wielu dni i wielu posiłków.
- Historia nie przechowuje dni ani planów.
- Nie dodajemy nowej biblioteki testowej ani nie wykonujemy automatycznego deployu.

## Proposed Approach
- Dodać kolekcję `mealPlans` z migawkami zaplanowanych szablonów.
- Przechowywać przy produkcie osobno ręcznie ustawione dni i powiązania z planami.
- Obliczać widoczne dni jako sumę obu źródeł.
- Dodać widoki `Kategorie` i `Dni`, wspólny panel wyboru dni oraz zarządzanie planem.
- Używać atomowych zapisów Firestore dla operacji obejmujących plan i produkty.

## Implementation Steps
- [x] Dodać typy dni, planów posiłków i kompatybilne odczyty starszych produktów.
- [x] Dodać hook obsługujący plany i atomowe operacje Firestore.
- [x] Dodać panel wyboru dni i przełącznik widoku listy.
- [x] Rozszerzyć produkty o ręczne dni i dni odziedziczone z planów.
- [x] Dodać planowanie szablonów oraz widok listy według dni i posiłków.
- [x] Zintegrować usuwanie produktów, planów i kupionych pozycji.
- [x] Uzupełnić dokumentację i przeprowadzić weryfikację lokalną.

## Files Likely to Change
- `src/types/index.ts` — nowe typy i pola danych.
- `src/hooks/` — logika listy i planów posiłków.
- `src/components/` — panel dni, widoki listy i zarządzanie planami.
- `src/App.tsx` — integracja przepływów.
- `tasks/todo.md`, `PROGRESS.md`, `README.md` — status i dokumentacja.

## Verification
- `npm run build`
- Ręczne sprawdzenie widoków, wielu dni, scalania planów i sprzątania danych.
- Ręczne sprawdzenie synchronizacji Firestore na dwóch urządzeniach.

## Risks
- Niespójność produktu i planu przy częściowym zapisie — ograniczona przez `writeBatch`.
- Usunięcie współdzielonego produktu — wymaga zachowania informacji o wszystkich źródłach.
- Istniejące dokumenty nie mają nowych pól — parser musi zapewnić bezpieczne wartości domyślne.

## Done Criteria
- [x] Kod jest zaimplementowany.
- [x] Build przechodzi.
- [x] Krytyczne scenariusze ręczne są opisane i gotowe do sprawdzenia.
- [x] Nie zmieniono niezwiązanych funkcji.
- [x] Dokumentacja i status zadania są aktualne.

## Remaining Manual Gate
- [ ] Potwierdzić zapis do `mealPlans` i synchronizację na dwóch urządzeniach.
- [ ] Wykonać deploy dopiero po pozytywnym smoke teście.
