# Feature: parallax

## Cel modulu
Modul odpowiada za konfiguracje i render paralaksy tla w scene.

## Parametry wejsciowe/wyjsciowe
- Wejscie: RuntimeContext (cache offscreen, SceneRenderer, viewport runtime).
- Wyjscie: zarejestrowana warstwa paralaksy w scene podczas startu runtime.

## Zachowanie brzegowe
- `start()` jest idempotentne i nie doda warstwy drugi raz.
- `dispose()` usuwa warstwe ze sceny i zwalnia referencje runtime.
- `onResize()` bez aktywnej warstwy jest no-op.

## Pliki zakotwiczone i uzasadnienie
- [../../../public/art/asset-manifest.json](../../../public/art/asset-manifest.json): zrodlo mapowania assetow publicznych.
- [../../../vite.config.ts](../../../vite.config.ts): aliasy i konfiguracja bundlera.
- [../../../tsconfig.json](../../../tsconfig.json): mapowanie aliasow TypeScript.

## Publiczne API (`index.ts`)
- `createParallaxFeatureModule()`
- eksporty presetow (`PARALLAX_SUBLAYERS_*`)
- typy kontraktow (`ParallaxFeatureConfig`, `ParallaxSublayerConfig`)
