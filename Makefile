.DEFAULT_GOAL := help

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "%-14s %s\n", $$1, $$2}'
setup: ## Create env, build, start, migrate and seed
	@test -f .env || cp .env.example .env
	$(MAKE) up
	$(MAKE) db-migrate
	$(MAKE) db-seed
up: ## Start database, backend and frontend
	docker compose up -d --build
down: ## Stop containers, preserving database data
	docker compose down
restart: ## Restart all services
	$(MAKE) down && $(MAKE) up
build: ## Build application containers
	docker compose build
logs: ## Follow service logs
	docker compose logs -f
ps: ## List service status
	docker compose ps
db-migrate: ## Apply Prisma migrations
	docker compose exec backend npx prisma migrate deploy
db-seed: ## Seed development data idempotently
	docker compose exec backend npx prisma db seed
db-reset: ## Destroy and recreate development database data
	@echo "Destroying local PostgreSQL volume..."
	docker compose down -v
	$(MAKE) up
clean: ## Remove containers and generated build artifacts (keeps database data)
	docker compose down --remove-orphans
	rm -rf dist server/dist
test: ## Type-check frontend and backend
	npm run build
	cd server && npm run test
