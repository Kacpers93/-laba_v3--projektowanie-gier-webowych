# Feature: ui

Runtime module odpowiedzialny za lifecycle HUD/menu i obsluge globalnych skrotow menu.

Uwaga architektoniczna:
- Kanoniczna implementacja runtime UI jest w `src/ui/runtime/UiRuntimeModule.ts`.
- `src/features/ui/module.ts` pozostaje jako warstwa kompatybilnosci i re-export.
