include .env

export COMPOSE_PROJECT_NAME
export DATABASE_HOST
export DATABASE_USER
export DATABASE_PASSWORD
export DATABASE_PORT

compose_up:
	docker compose --env-file .env --file docker-compose.yml up -d --build

compose_down:
	docker compose --env-file .env --file docker-compose.yml down

compose_down_clean: backup_db
	docker compose down -v

seed:
	node scripts/seed.js

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
	docker compose --env-file .env --file docker-compose.yml ps

logs:
	docker compose --env-file .env --file docker-compose.yml logs --follow