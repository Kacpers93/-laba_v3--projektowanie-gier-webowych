# Feature: background

## Cel modulu
Modul odpowiada za gwiezdne tlo sceny i jego przesuniecie wzgledem kamery.

## Parametry wejsciowe/wyjsciowe
- Wejscie: RuntimeContext (cache offscreen, SceneRenderer, viewport runtime).
- Wyjscie: zarejestrowana warstwa background w scenie podczas startu runtime.

## Zachowanie brzegowe
- `start()` jest idempotentne i nie doda warstwy drugi raz.
- `dispose()` usuwa warstwe ze sceny i zeruje referencje runtime.
- `onResize()` bez aktywnej warstwy jest no-op.

## Pliki zakotwiczone i uzasadnienie
- [../../../vite.config.ts](../../../vite.config.ts): aliasy i konfiguracja bundlera.
- [../../../tsconfig.json](../../../tsconfig.json): mapowanie aliasow TypeScript.

## Publiczne API (`index.ts`)
- `createBackgroundFeatureModule()`
- `DEFAULT_BACKGROUND_CONFIG`
- typy kontraktow (`BackgroundFeatureConfig`, `BackgroundConfig`)
