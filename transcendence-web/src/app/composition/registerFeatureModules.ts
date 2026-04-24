import { createBackgroundFeatureModule } from '@features/background';
import { createParallaxFeatureModule } from '@features/parallax';
import type { FeatureModule } from './FeatureModule';
import type { RuntimeContext } from './RuntimeContext';

export function registerFeatureModules(context: RuntimeContext): FeatureModule[] {
  const modules: FeatureModule[] = [
    createBackgroundFeatureModule(),
    createParallaxFeatureModule(),
  ];

  modules.forEach((module) => {
    module.setup(context);
  });

  return modules;
}
