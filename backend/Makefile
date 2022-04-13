BINARY_NAME=flow-voting-tool-server

build:
	GOARCH=amd64 GOOS=linux go build -o ${BINARY_NAME} ./main

build_macos:
	GOARCH=amd64 GOOS=darwin go build -o ${BINARY_NAME} ./main

run:
	./${BINARY_NAME}

test:
	go test -v ./...

build_and_run: build run

macrun: build_macos run

macdev:
	APP_ENV=DEV make macrun

dev:
	APP_ENV=DEV make build_and_run

migrateup:
	migrate -path ./migrations -database "postgres://postgres:admin@localhost:5432/flow_snapshot?sslmode=disable" -verbose up

migratedown:
	migrate -path ./migrations -database "postgres://postgres:admin@localhost:5432/flow_snapshot?sslmode=disable" -verbose down

testmigrateup:
	migrate -path ./migrations -database "postgres://postgres:admin@localhost:5432/flow_snapshot_test?sslmode=disable" -verbose up

testmigratedown:
	migrate -path ./migrations -database "postgres://postgres:admin@localhost:5432/flow_snapshot_test?sslmode=disable" -verbose down

# Docker stuff
# NOTE: to run docker locally, you need to change DB_HOST
# to host.docker.internal
image:
	docker build . -t flow-voting-tool -f Dockerfile.local

container:
	docker run -it -p 5001:5001 --rm --name flow-voting-tool-server flow-voting-tool:latest

clean:
	go clean
	rm ${BINARY_NAME}	
