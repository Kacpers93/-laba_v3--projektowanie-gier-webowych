import { createBackgroundFeatureModule } from '@features/background';
import { createParallaxFeatureModule } from '@features/parallax';
import { createWorldSceneFeatureModule } from '@features/world-scene';
import type { WorldSceneModuleHooks } from '@features/world-scene';
import type { FeatureModule } from './FeatureModule';
import type { RuntimeContext } from './RuntimeContext';

export interface RegisterFeatureModulesOptions {
  worldScene?: WorldSceneModuleHooks;
}

export function registerFeatureModules(
  context: RuntimeContext,
  options: RegisterFeatureModulesOptions = {},
): FeatureModule[] {
  const modules: FeatureModule[] = [
    createWorldSceneFeatureModule(options.worldScene),
    createBackgroundFeatureModule(),
    createParallaxFeatureModule(),
  ];

  modules.forEach((module) => {
    module.setup(context);
  });

  return modules;
}
