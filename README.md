# quelora-demo-api

**Live demo for the [Quelora](https://github.com/Quelora) platform.**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](./LICENSE)

A small Express application that serves a "content hub" demo site and embeds
the Quelora widget — a working showcase of the platform in action.

## What it does

- Serves a news / content hub page that loads the Quelora widget
- Exposes a read-only `/api/posts` endpoint backed by MongoDB
- Write operations are disabled (demo mode)

## Setup

```bash
npm install
cp .env.example .env      # set MONGO_URI, CID, PORT
npm start
```

## Architecture

The page embeds [`quelora-widget-community`](https://github.com/Quelora/quelora-widget-community),
which talks to [`quelora-public-api`](https://github.com/Quelora/quelora-public-api).

## License

[AGPL-3.0-only](./LICENSE) — Copyright (C) 2026 Germán Zelaya.

Part of the **[Quelora](https://github.com/Quelora)** project.
