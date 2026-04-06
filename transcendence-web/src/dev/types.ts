/** Metryka odczytowa - label + dynamiczna wartosc. */
export interface DevMetric {
  id: string;
  label: string;
  getter: () => string | number;
  element?: HTMLElement;
}

/** Kontrola interaktywna (checkbox, slider, button w przyszlosci). */
export interface DevControl {
  id: string;
  label: string;
  type: 'checkbox';
  value: boolean;
  onChange: (value: boolean) => void;
  element?: HTMLElement;
}
