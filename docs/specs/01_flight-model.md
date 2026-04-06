# Model lotu

> Status: v1.1 — zatwierdzona
> Pliki implementacyjne: `src/physics/movement/flightModel.ts`, `src/systems/flight/flightControlSystem.ts`

## Zasada podstawowa

Fizyka Newtonowska. Brak oporu powietrza.
Bez aktywnego thrustu statek leci z aktualną prędkością.

```txt
vx += ax * dt
vy += ay * dt
x  += vx * dt
y  += vy * dt
```

## Thrustery

Każdy statek ma 4 wbudowane thrustery:

| Thruster | Kierunek | Siła względna |
|---|---|---|
| `rear` | do przodu (heading) | 1.0 |
| `front` | hamowanie (wstecz) | 0.3 |
| `strafe_left` | lewo | 0.4 |
| `strafe_right` | prawo | 0.4 |

Siła bezwzględna = `drive.thrust × relativePower × (nominalMass / totalMass)`

Zużycie reaktora = `thruster.powerMW × dt` per aktywny thruster per sekundę.

## Obrót statku

Obrót jest zawsze kontrolowany przez gracza.

Statek nie ma bezwładności rotacyjnej — obraca się z prędkością kątową napędu `rotationSpeed` deg/s.

### Tryb klawiatury
- Akcja `rotate-left` obraca w lewo z pełną prędkością `rotationSpeed`.
- Akcja `rotate-right` obraca w prawo z pełną prędkością `rotationSpeed`.

### Tryb myszy
- Aktywacja celowania wskaźnikiem ustawia `targetHeading` = kąt do kursora na ekranie.
- Statek obraca się w stronę `targetHeading` z prędkością `rotationSpeed`.
- Kąt nie teleportuje się natychmiast.
- Wejście odpowiedzialne za celowanie wskaźnikiem nie odpala broni.
- Strzelanie: akcja `fire-weapon` (broń główna), akcja `fire-missile` (wyrzutnia).

Domyślne klawisze dla tych akcji są zdefiniowane i konfigurowalne w systemie input/key bindings.

```ts
function rotateTowards(current: number, target: number, maxDeg: number, dt: number): number {
  const diff = normalizeAngle(target - current);
  const step = Math.sign(diff) * Math.min(Math.abs(diff), maxDeg * dt);
  return current + step;
}
```

## Flight Assist

Przełącznik: `ON` / `OFF`.
Domyślnie: `ON`.
Klawisz przełączania: do ustalenia.

### OFF
Czysta fizyka, gracz sam hamuje akcjami lotu.

### ON
System rozkłada `(vx, vy)` na składowe w lokalnym układzie statku
i hamuje każdą dostępnym thrusterem:

| Składowa | Thruster |
|---|---|
| Do tyłu | `front` |
| Boczna lewo | `strafe_right` |
| Boczna prawo | `strafe_left` |
| Do przodu | brak — nie hamuje |

Assist nie kontroluje obrotu.
Jeśli gracz obróci dziób przeciwnie do wektora prędkości,
`rear` thruster aktywowany ręcznie pomaga w hamowaniu.

```ts
function applyFlightAssist(ship: PlayerShip, dt: number): void {
  if (Math.hypot(ship.vx, ship.vy) < 0.5) return;

  const forward = projectOnHeading(ship.vx, ship.vy, ship.angle);
  const lateral = projectOnHeading(ship.vx, ship.vy, ship.angle + 90);

  if (forward < -1) applyThruster(ship, 'front', dt);
  if (lateral > 1) applyThruster(ship, 'strafe_left', dt);
  if (lateral < -1) applyThruster(ship, 'strafe_right', dt);
}
```

## Prędkość maksymalna

`maxSpeed` można przekroczyć odpowiednio silnym napędem.

Soft drag aktywuje się dopiero powyżej `maxSpeed × 1.1`:

```ts
const speed = Math.hypot(ship.vx, ship.vy);
const softLimit = ship.effectiveMaxSpeed * 1.1;

if (speed > softLimit) {
  const drag = 0.15 * (speed - softLimit);
  ship.vx -= (ship.vx / speed) * drag * dt;
  ship.vy -= (ship.vy / speed) * drag * dt;
}
```

```txt
effectiveMaxSpeed = baseMaxSpeed × sqrt(nominalMass / totalMass)
```

`nominalMass` = `hullMass + installedDrive.mass`

`baseMaxSpeed` w `ShipDef` jest mierzony dla pustego kadłuba z bazowym napędem.

## Poza zakresem

Ten moduł nie:
- zarządza stanem reaktora,
- oblicza masy statku,
- obsługuje kolizji ze stacjami ani granicami mapy.