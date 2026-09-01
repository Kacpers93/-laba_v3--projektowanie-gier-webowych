export type DevOverlaySelectOption = {
  value: string;
  label: string;
};

export type DevOverlayLike = {
  mount(parent: HTMLElement): void;
  unmount(): void;
  toggle(): void;
  registerSection(id: string, label: string): {
    registerMetric(id: string, label: string, getter: () => string | number): void;
    registerControl(
      id: string,
      label: string,
      type: 'button',
      initialValue: undefined,
      onChange: () => void,
    ): void;
    registerControl(
      id: string,
      label: string,
      type: 'checkbox',
      initialValue: boolean,
      onChange: (value: boolean) => void,
    ): void;
    registerControl(
      id: string,
      label: string,
      type: 'number',
      initialValue: number,
      onChange: (value: number) => void,
      options?: { min?: number; max?: number; step?: number },
    ): void;
    registerControl(
      id: string,
      label: string,
      type: 'select',
      initialValue: string,
      onChange: (value: string) => void,
      options: { options: DevOverlaySelectOption[] },
    ): void;
  };
  update(): void;
};

export type DevOverlaySectionLike = ReturnType<DevOverlayLike['registerSection']>;

export interface DevSpawnFormConfig {
  type: string;
  profileId: string;
  orbitRadius: number;
  orbitPhase: number;
  orbitAround: string | null;
  height: number;
}
