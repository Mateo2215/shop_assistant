# Plan: Migracja Firebase do `zakupowo-v2`

## Goal
Przenieść aplikację Zakupowo ze starego projektu `zakupowo-28267` do `zakupowo-v2` bez utraty danych Firestore, z możliwością pełnego wycofania przed przełączeniem produkcji.

## Current State
- Produkcja działa na `zakupowo-v2` pod adresem `https://zakupowo-v2.web.app`.
- Stary projekt `zakupowo-28267` pozostaje aktywny jako rollback.
- Dane aplikacji są zagnieżdżone pod `households/nasze-zakupy`.
- Repo przechowuje lokalne reguły Firestore ograniczone do `households/nasze-zakupy`.
- Do `zakupowo-v2` przeniesiono 259 dokumentów, opublikowano reguły Firestore, przełączono Hosting i skonfigurowano GitHub Actions dla kolejnych deployów.

## Assumptions
- Stary projekt pozostaje aktywny jako kopia awaryjna.
- Migracja danych nastąpi przed zmianą `.env` i `.firebaserc`.
- Uwierzytelnienie migracji użyje Google Application Default Credentials, bez kluczy kont serwisowych w repo.
- GitHub Actions używa konta serwisowego Firebase zapisanego jako zaszyfrowany GitHub Secret, bez pliku klucza w repo.
- Nowy household docelowo zachowuje ID `nasze-zakupy`.

## Proposed Approach
- Dodać lokalne narzędzie Firestore REST działające w trybach `inventory`, `migrate` i `verify`.
- Kopiować rekursywnie dokumenty i podkolekcje z zachowaniem ID oraz typów Firestore.
- Domyślnie przerwać migrację, gdy cel zawiera jakiekolwiek dane.
- Nie logować treści dokumentów; raportować tylko ścieżki kolekcji, liczby i skróty kontrolne.
- Przełączyć Hosting i konfigurację klienta dopiero po pełnej weryfikacji danych.

## Implementation Steps
- [x] Dodać izolowaną zależność `google-auth-library`.
- [x] Dodać narzędzie inwentaryzacji źródła i celu.
- [x] Dodać migrację wymagającą jawnego potwierdzenia projektów.
- [x] Dodać weryfikację liczby dokumentów i skrótów danych.
- [x] Dodać instrukcję autoryzacji, zamrożenia zapisów, migracji i rollbacku.
- [x] Przetestować parser argumentów i mechanizmy bezpieczeństwa bez połączenia z produkcją.
- [x] Przenieść atomowo 259 dokumentów i wykonać niezależny odczyt kontrolny.
- [x] Opublikować reguły Firestore w `zakupowo-v2`.
- [x] Przełączyć `.env` i `.firebaserc` na `zakupowo-v2`.
- [x] Wykonać kontrolowany ręczny deploy Hostingu.
- [x] Dodać GitHub Actions workflow dla deployu live po pushu do `main`.
- [x] Dodać wymagane GitHub Secrets dla konfiguracji Vite i deployu Firebase Hosting.

## Verification
- Narzędzie bez wymaganych argumentów kończy się czytelnym błędem.
- `migrate` bez frazy potwierdzającej nie wykonuje zapisów.
- `migrate` odmawia zapisu do niepustego celu.
- Tryb `verify` wykrywa różnicę liczby lub zawartości dokumentów.
- Po autoryzacji użytkownik uruchamia prawdziwe `inventory`, `migrate`, `verify`.
- Wynik z 25 czerwca 2026: źródło 259 dokumentów, cel 259 dokumentów, `Verification: PASS`.
- Wynik z 26 czerwca 2026: `npm run build` przechodzi, Firestore rules deploy przechodzi, Hosting deploy przechodzi, `https://zakupowo-v2.web.app` odpowiada HTTP 200.
- Wynik z 26 czerwca 2026: GitHub Secrets istnieją dla konfiguracji Vite i `FIREBASE_SERVICE_ACCOUNT_ZAKUPOWO_V2`; lokalny plik klucza konta serwisowego nie istnieje.

## Risks
- Zapisy wykonane w starym projekcie podczas migracji nie trafią do nowego.
- Reguły i indeksy Firestore nie są częścią kopiowanych dokumentów.
- Zmiana Project ID powoduje nowy adres Hosting i wymaga ponownego zainstalowania PWA.
- Minimalne reguły bez Authentication ograniczają dostęp do jednego household, ale nie zapewniają silnej ochrony tożsamości.

## Done Criteria
- [x] Dane są identyczne według raportu `verify`.
- [x] Reguły Firestore działają w nowym projekcie.
- [x] GitHub Actions jest skonfigurowany dla kolejnych deployów.
- [ ] Nowa aplikacja działa na dwóch urządzeniach.
- [ ] Stary projekt pozostaje dostępny przez okres rollbacku.
