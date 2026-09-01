import '@/styles/reset.css';
import '@/styles/layers.css';
import '@ui/styles/index.css';
import { bootstrap } from './app/Bootstrap.ts';

if (import.meta.env.DEV) {
	void import('@dev/styles/dev-overlay.css');
}

void bootstrap();

