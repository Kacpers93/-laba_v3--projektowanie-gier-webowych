import { AppShell } from './AppShell.ts';

export async function bootstrap(): Promise<void> {
  try {
    const root = document.querySelector<HTMLElement>('#root');
    if (!root) {
      throw new Error('Missing #root element in index.html');
    }

    const appShell = new AppShell(root);
    appShell.start();
  } catch (error) {
    const fallbackRoot = document.body;
    const errorBox = document.createElement('pre');
    errorBox.textContent = `Runtime bootstrap error:\n${String(error)}`;
    errorBox.style.color = '#ff6b6b';
    errorBox.style.padding = '16px';
    fallbackRoot.appendChild(errorBox);
  }
}
