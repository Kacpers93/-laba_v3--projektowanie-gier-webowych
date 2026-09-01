import {
  BASE_HEIGHT_BY_SEED_TYPE,
  type SeedObjectType,
} from '@world/seed';
import type {
  DevOverlayLike,
  DevOverlaySelectOption,
  DevSpawnFormConfig,
} from './contracts';

const DEV_SPAWN_DEFAULT_ORBIT_RADIUS = 300;
const DEV_SPAWN_DEFAULT_ORBIT_PHASE = 0;

interface RegisterDevSpawnSectionOptions {
  overlay: DevOverlayLike;
  getProfileOptionsForSeedType: (type: SeedObjectType) => DevOverlaySelectOption[];
  getOrbitAroundOptions: () => DevOverlaySelectOption[];
  spawnDevEntityFromForm: (config: DevSpawnFormConfig & { type: SeedObjectType }) => boolean;
  onOrbitAroundRefreshReady: (refresh: () => void) => void;
}

export function registerDevSpawnSection({
  overlay,
  getProfileOptionsForSeedType,
  getOrbitAroundOptions,
  spawnDevEntityFromForm,
  onOrbitAroundRefreshReady,
}: RegisterDevSpawnSectionOptions): void {
  const section = overlay.registerSection('dev-spawn', 'Dev Spawn');
  const seedTypes: SeedObjectType[] = [
    'star',
    'planet',
    'moon',
    'gate',
    'station-wreck',
    'station',
    'container',
    'ship-wreck',
    'npc-ship',
    'player-ship',
  ];

  let selectedType: SeedObjectType = 'npc-ship';
  let selectedProfileId = '';
  let orbitRadius = DEV_SPAWN_DEFAULT_ORBIT_RADIUS;
  let orbitPhase = DEV_SPAWN_DEFAULT_ORBIT_PHASE;
  let orbitAround: string | null = null;
  let height = BASE_HEIGHT_BY_SEED_TYPE[selectedType];

  const refreshHeightControl = (): void => {
    section.registerControl(
      'height',
      'height',
      'number',
      height,
      (value: number) => {
        const normalized = Math.max(1, Math.round(value));
        if (selectedType === 'player-ship' && normalized < 11) {
          height = 11;
          refreshHeightControl();
          return;
        }

        height = normalized;
      },
      { min: 1, step: 1 },
    );
  };

  const refreshProfileControl = (): void => {
    const options = getProfileOptionsForSeedType(selectedType);
    if (options.length > 0 && !options.some((option) => option.value === selectedProfileId)) {
      selectedProfileId = options[0].value;
    }

    if (options.length === 0) {
      selectedProfileId = '';
    }

    section.registerControl(
      'profile-id',
      'profileId',
      'select',
      selectedProfileId,
      (value: string) => {
        selectedProfileId = value;
      },
      {
        options:
          options.length > 0
            ? options
            : [
                {
                  value: '',
                  label: '(no matching profiles)',
                },
              ],
      },
    );
  };

  const refreshOrbitAroundControl = (): void => {
    const options = [
      { value: '', label: 'centrum' },
      ...getOrbitAroundOptions(),
    ];

    if (!options.some((option) => option.value === (orbitAround ?? ''))) {
      orbitAround = null;
    }

    section.registerControl(
      'orbit-around',
      'orbitAround',
      'select',
      orbitAround ?? '',
      (value: string) => {
        orbitAround = value === '' ? null : value;
      },
      { options },
    );
  };

  onOrbitAroundRefreshReady(refreshOrbitAroundControl);

  section.registerControl(
    'type',
    'type',
    'select',
    selectedType,
    (value: string) => {
      if (!isSeedObjectType(value)) {
        return;
      }

      selectedType = value;
      height = BASE_HEIGHT_BY_SEED_TYPE[selectedType];

      refreshHeightControl();
      refreshProfileControl();
    },
    {
      options: seedTypes.map((type) => ({ value: type, label: type })),
    },
  );

  section.registerControl(
    'orbit-radius',
    'orbitRadius',
    'number',
    orbitRadius,
    (value: number) => {
      orbitRadius = Math.max(0, Math.round(value));
    },
    { min: 0, step: 1 },
  );

  section.registerControl(
    'orbit-phase',
    'orbitPhase',
    'number',
    orbitPhase,
    (value: number) => {
      orbitPhase = value;
    },
    { step: 1 },
  );

  refreshHeightControl();
  refreshProfileControl();
  refreshOrbitAroundControl();

  section.registerControl('spawn', 'Spawn', 'button', undefined, () => {
    const spawned = spawnDevEntityFromForm({
      type: selectedType,
      profileId: selectedProfileId,
      orbitRadius,
      orbitPhase,
      orbitAround,
      height,
    });

    if (spawned) {
      refreshOrbitAroundControl();
    }
  });
}

function isSeedObjectType(value: string): value is SeedObjectType {
  return (
    value === 'star' ||
    value === 'planet' ||
    value === 'moon' ||
    value === 'gate' ||
    value === 'station-wreck' ||
    value === 'station' ||
    value === 'container' ||
    value === 'ship-wreck' ||
    value === 'npc-ship' ||
    value === 'player-ship'
  );
}
