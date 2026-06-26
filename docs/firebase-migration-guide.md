# Migracja Zakupowo: `zakupowo-28267` → `zakupowo-v2`

Ta procedura przenosi dane Firestore i aplikację do nowego projektu. Stary projekt pozostaje nienaruszony jako rollback. Nie usuwaj go przez minimum 7 dni po przełączeniu. Narzędzie używa oficjalnego Firestore REST API, ponieważ lokalne połączenia gRPC są blokowane przez konfigurację certyfikatów na tym komputerze.

## Co robi narzędzie

- Czyta wyłącznie dane pod `households/nasze-zakupy`.
- Kopiuje wszystkie dokumenty i podkolekcje rekursywnie.
- Zachowuje identyfikatory dokumentów i typy Firestore, w tym timestampy.
- Nie wypisuje treści zakupów w terminalu.
- Odmawia migracji, jeśli docelowy household zawiera choć jeden dokument.
- Używa operacji `create`, więc nie nadpisuje istniejących dokumentów.
- Kopiuje do 500 dokumentów w jednym atomowym batchu: wszystkie zapisy przechodzą albo żaden.
- Po migracji porównuje ścieżki dokumentów i skróty SHA-256 ich zawartości.

Narzędzie nie kopiuje reguł Firestore, indeksów, konfiguracji Hosting ani aplikacji Web.

## Etap 1 — dokończ konfigurację `zakupowo-v2`

W Firebase Console otwórz projekt `zakupowo-v2`.

1. `Project settings → General → Your apps`.
2. Dodaj aplikację Web, jeśli jeszcze jej nie ma.
3. Nazwij ją np. `Zakupowo Web`.
4. Nie wklejaj konfiguracji Firebase do czatu ani repo.
5. `Build → Firestore Database → Create database`.
6. Wybierz tę samą lokalizację bazy, której używa `zakupowo-28267`.
7. Nie dodawaj ręcznie żadnych dokumentów do `households/nasze-zakupy`.
8. `Build → Hosting → Get started` — wystarczy aktywować Hosting; deploy wykonamy później.

Lokalizację starej bazy sprawdzisz w Firebase Console starego projektu w szczegółach Firestore. Lokalizacji bazy nie można później zmienić.

## Etap 2 — zabezpiecz reguły Firestore

W starym projekcie:

1. Otwórz `Firestore Database → Rules`.
2. Skopiuj całą aktualną treść do bezpiecznego lokalnego pliku poza repo.
3. Otwórz reguły nowego projektu.
4. Nie publikuj ich automatycznie bez porównania.

Nowe reguły muszą obsługiwać co najmniej:

- `households/{householdId}/shoppingList`
- `households/{householdId}/products`
- `households/{householdId}/templates`
- `households/{householdId}/history`
- `households/{householdId}/mealPlans`

Jeżeli stare reguły mają ogólny matcher dla wszystkich podkolekcji household, `mealPlans` może być objęte automatycznie. Jeżeli wymieniają kolekcje osobno, trzeba dopisać `mealPlans`.

### Stan wykryty 2026-06-25

- `zakupowo-28267` używało globalnego `allow read, write: if true`.
- `zakupowo-v2` startuje z globalnym `allow read, write: if false`.
- Stara reguła nie powinna być kopiowana.
- Repo zawiera teraz `firestore.rules`, które dopuszcza wyłącznie ścieżkę `households/nasze-zakupy/**`.

Ta reguła pasuje do obecnej decyzji produktowej „bez logowania”, ale nie zapewnia silnej ochrony tożsamości. Osoba znająca konfigurację klienta i household ID nadal może próbować operacji na tej ścieżce. Pełne zabezpieczenie wymagałoby Firebase Authentication lub innego mechanizmu tożsamości.

## Etap 3 — zainstaluj Google Cloud CLI

Na komputerze nie ma obecnie komendy `gcloud`.

1. Zainstaluj Google Cloud CLI:
   https://cloud.google.com/sdk/docs/install-sdk
2. Zamknij i ponownie otwórz PowerShell.
3. Sprawdź:

```powershell
gcloud --version
```

4. Zaloguj się:

```powershell
gcloud auth login
gcloud auth application-default login
```

Użyj konta Google mającego dostęp właściciela lub odpowiednie uprawnienia do obu projektów:

- `zakupowo-28267`
- `zakupowo-v2`

Nie pobieraj kluczy kont serwisowych. Nie umieszczaj plików JSON z kluczami w repo.

## Etap 4 — inwentaryzacja bez zapisów

W folderze projektu:

```powershell
cd "C:\Users\matwa\Claude - Nowe projekty\zakupowo"
npm.cmd run firestore:inventory
```

Komenda:

- odczyta stary i nowy projekt,
- pokaże liczby dokumentów według kolekcji,
- nie zmieni żadnych danych,
- wypisze dokładną frazę potwierdzającą migrację.

Oczekiwany stan:

- źródło ma dokumenty w `history`, `products`, `templates` i prawdopodobnie `shoppingList`,
- cel ma `0` dokumentów pod `households/nasze-zakupy`.

Jeżeli cel nie jest pusty, nie uruchamiaj migracji. Najpierw ustal, skąd pochodzą te dokumenty.

## Etap 5 — okno migracyjne

Bezpośrednio przed kopiowaniem:

1. Zamknij PWA Zakupowo na obu telefonach.
2. Zamknij wszystkie karty przeglądarki ze starą aplikacją.
3. Nie dodawaj i nie odhaczaj produktów do zakończenia migracji.
4. Ponownie uruchom inwentaryzację i zapisz pokazane liczby.

To jest krótkie zamrożenie zapisów. Jeśli potrzebujesz twardej blokady, najpierw przygotuj tymczasową regułę read-only dla starego projektu i pokaż ją do przeglądu przed publikacją.

## Etap 6 — migracja danych

Uruchom:

```powershell
npm.cmd run firestore:migrate -- --confirm "zakupowo-28267:nasze-zakupy->zakupowo-v2:nasze-zakupy"
```

Narzędzie przerwie pracę, jeżeli:

- źródło jest puste,
- cel nie jest pusty,
- projekty są takie same,
- fraza potwierdzająca jest nieprawidłowa,
- konto nie ma dostępu,
- nowa baza Firestore nie istnieje.
- źródło przekracza 500 dokumentów — wtedy narzędzie nie rozpocznie zapisów i trzeba wybrać oficjalny eksport/import lub osobno zaprojektować migrację wieloetapową.

Po kopiowaniu narzędzie automatycznie uruchomi weryfikację.

## Etap 7 — niezależna weryfikacja

Uruchom ponownie:

```powershell
npm.cmd run firestore:verify
```

Wymagany wynik:

```text
Verification: PASS
```

Następnie sprawdź w Firebase Console `zakupowo-v2`:

- aktualną listę,
- liczbę wpisów historii,
- własne i zmodyfikowane szablony,
- produkty i liczniki zakupów,
- brak przypadkowych danych poza `households/nasze-zakupy`.

Nie przełączaj aplikacji, jeśli weryfikacja nie przechodzi.

## Etap 7a — publikacja reguł w nowym projekcie

Po udanej migracji i przed testem aplikacji opublikuj reguły wyłącznie do nowego projektu:

```powershell
npx.cmd firebase-tools deploy --only firestore:rules --project zakupowo-v2
```

Nie pomijaj parametru `--project zakupowo-v2`, dopóki `.firebaserc` wskazuje jeszcze stary projekt.

## Etap 8 — przełączenie konfiguracji lokalnej

W `zakupowo-v2 → Project settings → Your apps → SDK setup and configuration` pobierz wartości konfiguracji nowej aplikacji Web.

Zaktualizuj lokalny `.env`:

```text
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=zakupowo-v2
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_HOUSEHOLD_ID=nasze-zakupy
```

Nie wklejaj wartości `.env` do czatu. Można zweryfikować wyłącznie obecność nazw zmiennych.

Po pozytywnej migracji zmień `.firebaserc`:

```json
{
  "projects": {
    "default": "zakupowo-v2"
  }
}
```

## Etap 9 — pierwszy deploy i test

```powershell
npx.cmd firebase-tools login
npm.cmd run build
npm.cmd run deploy
```

Otwórz nowy adres:

```text
https://zakupowo-v2.web.app
```

Sprawdź na dwóch urządzeniach:

1. Historię zakupów.
2. Aktualną listę.
3. Własne szablony.
4. Dodanie i odhaczenie produktu w czasie rzeczywistym.
5. Ręczne przypisanie dnia.
6. Zaplanowanie szablonu i powstanie `mealPlans`.
7. Widoki `Kategorie` i `Dni`.
8. `Usuń kupione`.
9. Ponowne otwarcie aplikacji i działanie offline cache.

## Etap 10 — GitHub Actions

Dopiero po poprawnym ręcznym deployu skonfiguruj automatyzację:

```powershell
npx.cmd firebase-tools init hosting:github
```

Repo:

```text
Mateo2215/shop_assistant
```

Branch produkcyjny:

```text
main
```

Sekrety `VITE_*` należy dodać do GitHub Actions. Nie commituj `.env`.

## Rollback

Jeżeli nowa aplikacja nie działa:

1. Nie usuwaj ani nie modyfikuj starego projektu.
2. Na telefonach użyj starego adresu:
   `https://zakupowo-28267.web.app`
3. Przywróć stare wartości `.env` i `.firebaserc`.
4. Nie próbuj automatycznie scalać zapisów powstałych równolegle w obu projektach.

Stary projekt usuń dopiero po minimum 7 dniach stabilnego używania `zakupowo-v2` i po ręcznym potwierdzeniu, że historia oraz bieżące dane są kompletne.
