# Domeny gameplayowe

## Zakres
Ten dokument opisuje warstwę logiki świata i mechanik.
Nie opisuje UI, renderu ani katalogów zasobów.

Aktualny status: dokument definiuje architekturę docelową (Etapy 3+), nie stan zaimplementowany po Etapie 2.

## Domeny
- `world/`
- `systems/`
- `entities/`
- `items/`
- `missions/`
- `factions/`

## world
- `universe/` — połączenia między systemami i postęp gracza.
- `systems-map/` — aktywny system, obiekty lokalne i stan systemu.
- `sectors/` — podział na sektory.
- `generation/` — generacja systemów i rozkład obiektów.
- `spawn/` — reguły pojawiania się bytów i contentu.

## systems
- `reactor/`
- `ship-mass/`
- `flight/`
- `weapons/`
- `shields/`
- `capture/`
- `factions/`
- `missions/`
- `economy/`

## entities
- `base/`
- `ships/`
- `stations/`
- `gates/`
- `wrecks/`
- `projectiles/`
- `environment/`

## items
- `base/`
- `weapons/`
- `armor/`
- `shields/`
- `reactors/`
- `drives/`
- `misc/`
- `cargo/`
- `fuel/`

## missions
- `base/`
- `contracts/`
- `rewards/`
- `progression/`

## factions
- `base/`
- `relations/`
- `catalog/`

## Reguły
- `systems/` zawiera logikę działania.
- `entities/`, `items/`, `missions/`, `factions/` zawierają głównie modele i definicje domenowe.
- UI komunikuje się z tymi domenami przez kontrakty, a nie przez bezpośrednie mieszanie kodu DOM z logiką świata.