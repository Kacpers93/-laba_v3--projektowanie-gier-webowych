# Przejęcie statku

> Status: v1.1 — zatwierdzona
> Pliki implementacyjne: `src/systems/capture/captureSystem.ts`, `src/ui/screens/salvage/SalvageScreen.ts`

## Warunek wejścia

Dotyczy każdego statku w grze:
- wrogiego,
- neutralnego,
- sojuszniczego.

Gracz może atakować dowolny statek.
Konsekwencje frakcyjne są liczone przez osobny system.

## Przebieg

```txt
1. HP statku -> 0
   -> rzut: 40% szansy, że statek NIE eksploduje
   -> jeśli TAK: status 'disabled'
   -> jeśli NIE: eksplozja, loot drop, koniec

2. Disabled ship
   -> widoczny jako dokowalny wrak
   -> gracz podjeżdża i wciska E
   -> otwiera się ekran salvage

3. Ekran salvage
   -> napraw reaktor
   -> napraw napęd
   -> przeszukaj ładownię
   -> demontaż modułów
   -> odlot

4. Gdy reaktor i napęd naprawione
   -> statek staje się 'operational'
   -> gracz wybiera:
      A) przesiadka na przejęty statek
      B) pozostanie na swoim statku

5. Po zadokowaniu na stacji z eskortantem
   -> transfer modułów między statkami
   -> sprzedaż statku
   -> rozbiórka na części
```

## Stan eskortanta

```ts
export type EscortState = 'follow' | 'idle' | 'docked';

export interface EscortShip {
  shipId: string;
  state: EscortState;
  followTargetId: string;
  maxFollowDistance: number;
}
```

Na tym etapie eskortant nie walczy.
Ma tylko utrzymywać bezpieczny follow za graczem.

## Poza zakresem

Ten moduł nie:
- liczy konsekwencji frakcyjnych,
- implementuje UI salvage wewnątrz systemu,
- oblicza ceny sprzedaży statku.