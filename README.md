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
