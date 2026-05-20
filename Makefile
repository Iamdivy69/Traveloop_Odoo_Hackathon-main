.PHONY: up down logs db-shell seed migrate reset-db dev smoke-test

up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f backend

db-shell:
	docker exec -it traveloop-db psql -U postgres -d traveloop

seed:
	docker exec traveloop-backend npm run seed

migrate:
	docker exec traveloop-backend npx prisma migrate deploy

reset-db:
	docker compose down -v && make up

dev:
	@echo "Starting backend and frontend locally..."
	start cmd /c "cd apps/backend && npm run dev"
	start cmd /c "cd apps/frontend && npm run dev"

smoke-test:
	@echo "Running smoke tests against http://localhost:3000/api/v1..."
	bash scripts/smoke-test.sh

