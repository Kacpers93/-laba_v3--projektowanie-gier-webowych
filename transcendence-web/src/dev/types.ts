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

export type DevControl = DevCheckboxControl | DevButtonControl;
