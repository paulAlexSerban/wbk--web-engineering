# Node.js with Postgres - JavaScript

Minimal Express API + PostgreSQL wrapped in the shared Dev & Test harness from [simple-api-service-templates/readme.md](../readme.md).

## Stack

- API: Node.js, Express, JavaScript
- Database: PostgreSQL 18
- Harness: Docker Compose (split by domain), Makefile, SQL seeder, Jupyter HTTP notebook, k6
- Observability: OpenTelemetry Collector + ClickHouse + Grafana. The API emits structured logs via Pino (`pino-opentelemetry-transport`) over OTLP gRPC to the collector, which stores them in ClickHouse (`otel_logs`). Grafana is provisioned with a ClickHouse datasource and the **API Service - Logs** dashboard.

Compose files:

| File                               | Domain                                              |
| ---------------------------------- | --------------------------------------------------- |
| `docker-compose.yml`               | Template runtime: API, Postgres, pgAdmin            |
| `docker-compose.performance.yml`   | k6 load tests                                       |
| `docker-compose.notebook.yml`      | JupyterLab for HTTP / contract checks               |
| `docker-compose.observability.yml` | ClickHouse, OTel Collector, Grafana                 |

## Quick start

Copy env values if needed, then bring the runtime up from this directory:

```bash
cp .env.example .env
make compose_up
```

Optional harness layers:

```bash
make notebook_up
make observability_up
```

`make observability_up` starts ClickHouse, the collector, and Grafana. The API already exports OTLP logs to `otel-collector:4317`; they land in Grafana once the stack is up. Config lives in [`observability/`](observability/). Stop the stack with `make observability_down` (it is not included in `make compose_down`).

| Piece            | URL / command                                                                |
| ---------------- | ---------------------------------------------------------------------------- |
| API              | http://localhost:3002                                                        |
| Health           | http://localhost:3002/health                                                 |
| pgAdmin          | http://localhost:5050 (`PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD`) |
| JupyterLab       | http://localhost:8888 (token: `JUPYTER_TOKEN`)                               |
| Jupyter notebook | [notebooks/requests.ipynb](notebooks/requests.ipynb)                         |
| Grafana          | http://localhost:3001 (`GRAFANA_ADMIN_USER` / `GRAFANA_ADMIN_PASSWORD`)      |
| ClickHouse HTTP  | http://localhost:8123                                                        |
| OTel Collector   | gRPC `:4317`, HTTP `:4318`                                                   |

Stop everything with `make compose_down` (and `make observability_down` if you started it). `make compose_down_clean` backs up the database then removes volumes.

## Harness workflow

1. **Orchestrate** - `make compose_up` starts the API, Postgres, and pgAdmin. Add `make notebook_up` and `make observability_up` as needed.
2. **Seed** - `database/seeds/init.sql` and `database/seeds/seed.sql` run on first Postgres start. Re-run sample data (idempotent via `seeder_log`) with `make seed`.
3. **API tests** - `make notebook_up`, then open JupyterLab and run the numbered notebooks in [`notebooks/`](notebooks/README.md) (product catalog, signup, checkout, bulk products, error/cleanup). Inside the container, `API_BASE_URL` points at `api-service`.
4. **Performance tests** - k6 lives in its own compose file and does not start with the stack. Scripts in [`performance/`](performance/README.md) replay the same five flows with unique faker-style payloads:
   - `make perf_smoke` - 1 VU per flow, 1–2 iterations, tight p95 / error-rate / check thresholds
   - `make perf_load` - staged ramp; checkout and signup weighted heavier than products/bulk/errors
5. **Observe** - with `make observability_up`, request logs from the API (and from notebooks / k6) show up in Grafana's **API Service - Logs** dashboard (volume by severity, errors, failing routes, log explorer).

## Make targets

| Target                                    | What it does                                                         |
| ----------------------------------------- | -------------------------------------------------------------------- |
| `compose_up`                              | Build and start API + Postgres + pgAdmin                             |
| `compose_down`                            | Stop runtime, notebook, and k6 compose files                         |
| `compose_down_clean`                      | Backup DB, then `down -v`                                            |
| `observability_up` / `observability_down` | Start / stop ClickHouse, OTel Collector, and Grafana                 |
| `notebook_up` / `notebook_down`           | Build and start / stop JupyterLab                                    |
| `seed`                                    | Apply `database/seeds/seed.sql` to the running database              |
| `backup_db` / `restore_db`                | Dump / restore `database/backup/main.sql`                            |
| `list` / `logs`                           | `docker compose ps` / follow logs across all files                   |
| `perf_smoke` / `perf_load`                | Run k6 product/signup/checkout/bulk/error flows against the live API |
