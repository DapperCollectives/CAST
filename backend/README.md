# CAST Backend

## Prerequisites

- [GoLang 1.6](https://golang.org/doc/install)
- [PostgreSQL 14.1](https://www.postgresql.org/download/)
- [Flow CLI](https://docs.onflow.org/flow-cli/install/)
  - Note: See below for how install v0.30.2 (required)

## Local Development

### Environment Variables

Copy `.env.example` to a new file `.env`.

```bash
cp .env.example .env
```

The correct values for `IPFS_KEY` and `IPFS_SECRET` can be found in the Dapper Collectives 1password, or you you can use your own by creating an account with [Pinata](https://www.pinata.cloud/).

### Database

#### Install PSQL
- [PostgreSQL 14.1](https://www.postgresql.org/download/)
- via homebrew `brew install postgresql`

#### Configure Postgres DB User/PW

By default the postgres user has no password. Give it a password
so we can connect with our application
```bash
sudo -i -u postgres
psql
CREATE USER postgres; # if postgres user doesnt exist
ALTER USER postgres PASSWORD 'admin';
```

#### Create flow_snapshot Database, and Test Database

```bash
sudo -i -u postgres
psql
CREATE DATABASE flow_snapshot;
CREATE DATABASE flow_snapshot_test;
```

#### Install Migrate Tool

To run the `make` migrate scripts, you need to have the `migrate` CLI installed in your local path. Follow the [steps here](https://github.com/golang-migrate/migrate/tree/master/cmd/migrate) to install `migrate` on your machine.


#### Creating Migration Files

In `flow-voting-tool`:
```bash
migrate create -ext sql -dir migrations -seq my_migration_file
```

This will create two files, one for migrating up and one for migrating down. Please fill in both properly to make rolling back migrations easy, if necessary.

#### Migrating Up & Down

Migrate Up:
```bash
make migrateup
```

Migrate Down:
```bash
make migratedown
```

#### Migrating Up & Down for Test Database

The first time you run the tests, you'll need to migrate the test database.

Migrate Up:
```bash
make testmigrateup
```

Migrate Down:
```bash
make testmigratedown
```

#### Dealing with Dirty Schema Migrations


### Testing

1. Run `flow emulator` from this top-level directory (the private key for the `emulator-account` in `flow.json` must match the private key hard-coded in the test suite). Install the `flow` CLI [here](https://docs.onflow.org/flow-cli/install/)
2. Run migrations against the test database (if migrations aren't up to date): `make testmigrateup`
3. Run the test suite: `make test`

#### Building & Running Docker Test Image

Build (To build locally, uncomment the `COPY .env .env` line in Dockerfile.test)
```bash
docker build . --file=Dockerfile.test -t vt-test
```

Run (To run locally, must have flow emulator running, and local PostgresDB):
```bash
docker run -it --network=host --rm --name vt-test vt-test:latest
```

### Run the app

Before running the app you should:

1. Run `flow emulator` from this top-level directory (the private key for the `emulator-account` in `flow.json` must match the private key hard-coded in the test suite). Install the `flow` CLI [here](https://docs.onflow.org/flow-cli/install/)
2. Run migrations against the database (if migrations aren't up to date): `make migrateup`

#### Go Executable
To build the binary & run it:
```bash
LINUX: make build_and_run
MACOS: make macrun
```

Alternatively:
```bash
go run ./main
```

The server runs on port 5001.  Confirm that it is running by hitting `https://localhost:5001/api` in your browser.

#### Running via Docker

This is a good way to debug env related issues.

1. If you are connecting to a local PostgresDB, update `DB_HOST` in your `.env` file to `host.docker.internal`
2. Set `ENV_NAME="DOCKER"`

Finally,
```bash
make image # create the Docker image
make container # spin up a container from Docker image
```

## Troubleshooting

### Install Flow v0.30.2

Currently you need to run Flow v0.30.2 for local development. Follow the commands below to install the specific version of Flow needed.

```sh
> curl --progress-bar "https://storage.googleapis.com/flow-cli/flow-x86_64-darwin-v0.30.2" --output flow && mv flow /usr/local/bin

> chmod +x /usr/local/bin/flow
```