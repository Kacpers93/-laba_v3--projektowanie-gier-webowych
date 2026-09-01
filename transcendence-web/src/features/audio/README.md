# Feature: audio

Runtime module odpowiedzialny za inicjalizacje audio po pierwszej interakcji pointerdown.

Uwaga architektoniczna:
- Kanoniczna implementacja runtime audio jest w `src/engine/audio/AudioRuntimeModule.ts`.
- `src/features/audio/module.ts` pozostaje jako warstwa kompatybilnosci i re-export.
