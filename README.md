## Safrochain Indexer

A production-grade indexing stack for Safrochain. It ingests on-chain data with Callisto, stores it in PostgreSQL, and serves it through our customized NestJS REST API. Callisto is used strictly to sync blockchain data into PostgreSQL; the API queries PostgreSQL directly.

### What’s inside

- **Go indexer (`callisto_project/`)**: Parses blocks, transactions, messages, and module data; persists into PostgreSQL.
- **Database schemas (`callisto_project/database/schema/`)**: SQL schemas for core Cosmos/Safrochain modules.
- **REST API (`safrochain_api_indexeur/`)**: Customized NestJS service for curated endpoints and business logic over PostgreSQL.

### Quick start

Set up PostgreSQL, run the Callisto indexer to sync chain data into the database, then start the API.

### Development setup

#### Prerequisites

- Go 1.21+
- Node.js 18+
- PostgreSQL 12+

#### Configure chain + database

- Chain config and genesis: `callisto/config.yaml`, `callisto/genesis.json`
- Database connection is configured by the indexer and API environment variables (see below).

#### Run the Go indexer

From `callisto_project/`:

```bash
go mod download
go build ./cmd/callisto

# one-time project initialization (creates config in the data dir)
./callisto init

# start indexing (uses config produced by init)
./callisto start
```

Migrations and utilities are available under `callisto_project/cmd/migrate` and within `callisto_project/database/`.

#### Run the API (NestJS)

From `safrochain_api_indexeur/`:

```bash
npm install
npm run start:dev
```

API base URL: `http://localhost:3000/api/v1` — Swagger docs at `http://localhost:3000/docs`.

### Configuration

Environment variables are read by both the indexer and the API. Typical settings include:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=safrochain_indexdb
DB_USER=safrochain_indexuser
DB_PASSWORD=change-me

# API
APP_PORT=3000
API_PREFIX=api/v1

# Swagger
SWAGGER_TITLE=SafroChain API
SWAGGER_DESCRIPTION=Professional blockchain indexer API for SafroChain
SWAGGER_VERSION=1.0.0
SWAGGER_PATH=docs
```

See `safrochain_api_indexeur/env.example` for a complete example.

Indexer configuration is initialized via `./callisto init` (see `callisto/config.yaml` and `callisto/genesis.json` for chain defaults).

### Project structure

```
.
├── callisto/                         # Chain config and genesis
├── callisto_project/                 # Callisto-based indexer and DB layer
└── safrochain_api_indexeur/          # NestJS REST API (customized)
```

### Common tasks

```bash
# Build and run indexer (from callisto_project/)
go build ./cmd/callisto && ./callisto start

# Start API (from safrochain_api_indexeur/)
npm run start:dev
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests where possible
4. Open a pull request with a clear description and rationale

### Security

If you discover a security issue, please report it responsibly via a private channel. Avoid filing public issues with sensitive details.

### License

This project is licensed under the Apache License, Version 2.0. See `LICENSE` for details.

### Credits

Built using Callisto components. Thanks to the Callisto team.
