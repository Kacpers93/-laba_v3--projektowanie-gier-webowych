import { PARALLAX_SUBLAYERS_COOL } from './cool';
import { PARALLAX_SUBLAYERS_SUBTLE } from './subtle';
import { PARALLAX_SUBLAYERS_WARM } from './warm';

export { PARALLAX_SUBLAYERS_COOL, PARALLAX_SUBLAYERS_SUBTLE, PARALLAX_SUBLAYERS_WARM };

// Zmien tylko ten export, aby przelaczac wariant bez ruszania AppShell.
export const ACTIVE_PARALLAX_SUBLAYERS = PARALLAX_SUBLAYERS_COOL;
