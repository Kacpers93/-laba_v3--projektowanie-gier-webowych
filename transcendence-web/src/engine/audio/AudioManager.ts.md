## Cel pliku
Plik implementuje zarzadzanie audio aplikacji, w tym inicjalizacje AudioContext oraz podstawowa obsluge kanalow music/sfx/ui. Udostepnia metody odtwarzania i regulacji glosnosci.

## Co eksportuje
- Klasa AudioManager

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: Web Audio API (AudioContext, GainNode), HTMLAudioElement.
- Wewnetrzne: brak importow.

## Jak uzywac (minimalny przyklad)
```ts
import { AudioManager } from './AudioManager';

const audio = new AudioManager();
await audio.init();
audio.setVolume('music', 0.5);
audio.playMusic('/audio/theme.mp3');
```

## Czego NIE robi
- Nie zarzadza kolejkami ani miksowaniem zaawansowanych efektow audio.
- Nie implementuje systemu zasobow audio (lazy loading, cache plikow).
