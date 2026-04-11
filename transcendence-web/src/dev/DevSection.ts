import type { DevControl, DevMetric, DevSelectOption } from './types';

/**
 * Sekcja panelu debug - grupa powiazanych metryk.
 */
export class DevSection {
  public readonly id: string;
  public readonly label: string;
  private collapsed = false;
  private readonly metrics = new Map<string, DevMetric>();
  private readonly controls = new Map<string, DevControl>();
  private rootElement?: HTMLElement;
  private bodyElement?: HTMLDivElement;
  private containerElement?: HTMLElement;

  public constructor(id: string, label: string) {
    this.id = id;
    this.label = label;
  }

  /**
   * Rejestruje metryke wyswietlana jako label: value.
   * @param id - unikalny identyfikator metryki w sekcji.
   * @param label - etykieta metryki.
   * @param getter - funkcja zwracajaca aktualna wartosc (odpytywana przy aktualizacji panelu 4 Hz).
   */
  public registerMetric(id: string, label: string, getter: () => string | number): void {
    this.metrics.set(id, { id, label, getter });
    if (this.containerElement) {
      this.render(this.containerElement);
    }
  }

  /** Usuwa metryke. */
  public removeMetric(id: string): void {
    this.metrics.delete(id);
    if (this.containerElement) {
      this.render(this.containerElement);
    }
  }

  /**
   * Rejestruje kontrole (np. checkbox).
   * @param id - unikalny identyfikator kontroli.
   * @param label - etykieta.
   * @param type - typ kontroli ('checkbox' lub 'button').
   * @param initialValue - wartosc poczatkowa dla checkboxa.
   * @param onChange - callback przy zmianie lub kliknieciu.
   */
  public registerControl(
    id: string,
    label: string,
    type: 'checkbox',
    initialValue: boolean,
    onChange: (value: boolean) => void,
  ): void;
  public registerControl(
    id: string,
    label: string,
    type: 'button',
    initialValue: undefined,
    onChange: () => void,
  ): void;
  public registerControl(
    id: string,
    label: string,
    type: 'select',
    initialValue: string,
    onChange: (value: string) => void,
    options: DevSelectOption[],
  ): void;
  public registerControl(
    id: string,
    label: string,
    type: 'number',
    initialValue: number,
    onChange: (value: number) => void,
    bounds?: { min?: number; max?: number; step?: number },
  ): void;
  public registerControl(
    id: string,
    label: string,
    type: 'checkbox' | 'button' | 'select' | 'number',
    initialValue: boolean | number | string | undefined,
    onChange: ((value: boolean) => void) | ((value: string) => void) | ((value: number) => void) | (() => void),
    optionsOrBounds?: DevSelectOption[] | { min?: number; max?: number; step?: number },
  ): void {
    if (type === 'checkbox') {
      const checkboxOnChange = onChange as (value: boolean) => void;
      this.controls.set(id, {
        id,
        label,
        type,
        value: typeof initialValue === 'boolean' ? initialValue : false,
        onChange: checkboxOnChange,
      });
    } else {
      const buttonOnClick = onChange as () => void;
      if (type === 'button') {
        this.controls.set(id, {
          id,
          label,
          type,
          onClick: buttonOnClick,
        });
      } else if (type === 'select') {
        const selectOnChange = onChange as (value: string) => void;
        this.controls.set(id, {
          id,
          label,
          type,
          value: typeof initialValue === 'string' ? initialValue : '',
          options: Array.isArray(optionsOrBounds) ? optionsOrBounds : [],
          onChange: selectOnChange,
        });
      } else {
        const numberOnChange = onChange as (value: number) => void;
        const bounds = !Array.isArray(optionsOrBounds) ? optionsOrBounds : undefined;
        this.controls.set(id, {
          id,
          label,
          type,
          value: typeof initialValue === 'number' ? initialValue : 0,
          min: bounds?.min,
          max: bounds?.max,
          step: bounds?.step,
          onChange: numberOnChange,
        });
      }
    }

    if (this.containerElement) {
      this.render(this.containerElement);
    }
  }

  /** Aktualizuje widzety sekcji - wywolywane przez panel z throttle 4 Hz (co 250 ms). */
  public update(): void {
    this.metrics.forEach((metric) => {
      if (!metric.element) {
        return;
      }

      const valueElement = metric.element.querySelector<HTMLElement>('.dev-overlay__metric-value');
      if (!valueElement) {
        return;
      }

      valueElement.textContent = String(metric.getter());
    });
  }

  /** Przelacza zwiniecie sekcji. */
  public toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.applyCollapseState();
  }

  /** Buduje/aktualizuje DOM sekcji. */
  public render(container: HTMLElement): void {
    this.containerElement = container;
    const section = document.createElement('section');
    section.className = 'dev-overlay__section';

    const header = document.createElement('div');
    header.className = 'dev-overlay__section-header';

    const arrow = document.createElement('span');
    arrow.textContent = this.collapsed ? '▶' : '▼';

    const label = document.createElement('span');
    label.textContent = this.label;

    header.append(arrow, label);
    header.addEventListener('click', () => {
      this.toggleCollapse();
    });

    const body = document.createElement('div');
    body.className = 'dev-overlay__section-body';

    this.metrics.forEach((metric) => {
      const row = document.createElement('div');
      row.className = 'dev-overlay__metric';

      const labelElement = document.createElement('span');
      labelElement.className = 'dev-overlay__metric-label';
      labelElement.textContent = metric.label;

      const valueElement = document.createElement('span');
      valueElement.className = 'dev-overlay__metric-value';
      valueElement.textContent = String(metric.getter());

      row.append(labelElement, valueElement);
      metric.element = row;
      body.append(row);
    });

    this.controls.forEach((control) => {
      if (control.type === 'checkbox') {
        const checkboxLabel = document.createElement('label');
        checkboxLabel.className = 'dev-overlay__checkbox';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = control.value;
        input.addEventListener('change', () => {
          control.value = input.checked;
          control.onChange(control.value);
        });

        const text = document.createElement('span');
        text.textContent = control.label;

        checkboxLabel.append(input, text);
        control.element = checkboxLabel;
        body.append(checkboxLabel);
      } else {
        if (control.type === 'select') {
          const selectLabel = document.createElement('label');
          selectLabel.className = 'dev-overlay__select';

          const text = document.createElement('span');
          text.textContent = control.label;

          const select = document.createElement('select');
          select.value = control.value;
          control.options.forEach((option) => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            select.append(optionElement);
          });
          select.addEventListener('change', () => {
            control.value = select.value;
            control.onChange(control.value);
          });

          selectLabel.append(text, select);
          control.element = selectLabel;
          body.append(selectLabel);
          return;
        }

        if (control.type === 'number') {
          const numberLabel = document.createElement('label');
          numberLabel.className = 'dev-overlay__number';

          const text = document.createElement('span');
          text.textContent = control.label;

          const input = document.createElement('input');
          input.type = 'number';
          input.value = String(control.value);
          if (control.min !== undefined) {
            input.min = String(control.min);
          }
          if (control.max !== undefined) {
            input.max = String(control.max);
          }
          if (control.step !== undefined) {
            input.step = String(control.step);
          }
          input.addEventListener('change', () => {
            const parsed = Number(input.value);
            if (Number.isFinite(parsed)) {
              control.value = parsed;
              control.onChange(control.value);
            }
          });

          numberLabel.append(text, input);
          control.element = numberLabel;
          body.append(numberLabel);
          return;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'dev-overlay__button';
        button.textContent = control.label;
        button.addEventListener('click', () => {
          control.onClick();
        });

        control.element = button;
        body.append(button);
      }
    });

    section.append(header, body);

    if (this.rootElement && this.rootElement.parentElement) {
      this.rootElement.replaceWith(section);
    } else {
      container.append(section);
    }

    this.rootElement = section;
    this.bodyElement = body;
    this.applyCollapseState();
  }

  private applyCollapseState(): void {
    if (!this.rootElement || !this.bodyElement) {
      return;
    }

    const arrow = this.rootElement.querySelector('.dev-overlay__section-header span');
    if (arrow) {
      arrow.textContent = this.collapsed ? '▶' : '▼';
    }

    this.bodyElement.style.display = this.collapsed ? 'none' : '';
  }
}
