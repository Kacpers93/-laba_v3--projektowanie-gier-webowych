# Deploy na serwer uczelniany (ZIP + Docker Compose)

## Co musi byc w ZIP
- `docker-compose.yml` w glownym katalogu ZIP.
- `Dockerfile` w glownym katalogu ZIP.
- katalog `transcendence-web/` z kodem gry.

## Jak przygotowac ZIP
1. Wejdz do glownego katalogu projektu (tam gdzie jest `docker-compose.yml`).
2. Spakuj tylko potrzebne pliki i foldery do jednego ZIP: `docker-compose.yml`, `Dockerfile`, `transcendence-web/`.
3. Upewnij sie, ze po rozpakowaniu ZIP od razu widac `docker-compose.yml` na najwyzszym poziomie.

Komenda jednorazowa (nadpisuje poprzedni ZIP):
```bash
rm -f Transcendence-web.zip && zip -r Transcendence-web.zip docker-compose.yml Dockerfile transcendence-web -x "*/node_modules/*" "*/dist/*" "*.DS_Store"
```

Komenda codzienna (unikalna nazwa ZIP z data):
```bash
ZIP_NAME="Transcendence-web_$(date +%Y%m%d_%H%M%S).zip" && zip -r "$ZIP_NAME" docker-compose.yml Dockerfile transcendence-web -x "*/node_modules/*" "*/dist/*" "*.DS_Store" && echo "Utworzono: $ZIP_NAME"
```

Staly skrot przez skrypt w repo:
```bash
bash pack_game_zip.sh
```

## Upload
1. Zaloguj sie do panelu studenta.
2. Wybierz opcje uploadu aplikacji/ZIP. 
3. Wrzuc ZIP.
4. Uruchom deployment.

## Szybka diagnostyka
- Jesli panel pokazuje blad "brak docker-compose", to znaczy, ze ZIP ma zly poziom katalogow.
- Jesli aplikacja sie buduje, ale nie otwiera, sprawdz logi kontenera `transcendence-web-app`.
- Compose mapuje port jako `${PORT:-8080}:80`, wiec panel moze podstawic wlasny port przez `PORT`.

## Uwagi
- Aplikacja uruchamia sie w trybie produkcyjnym (build Vite + Nginx), nie w trybie dev.
- Jesli pojawi sie blad `unknown shorthand flag: 'p' in -p`, to jest problem konfiguracji panelu/serwera (Docker Compose po stronie uczelni), a nie struktury ZIP.
