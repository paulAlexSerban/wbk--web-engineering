---
name: Expand harness for hello-nodejs-w-postgres
overview: Fill the two missing Dev & Test Harness pieces from simple-api-service-templates/readme.md (Performance testing with k6, and Observability with Prometheus/Grafana/Loki) for the hello-nodejs-w-postgres template, instrument the API with real metrics/logs, and fix the broken seed Makefile target.
todos:
  - id: fix-seed
    content: Fix broken 'seed' Makefile target to use existing SQL seed files
    status: completed
  - id: instrument-api
    content: Add prom-client metrics, /metrics and /health routes, structured JSON logging to app.ts
    status: completed
  - id: observability-configs
    content: Add Prometheus/Loki/Promtail/Grafana config files under observability/
    status: completed
  - id: compose-observability
    content: Add prometheus, loki, promtail, grafana services to docker-compose.yml + env vars
    status: completed
  - id: k6-scripts
    content: Add k6 smoke.js and load.js performance scripts under performance/k6
    status: completed
  - id: compose-k6
    content: Add profile-gated k6 service to docker-compose.yml + Makefile perf_smoke/perf_load targets
    status: completed
  - id: docs
    content: Update API readme and add harness usage docs for observability + perf testing
    status: completed
isProject: false
---

## Context

[readme.md](simple-api-service-templates/readme.md) defines a 5-piece Dev & Test Harness. In [hello-nodejs-w-postgres](simple-api-service-templates/hello-nodejs-w-postgres) today:

- Infra orchestration: exists ([docker-compose.yml](simple-api-service-templates/hello-nodejs-w-postgres/docker-compose.yml), [Makefile](simple-api-service-templates/hello-nodejs-w-postgres/Makefile))
- Data seed script: exists via Postgres `docker-entrypoint-initdb.d` ([database/seeds/init.sql](simple-api-service-templates/hello-nodejs-w-postgres/database/seeds/init.sql), [database/seeds/seed.sql](simple-api-service-templates/hello-nodejs-w-postgres/database/seeds/seed.sql)), but `Makefile`'s `seed` target calls a nonexistent `scripts/seed.js` — broken, will be fixed
- API test setup: exists ([notebooks/requests.ipynb](simple-api-service-templates/hello-nodejs-w-postgres/notebooks/requests.ipynb))
- Performance test setup: **missing** — add k6
- Observability (Prometheus, Grafana, Loki): **missing** — add full stack + API instrumentation

## 1. Fix the seed Makefile target

In [Makefile](simple-api-service-templates/hello-nodejs-w-postgres/Makefile), the `seed` target is dead code (no `scripts/` dir exists; seeding already happens automatically via `init.sql`/`seed.sql` mounted into Postgres's init directory). Replace it with a target that re-runs the SQL seed against the running container (idempotent thanks to `seeder_log`), e.g.:

```makefile
seed:
	docker exec -i ${COMPOSE_PROJECT_NAME}_postgres \
		psql -U ${DATABASE_USER} -d ${COMPOSE_PROJECT_NAME} \
		< database/seeds/seed.sql
```

## 2. Instrument the API with Prometheus metrics + structured logs

- Add `prom-client` dependency in [backend/apis/api-service/package.json](simple-api-service-templates/hello-nodejs-w-postgres/backend/apis/api-service/package.json).
- In [src/app.ts](simple-api-service-templates/hello-nodejs-w-postgres/backend/apis/api-service/src/app.ts):
  - Register default metrics collection and an HTTP request duration/count histogram middleware.
  - Add `GET /metrics` route exposing Prometheus text format.
  - Replace `morgan('dev')` (or run alongside) with structured JSON access logs to stdout so Promtail can scrape Docker container logs and parse them as structured lines in Loki (keep it simple: JSON per line with method, path, status, duration).
- Add `/health` route if not present (check first) for container/monitoring checks.

## 3. Add Prometheus + Grafana + Loki + Promtail to the harness

New `observability/` directory under `hello-nodejs-w-postgres/`:

- `observability/prometheus/prometheus.yml` — scrape config targeting `api-service:${NODE_PORT}` at `/metrics`.
- `observability/loki/loki-config.yml` — minimal single-binary Loki config.
- `observability/promtail/promtail-config.yml` — tails Docker container logs (via Docker logging driver or mounted `/var/lib/docker/containers`) and ships to Loki.
- `observability/grafana/provisioning/datasources/datasources.yml` — pre-provision Prometheus + Loki datasources.
- `observability/grafana/provisioning/dashboards/dashboards.yml` + one starter dashboard JSON (`api-overview.json`) showing request rate, latency, error rate, and a log panel.

Extend [docker-compose.yml](simple-api-service-templates/hello-nodejs-w-postgres/docker-compose.yml) with `prometheus`, `loki`, `promtail`, and `grafana` services, all on `base-api-service-network`, with named volumes for Prometheus/Loki/Grafana data and bind-mounts for the config files above. Add corresponding ports (e.g. Prometheus 9090, Grafana 3000, Loki 3100) and env vars (`GRAFANA_ADMIN_PASSWORD`, ports) to [.env.example](simple-api-service-templates/hello-nodejs-w-postgres/.env.example) / `.env`.

## 4. Add k6 performance testing

New `performance/` directory:

- `performance/k6/smoke.js` — light script hitting `/api/hello`, `/api/users`, `/api/customers`, `/api/orders`, `/api/orders/pending-totals` with a small VU/duration ramp, using thresholds (p95 latency, error rate).
- `performance/k6/load.js` — heavier staged load test (ramp up/steady/ramp down) against the same endpoints.
- Wire into `docker-compose.yml` as an optional `grafana/k6` service (profile-gated, e.g. `profiles: ["perf"]`) so it doesn't run on every `up`, invoked via `docker compose --profile perf run k6 run /scripts/load.js`.
- Add Makefile targets `perf_smoke` and `perf_load` wrapping those compose run commands.

## 5. Update documentation

- [hello-nodejs-w-postgres/backend/apis/api-service/readme.md](simple-api-service-templates/hello-nodejs-w-postgres/backend/apis/api-service/readme.md): document `/metrics` and `/health`.
- Add/extend a top-level readme section (or `hello-nodejs-w-postgres/readme.md` if one should be created) describing how to run the full harness: `make compose_up`, open Grafana at `localhost:3000`, run `make perf_smoke` / `make perf_load`, view dashboards.

## Verification

- `docker compose --env-file .env --file docker-compose.yml config` to validate compose syntax.
- Bring stack up, confirm `/metrics` scraped by Prometheus (`up{job="api-service"} == 1`), confirm Grafana dashboard renders, confirm Loki receives logs, run `make perf_smoke` against the live API and confirm thresholds pass.
