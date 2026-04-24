import { createParallaxFeatureModule } from '@features/parallax';
import type { FeatureModule } from './FeatureModule';
import type { RuntimeContext } from './RuntimeContext';

export function registerFeatureModules(context: RuntimeContext): FeatureModule[] {
  const modules: FeatureModule[] = [createParallaxFeatureModule()];

  modules.forEach((module) => {
    module.setup(context);
  });

  return modules;
}
