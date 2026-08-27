# Parked OpenTelemetry + ClickHouse implementation

Reference copy of the working observability stack. The live API no longer depends on this. Reimplement from scratch in the main tree for practice.

## Layout

| Path | What it is |
| ---- | ---------- |
| `backend/apis/api-service/telemetry/otel.ts` | OTLP metrics + logs SDK |
| `backend/apis/api-service/middleware/observability.ts` | HTTP duration histogram + request logs |
| `backend/apis/api-service/middleware/errorHandler.ts` | Error logs via OTel logger |
| `backend/apis/api-service/app.ts` | How middleware was wired |
| `backend/apis/api-service/bin/www.otel-import.ts` | Load SDK before `app` |
| `observability/otel-collector/` | Collector config (OTLP → ClickHouse) |
| `observability/grafana/` | ClickHouse datasource + API overview dashboard |
| `infrastructure/local/docker-compose.observability.yml` | ClickHouse, collector, Grafana |

## Bring the parked stack up (optional)

From the project root:

```bash
docker compose --env-file .env \
  --file infrastructure/local/docker-compose.yml \
  --file _BKP/infrastructure/local/docker-compose.observability.yml \
  up -d clickhouse otel-collector grafana
```

Or `make observability_up`, which points at this compose file.
