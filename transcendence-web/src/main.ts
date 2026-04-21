import '@/styles/reset.css';
import '@/styles/layers.css';
import '@/styles/hud.css';
import '@/styles/menu.css';
import { bootstrap } from './app/Bootstrap.ts';

if (import.meta.env.DEV) {
	void import('@dev/styles/dev-overlay.css');
}

void bootstrap();

