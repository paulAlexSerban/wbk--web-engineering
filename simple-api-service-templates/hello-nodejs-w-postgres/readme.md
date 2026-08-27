# Hello Node.js with Postgres

Minimal Express API + PostgreSQL wrapped in the shared Dev & Test harness from [simple-api-service-templates/readme.md](../readme.md).

## Stack

- API: Node.js, Express, TypeScript
- Database: PostgreSQL 18
- Harness: Docker Compose (split by domain), Makefile, SQL seeder, Jupyter HTTP notebook, k6, Prometheus / Grafana / Loki

Compose files:

| File                               | Domain                                   |
| ---------------------------------- | ---------------------------------------- |
| `docker-compose.yml`               | Template runtime: API, Postgres, pgAdmin |
| `docker-compose.observability.yml` | Prometheus, Loki, Promtail, Grafana      |
| `docker-compose.performance.yml`   | k6 load tests                            |
| `docker-compose.notebook.yml`      | JupyterLab for HTTP / contract checks    |

## Quick start

Copy env values if needed, then bring the runtime up from this directory:

```bash
cp .env.example .env
make compose_up
```

Optional harness layers:

```bash
make observability_up
make notebook_up
```

| Piece            | URL / command                                            |
| ---------------- | -------------------------------------------------------- |
| API              | http://localhost:3002                                    |
| Health           | http://localhost:3002/health                             |
| Metrics          | http://localhost:3002/metrics                            |
| pgAdmin          | http://localhost:5050 (`PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD`) |
| Prometheus       | http://localhost:9090                                    |
| Grafana          | http://localhost:3001 (admin / `GRAFANA_ADMIN_PASSWORD`) |
| JupyterLab       | http://localhost:8888 (token: `JUPYTER_TOKEN`)           |
| Jupyter notebook | [notebooks/requests.ipynb](notebooks/requests.ipynb)     |

Stop everything with `make compose_down`. `make compose_down_clean` backs up the database then removes volumes.

## Harness workflow

1. **Orchestrate** — `make compose_up` starts the API, Postgres, and pgAdmin. Add `make observability_up` and/or `make notebook_up` as needed.
2. **Seed** — `database/seeds/init.sql` and `database/seeds/seed.sql` run on first Postgres start. Re-run sample data (idempotent via `seeder_log`) with `make seed`.
3. **API tests** — `make notebook_up`, then open JupyterLab and run `requests.ipynb` against `/api/hello`, `/api/users`, `/api/customers`, `/api/orders`, and `/api/order-items`. Inside the container, `API_BASE_URL` points at `api-service`.
4. **Performance tests** — k6 lives in its own compose file and does not start with the stack:
   - `make perf_smoke` — short 2-VU check with p95 / error-rate thresholds
   - `make perf_load` — staged ramp-up / steady / ramp-down load
5. **Observe** — Grafana dashboard **API overview** shows request rate, p95 latency, 5xx rate, and Loki logs for `api-service`.

## Make targets

| Target                                    | What it does                                                  |
| ----------------------------------------- | ------------------------------------------------------------- |
| `compose_up`                              | Build and start API + Postgres + pgAdmin                      |
| `compose_down`                            | Stop all compose files (runtime, observability, notebook, k6) |
| `compose_down_clean`                      | Backup DB, then `down -v` for all files                       |
| `observability_up` / `observability_down` | Start / stop Prometheus, Loki, Promtail, Grafana              |
| `notebook_up` / `notebook_down`           | Build and start / stop JupyterLab                             |
| `seed`                                    | Apply `database/seeds/seed.sql` to the running database       |
| `backup_db` / `restore_db`                | Dump / restore `database/backup/main.sql`                     |
| `list` / `logs`                           | `docker compose ps` / follow logs across all files            |
| `perf_smoke` / `perf_load`                | Run k6 against the live API                                   |
