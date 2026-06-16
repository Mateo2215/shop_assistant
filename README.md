# Zakupowo 🛒

Wspólna lista zakupów dla dwojga. Działa na telefonie jak normalna aplikacja — bez App Store, bez Google Play. Zmiany jednej osoby pojawiają się u drugiej natychmiast.

**Adres aplikacji:** https://zakupowo-28267.web.app

---

## Co potrafi

### Lista zakupów
- Dodajesz produkt → pojawia się u obojga w czasie rzeczywistym
- Produkty są pogrupowane według kategorii (nabiał, warzywa, mięso itd.) — łatwiej robić zakupy idąc przez sklep
- Odhaczasz produkt → leci do sekcji "Kupione" na dole
- Po zakupach klikasz "Usuń kupione" → lista się czyści, sesja trafia do historii

### Autouzupełnianie
- Zacznij pisać nazwę produktu → aplikacja podpowiada
- Podpowiedzi uczą się z czasem — produkty które kupujesz często pojawiają się wyżej

### Sugestie "Może potrzebujesz?"
- Nad listą pojawiają się chipsy z produktami, które regularnie kupujesz a których nie ma jeszcze na liście
- Jedno kliknięcie = produkt na liście
- Możesz ukryć sugestię krzyżykiem — wróci po kolejnych 5 zakupach

### Szablony
- Gotowe zestawy produktów do konkretnych dań (46 przepisów — od spaghetti po pierogi)
- Klikasz "Użyj szablonu" → wszystkie składniki lądują na liście jednym kliknięciem
- Możesz tworzyć własne szablony i edytować istniejące

### Historia
- Każde zakupy są zapamiętywane automatycznie
- Możesz powtórzyć poprzednią listę jednym kliknięciem

### Statystyki
- Które produkty kupujesz najczęściej
- Ulubione kategorie (wykres)
- Ulubione szablony/dania
- Możesz zresetować statystyki jeśli chcesz zacząć od nowa

### Tryb ciemny
- Przełącznik w prawym górnym rogu — aplikacja zapamiętuje Twój wybór

### Gazetka Kaufland
- Osobna zakładka z linkiem do aktualnej gazetki promocyjnej Kaufland
- Otwiera się w nowej karcie przeglądarki (jednym kliknięciem)

---

## Jak zainstalować na telefonie

Aplikacja działa w przeglądarce, ale można ją też zainstalować jak normalną apkę — wtedy działa bez paska przeglądarki i ma ikonę na ekranie głównym.

**Na iPhonie:**
1. Otwórz Safari i wejdź na https://zakupowo-28267.web.app
2. Naciśnij ikonę udostępniania (kwadrat ze strzałką ↑) na dole ekranu
3. Wybierz "Dodaj do ekranu głównego"
4. Zatwierdź — ikona pojawi się jak normalna aplikacja

**Na Androidzie:**
1. Otwórz Chrome i wejdź na https://zakupowo-28267.web.app
2. Chrome wyświetli baner "Zainstaluj aplikację" — kliknij
3. Albo: menu (trzy kropki w prawym górnym rogu) → "Dodaj do ekranu głównego"

---

## Jak działa synchronizacja

Oboje korzystacie z tej samej aplikacji pod tym samym adresem. Dane są przechowywane w chmurze (Google Firebase) i synchronizują się automatycznie:

- Dodasz produkt → druga osoba widzi go w ciągu sekundy, bez odświeżania
- Ona odhacza produkt → Ty to widzisz natychmiast
- Działa też bez internetu — zmiany zapisują się na telefonie i synchronizują gdy internet wróci

---

## Jak zaktualizować aplikację po zmianach

Jeśli w kodzie zostały wprowadzone zmiany i chcesz je wgrać na serwer, wystarczy jedno polecenie w terminalu (w folderze projektu):

```
npm run deploy
```

To automatycznie buduje nową wersję i wgrywa ją pod adres aplikacji. Użytkownicy zobaczą aktualizację przy następnym otwarciu.

---

## Struktura projektu (dla zainteresowanych)

```
Zakupowo/
├── src/
│   ├── components/     — widoczne elementy aplikacji (lista, szablony, historia...)
│   ├── hooks/          — logika biznesowa (synchronizacja, obliczenia)
│   ├── data/           — baza produktów i szablonów dań (wbudowana w aplikację)
│   └── types/          — definicje typów danych
├── public/
│   ├── icon.svg        — źródłowa ikona aplikacji
│   └── icons/          — ikony PWA w różnych rozmiarach
├── scripts/
│   └── generate-icons.mjs  — skrypt generujący ikony PNG z pliku SVG
├── tasks/
│   ├── todo.md         — plan i postęp projektu
│   └── lessons.md      — wnioski i lekcje z budowania
├── firebase.json       — konfiguracja serwera (Firebase Hosting)
└── .env                — klucze dostępu do Firebase (nie jest w repozytorium)
```

---

## Technologie (w skrócie)

| Co | Czym |
|---|---|
| Interfejs | React + Tailwind CSS |
| Baza danych | Google Firestore (chmura, real-time) |
| Serwer | Firebase Hosting |
| Wykresy | Recharts |
| Typ aplikacji | PWA (Progressive Web App) |
