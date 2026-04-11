/** Metryka odczytowa - label + dynamiczna wartosc. */
export interface DevMetric {
  id: string;
  label: string;
  getter: () => string | number;
  element?: HTMLElement;
}

/** Kontrola interaktywna checkbox. */
export interface DevCheckboxControl {
  id: string;
  label: string;
  type: 'checkbox';
  value: boolean;
  onChange: (value: boolean) => void;
  element?: HTMLElement;
}

/** Kontrola interaktywna button. */
export interface DevButtonControl {
  id: string;
  label: string;
  type: 'button';
  onClick: () => void;
  element?: HTMLElement;
}

export interface DevSelectOption {
  label: string;
  value: string;
}

/** Kontrola interaktywna select. */
export interface DevSelectControl {
  id: string;
  label: string;
  type: 'select';
  value: string;
  options: DevSelectOption[];
  onChange: (value: string) => void;
  element?: HTMLElement;
}

/** Kontrola interaktywna number input. */
export interface DevNumberControl {
  id: string;
  label: string;
  type: 'number';
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  element?: HTMLElement;
}

export type DevControl = DevCheckboxControl | DevButtonControl | DevSelectControl | DevNumberControl;
