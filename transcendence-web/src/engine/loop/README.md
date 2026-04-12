# src/engine/loop

## Cel folderu
Zawiera petle czasu gry z oddzieleniem fixed update i render frame.

## Co zawiera
- `GameLoop.ts`: klasa `GameLoop` z kontrola `start/stop/pause/resume`, akumulatorem czasu i callbackami z `GameLoopConfig`.

## Zaleznosci zewnetrzne i wewnetrzne
- Zewnetrzne: `requestAnimationFrame`, `performance.now`.
- Wewnetrzne: typ `GameLoopConfig` z `src/types/engine`.

## Jak uzywac
```ts
const loop = new GameLoop({
  tickRate: 30,
  onFixedUpdate: (dt) => {},
  onFrameUpdate: (dt, alpha) => {},
  onFrameRender: (alpha) => {},
});
loop.start();
```

## Dokumentacja plikowa
- GameLoop.ts.md

## Czego NIE robi
- Nie harmonizuje petli sieciowej.
- Nie robi profilowania ani statystyk FPS poza prostym logowaniem.
