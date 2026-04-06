import { DevSection } from './DevSection';

const PANEL_VISIBILITY_KEY = 'dev-overlay';

/**
 * Dev Overlay Panel - panel debug z metrykami runtime.
 * Rejestr sekcji i metryk. Czestotliwosc odswiezania jest sterowana przez AppShell.
 */
export class DevOverlayPanel {
  private readonly root: HTMLDivElement;
  private readonly body: HTMLDivElement;
  private readonly sections = new Map<string, DevSection>();
  private visible: boolean;
  private collapsed = false;

  public constructor() {
    this.visible = this.readInitialVisibility();

    this.root = document.createElement('div');
    this.root.className = 'dev-overlay';

    const header = document.createElement('div');
    header.className = 'dev-overlay__header';

    const title = document.createElement('span');
    title.textContent = 'Dev Panel';

    const collapse = document.createElement('span');
    collapse.textContent = '▼';

    header.append(title, collapse);
    header.addEventListener('click', () => {
      this.collapsed = !this.collapsed;
      this.root.classList.toggle('dev-overlay--collapsed', this.collapsed);
      this.body.style.display = this.collapsed ? 'none' : '';
      collapse.textContent = this.collapsed ? '▲' : '▼';
    });

    this.body = document.createElement('div');
    this.body.className = 'dev-overlay__body';

    this.root.append(header, this.body);
    this.setVisible(this.visible);
  }

  /** Montuje panel do DOM. */
  public mount(parent: HTMLElement): void {
    parent.append(this.root);
  }

  /** Odmontowuje panel z DOM. */
  public unmount(): void {
    this.root.remove();
  }

  /** Przelacza widocznosc. */
  public toggle(): void {
    this.setVisible(!this.visible);
  }

  /** Ustawia widocznosc. */
  public setVisible(visible: boolean): void {
    this.visible = visible;
    this.root.style.display = this.visible ? 'block' : 'none';
    localStorage.setItem(PANEL_VISIBILITY_KEY, String(this.visible));
  }

  /** Czy panel jest widoczny. */
  public isVisible(): boolean {
    return this.visible;
  }

  /**
   * Rejestruje nowa sekcje.
   * @param id - unikalny identyfikator sekcji (np. 'entities', 'render').
   * @param label - etykieta wyswietlana w naglowku sekcji.
   * @returns DevSection - obiekt sekcji do dodawania metryk.
   */
  public registerSection(id: string, label: string): DevSection {
    const existing = this.sections.get(id);
    if (existing) {
      return existing;
    }

    const section = new DevSection(id, label);
    this.sections.set(id, section);
    section.render(this.body);
    return section;
  }

  /** Usuwa sekcje. */
  public removeSection(id: string): void {
    const section = this.sections.get(id);
    if (!section) {
      return;
    }

    this.sections.delete(id);
    this.renderSections();
  }

  /** Pobiera sekcje po id. */
  public getSection(id: string): DevSection | undefined {
    return this.sections.get(id);
  }

  /** Aktualizuje wszystkie sekcje - wywolywane przez AppShell. */
  public update(): void {
    this.sections.forEach((section) => {
      section.update();
    });
  }

  private renderSections(): void {
    this.body.replaceChildren();
    this.sections.forEach((section) => {
      section.render(this.body);
    });
  }

  private readInitialVisibility(): boolean {
    const query = new URLSearchParams(window.location.search);
    const queryValue = query.get(PANEL_VISIBILITY_KEY);
    if (queryValue === 'true') {
      return true;
    }
    if (queryValue === 'false') {
      return false;
    }

    const storageValue = localStorage.getItem(PANEL_VISIBILITY_KEY);
    if (storageValue === 'true') {
      return true;
    }
    if (storageValue === 'false') {
      return false;
    }

    return true;
  }
}
