BINARY_NAME=flow-voting-tool-server

build:
	GOARCH=amd64 GOOS=linux go build -o ${BINARY_NAME} ./main

build_macos:
	GOARCH=arm64 GOOS=darwin go build -o ${BINARY_NAME} ./main

run:
	./${BINARY_NAME}

test:
	go test -v -cover ./tests

	# creates proposals against local db for manual emulator testing
proposals:
	go test -v ./tests -run CreateManyProposals -amount=4 -db=local

build_and_run: build run

macrun: build_macos run && NFTdeploy

topshot: 
	make nft && \
	flow accounts add-contract TopShotLocking ./main/cadence/nba/TopShotLocking.cdc && \
	flow accounts add-contract TopShot ./main/cadence/nba/TopShot.cdc && \
	flow accounts add-contract Market ./main/cadence/nba/MarketTopshot.cdc && \
	flow transactions send ./main/cadence/nba/transactions/admin/create_play.cdc '{"teamAtMoment": "Toronto Raptors"}' && \
	flow transactions send ./main/cadence/nba/transactions/admin/create_set.cdc "local-host" && \
	flow transactions send ./main/cadence/nba/transactions/admin/add_play_to_set.cdc 1 1 && \
	flow transactions send ./main/cadence/nba/transactions/admin/mint_moment.cdc 1 1 0xf8d6e0586b0a20c7 


nft:
		flow accounts add-contract NonFungibleToken ./main/cadence/contracts/NonFungibleToken.cdc && \
		flow accounts add-contract MetadataViews ./main/cadence/contracts/MetadataViews.cdc && \
		flow accounts add-contract ExampleNFT ./main/cadence/contracts/ExampleNFT.cdc && \
		flow transactions send ./main/cadence/transactions/setup_flow_token_account.cdc && \
		flow transactions send ./main/cadence/transactions/setup_account_to_receive_royalty.cdc /storage/flowTokenVault && \
		flow transactions send ./main/cadence/transactions/mint_nft.cdc 0xf8d6e0586b0a20c7 "dev_nft" "don't try at home" "thumnbail goes here" '[0.8]' '["royalties"]' '[0xf8d6e0586b0a20c7]' 

float: 
	make nft && \
	flow accounts add-contract GrantedAccountAccess ./main/cadence/float/GrantedAccountAccess.cdc && \
	flow accounts add-contract FLOAT ./main/cadence/float/FLOAT.cdc && \
	flow accounts add-contract FLOATVerifiers ./main/cadence/float/FLOATVerifiers.cdc && \
	flow transactions send ./main/cadence/float/transactions/create_group.cdc "cast-group" "image" "local-dev-group" && \
	flow transactions send ./main/cadence/float/transactions/create_event.cdc 0xf8d6e0586b0a20c7 true "local-dev" "for emulator smoke testing" "image" "www.url.com" true false 10000.00 86400.00 false "secret" false 100 '["cast-group"]' false 0.0 false 0.0

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
