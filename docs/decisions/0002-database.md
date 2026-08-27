# ADR 0002: Local SQLite, Production PostgreSQL

Status: transitional

The repository ships with SQLite so reviewers can run all member and operations workflows without Docker or cloud credentials. Before production launch, change the Prisma datasource to `postgresql`, generate a reviewed migration against an isolated staging database, load-test row locking for inventory reservation and configure Render PostgreSQL backups. Production must not share the local database file.
