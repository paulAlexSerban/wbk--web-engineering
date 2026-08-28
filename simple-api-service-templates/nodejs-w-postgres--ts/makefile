include .env

export PROJECT_NAME
export COMPOSE_PROJECT_NAME
export DATABASE_HOST
export DATABASE_USER
export DATABASE_PASSWORD
export DATABASE_NAME
export DATABASE_PORT

COMPOSE_FILE := infrastructure/local/docker-compose.yml
LOCAL_BASE_IMAGE := ${PROJECT_NAME}-local-base:latest
export DOCKER_BUILDKIT := 1
export COMPOSE_DOCKER_CLI_BUILD := 1

COMPOSE := docker compose --env-file .env --file $(COMPOSE_FILE)

COMPOSE_ALL := $(COMPOSE) \
	--file infrastructure/local/docker-compose.performance.yml \
	--file infrastructure/local/docker-compose.notebook.yml

COMPOSE_OBS := $(COMPOSE) \
	--file infrastructure/local/docker-compose.observability.yml

local_base_build:
	$(COMPOSE) --profile build-only build local-base

compose_up: local_base_build
	$(COMPOSE_ALL) up -d --build api-service database pgadmin

compose_down:
	$(COMPOSE_ALL) down

compose_down_clean: backup_db
	$(COMPOSE_ALL) down -v

observability_up:
	$(COMPOSE_OBS) up -d clickhouse otel-collector grafana

observability_down:
	$(COMPOSE_OBS) stop clickhouse otel-collector grafana

notebook_up:
	$(COMPOSE_ALL) up -d --build jupyter

notebook_down:
	$(COMPOSE_ALL) stop jupyter

seed:
	docker exec -i ${COMPOSE_PROJECT_NAME}_postgres \
		psql -U ${DATABASE_USER} -d ${DATABASE_NAME} \
		< database/seeds/seed.sql

save_db_snapshot:
	if [ -f database/backup/main.sql ]; then \
		mv database/backup/main.sql database/backup/main.$$(date +%Y%m%d%H%M%S).sql; \
	else \
		echo 'NO database to snapshot'; \
	fi

backup_db: save_db_snapshot
	docker exec ${COMPOSE_PROJECT_NAME}_postgres \
		pg_dump -U ${DATABASE_USER} -d ${COMPOSE_PROJECT_NAME} \
		> database/backup/main.sql

restore_db:
	@if [ -f database/backup/main.sql ]; then \
		echo 'RESTORING database'; \
		docker exec -i ${COMPOSE_PROJECT_NAME}_postgres \
			psql -U ${DATABASE_USER} -d ${COMPOSE_PROJECT_NAME} \
			< database/backup/main.sql; \
		echo 'RESTORED database'; \
	else \
		echo 'NO database to restore'; \
	fi

list:
	$(COMPOSE_ALL) ps

logs:
	$(COMPOSE_ALL) logs --follow

perf_smoke:
	$(COMPOSE_ALL) run --rm k6 run /scripts/smoke.js

perf_load:
	$(COMPOSE_ALL) run --rm k6 run /scripts/load.js
