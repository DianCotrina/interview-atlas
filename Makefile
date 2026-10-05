DATABASE_URL ?= postgres://atlas:atlas-local@127.0.0.1:54329/atlas?sslmode=disable
TEST_DATABASE_URL ?= $(DATABASE_URL)
export DATABASE_URL TEST_DATABASE_URL
DOTNET ?= dotnet

.PHONY: db migrate api web test-web test-api test-integration test-samples build check
db:
	docker compose up -d --wait postgres
migrate:
	go -C api run ./cmd/migrate
api:
	go -C api run ./cmd/server
web:
	npm run dev -- --hostname 127.0.0.1
test-web:
	npm test
	npm run typecheck
	npm run lint
test-api:
	go -C api test ./...
test-integration:
	go -C api test -race -tags=integration ./...
test-samples:
	$(DOTNET) test samples/InterviewAtlas.Samples.Tests --nologo
build:
	npm run build
	go -C api build ./cmd/server ./cmd/migrate
check: test-web test-api test-integration test-samples build
