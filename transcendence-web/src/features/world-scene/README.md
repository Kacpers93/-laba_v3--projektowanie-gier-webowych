# Feature: world-scene

## Cel modulu
Modul odpowiada za skladanie i lifecycle warstw sceny: world, effects i debug.

## Parametry wejsciowe/wyjsciowe
- Wejscie: RuntimeContext oraz opcjonalne hooki (`onWorldLayerReady`).
- Wyjscie: zarejestrowane warstwy SceneLayer w SceneRenderer.

## Zachowanie brzegowe
- `start()` jest idempotentne i nie rejestruje warstw wielokrotnie.
- `dispose()` usuwa warstwy w odwrotnej kolejnosci.
- `onResize()` obecnie no-op (warstwy nie wymagaja regeneracji viewport cache).

## Pliki zakotwiczone i uzasadnienie
- [../../../vite.config.ts](../../../vite.config.ts): aliasy i konfiguracja bundlera.
- [../../../tsconfig.json](../../../tsconfig.json): mapowanie aliasow TypeScript.

## Publiczne API (`index.ts`)
- `createWorldSceneFeatureModule()`
- `WorldSceneModuleHooks`
- klasy warstw: `WorldLayer`, `EffectsLayer`, `DebugLayer`
