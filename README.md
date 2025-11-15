# Symulacja ewolucji – prototyp

Statyczna aplikacja HTML/CSS/JS przedstawiająca pierwsze etapy symulacji ewolucji na siatce 2D.

## Uruchomienie lokalne

Przeglądarki blokują moduły ES importowane z protokołu `file://`. Aby zobaczyć działającą aplikację:

1. Otwórz katalog projektu w terminalu.
2. Uruchom prosty serwer HTTP, np.:
   ```bash
   python -m http.server 8000
   ```
3. Wejdź w przeglądarce na adres `http://localhost:8000/` i wybierz `index.html`.

Po załadowaniu strony użyj przycisku **Start**, aby zainicjować populację, a następnie **Krok (tura)**, by obserwować metabolizm oraz losowy ruch istot.

## Hosting na GitHub Pages

GitHub Pages obsługuje statyczne pliki bez dodatkowej konfiguracji. Najprostsza ścieżka:

1. Upewnij się, że wszystkie pliki (`index.html`, `styles.css`, katalog `js/`) znajdują się w głównym katalogu repozytorium.
2. W repozytorium na GitHubie przejdź do **Settings → Pages**.
3. W sekcji **Build and deployment** ustaw **Source** na `Deploy from a branch`, a jako gałąź wybierz np. `main` i katalog `/ (root)`.
4. Zapisz ustawienia – po kilkudziesięciu sekundach strona będzie dostępna pod adresem `https://<twoja-nazwa>.github.io/<nazwa-repozytorium>/`.

> Jeśli korzystasz z oddzielnej gałęzi `gh-pages`, wystarczy skopiować katalog projektu na tę gałąź i opublikować. Struktura katalogów musi pozostać taka sama, aby ścieżki do modułów (`js/main.js` itd.) działały poprawnie.

## Hosting na serwerze (home.pl / zenbox itp.)

1. Połącz się ze swoim serwerem przez FTP lub panel hostingowy.
2. Utwórz katalog na pliki aplikacji i skopiuj do niego cały projekt (z zachowaniem struktury katalogów).
3. Upewnij się, że katalog publiczny wskazuje na lokalizację z `index.html` – po wejściu na adres domeny pliki powinny być serwowane jako statyczne.

Nie jest potrzebne żadne dodatkowe środowisko wykonawcze. Jeżeli host oferuje wymuszony HTTPS lub własny katalog publiczny (np. `public_html`), wystarczy umieścić tam wszystkie pliki z repozytorium.

## Rozwiązywanie konfliktów przy scalaniu (merge conflicts)

Jeżeli GitHub wyświetla komunikat **“This branch has conflicts that must be resolved”**, wykonaj te kroki lokalnie:

1. Zaktualizuj główną gałąź i połącz ją ze swoją gałęzią roboczą:
   ```bash
   git fetch origin
   git checkout <twoja-gałąź>
   git merge origin/main
   ```
2. W plikach oznaczonych przez Gita usuń sekcje pomiędzy `<<<<<<<`, `=======` i `>>>>>>>`, pozostawiając właściwą wersję kodu.
3. Sprawdź stan repozytorium (`git status`), a następnie dodaj poprawione pliki i zatwierdź zmiany:
   ```bash
   git add <pliki-z-konfliktami>
   git commit
   git push
   ```

Alternatywnie można użyć przycisku **Resolve conflicts** bezpośrednio w interfejsie GitHuba, a po zapisaniu zmian wykonać „Commit merge”.

### Co oznaczają opcje „current”, „incoming” i „both”

Podczas rozwiązywania konfliktu w edytorze GitHub pojawiają się przyciski:

* **Accept current change** – zachowuje fragment kodu pochodzący z Twojej gałęzi (tej, na której pracujesz).
* **Accept incoming change** – zachowuje fragment, który pochodzi z gałęzi, do której się scalasz (np. `main`).
* **Accept both changes** – wstawia kolejno oba fragmenty; przydatne, gdy trzeba połączyć logikę z obu gałęzi i dopiero ręcznie je dopracować.

Jeżeli żadna z opcji nie odpowiada dokładnie temu, co chcesz uzyskać, możesz kliknąć **Mark as resolved** dopiero po ręcznej edycji fragmentu – usuń znaczniki konfliktu i wpisz własną, poprawną wersję kodu. Po zapisaniu zmian i oznaczeniu konfliktu jako rozwiązanego kliknij **Commit merge**.
