# Project: (laba_v3) Web Game Design

This repository is the course project for Web Game Design. It contains the web-based game frontend, design documentation, and tooling to build and package the game.

## Current status (concise)
- Prototype stage: frontend scaffolding and core engine structure exist; many game systems are documented in `docs/` and partially implemented in the `src/` folders under `transcendence-web`.
- Containerization is provided via Docker and docker-compose for quick environment setup. Several game systems (AI, combat, save system, reactors) are described in docs but remain work-in-progress.

## Requirements
- Docker & docker-compose (recommended for full-stack run)
- Node.js and npm (for local frontend development)
- Bash (for helper scripts such as `pack_game_zip.sh`)

## Quick start — Docker
Start the entire stack with:

```bash
docker-compose up --build
```

Stop and remove containers:

```bash
docker-compose down
```

## Local frontend development
Develop and run the frontend locally:

```bash
cd transcendence-web
npm install
npm run dev
```

Build production frontend:

```bash
npm run build
```

## Packaging
Create a distributable ZIP of game artifacts with:

```bash
./pack_game_zip.sh
```

## Important paths
- `transcendence-web/` — frontend (Vite + TypeScript) and game client sources
- `docs/` — design documents, system specs, and development notes
- `pack_game_zip.sh` — packaging helper script
- `docker-compose.yml` / `Dockerfile` — container configuration

## How to use this repo
- Read `docs/` for the current design and implementation notes.
- Use Docker for consistent environment setup during testing or demos.
- For feature work, develop inside `transcendence-web/src` and update docs when changes affect design or behavior.

## Next steps (suggested)
- Add a short CONTRIBUTING.md and a LICENSE if you plan to publish on GitHub.
- Add step-by-step non-Docker run instructions if you need a pure local workflow.
- Mark implemented vs planned features in docs for easier grading and handoff.

---
This README has been updated to English and to reflect the current project scope; it no longer references legacy folders outside this repository.
