## Cel pliku
Plik implementuje glowna petle gry oparta o requestAnimationFrame i staly tick logiczny. Zarzadza akumulatorem czasu, pauza i kolejnoscia callbackow update/render.

## Co eksportuje
- Klasa GameLoop

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: requestAnimationFrame, cancelAnimationFrame, performance.now.
- Wewnetrzne: typ GameLoopConfig z src/types/engine.ts.

## Jak uzywac (minimalny przyklad)
```ts
import { GameLoop } from './GameLoop';

const loop = new GameLoop({
  tickRate: 30,
  onFixedUpdate: (dt) => {},
  onFrameUpdate: (dt, alpha) => {},
  onFrameRender: (alpha) => {},
});
loop.start();
```

## Czego NIE robi
- Nie zarzadza stanem gry ani kolejnoscia systemow domenowych.
- Nie synchronizuje czasu sieciowego ani rollbacku.
