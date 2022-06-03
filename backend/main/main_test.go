package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/bjartek/overflow/overflow"
	"github.com/brudfyi/flow-voting-tool/main/server"
	"github.com/brudfyi/flow-voting-tool/main/shared"
	utils "github.com/brudfyi/flow-voting-tool/main/test_utils"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog/log"
)

var A server.App
var O *overflow.Overflow
var otu *utils.OverflowTestUtils

const ServiceAddress = "0xf8d6e0586b0a20c7"

//
func TestMain(m *testing.M) {
	var err error

	emulator := overflow.NewOverflowEmulator()
	emulator.Config("../flow.json")
	emulator.BasePath("./main/cadence")
	O = emulator.Start()

	CWD := "../"
	os.Setenv("CWD", CWD)

	// Load .env file if ENV_NAME is not set (i.e. locally)
	if UseDotEnv := os.Getenv("ENV_NAME"); len(UseDotEnv) == 0 {
		err = godotenv.Load(CWD + ".env")
	}
	if err != nil {
		log.Fatal().Err(err).Msg("Error loading .env file")
	}

	os.Chdir(CWD)
	os.Unsetenv("FVT_FEATURES")

	A.Initialize(
		os.Getenv("DB_USERNAME"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("TEST_DB_NAME"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("IPFS_KEY"),
		os.Getenv("IPFS_SECRET"),
	)

	adapter := shared.NewFlowClient()

	// Setup overflow test utils struct
	otu = &utils.OverflowTestUtils{T: nil, A: &A, O: O, Adapter: adapter}

	ensureTableExists()
	// Clear DB tables before running tests
	clearTable("communities")
	clearTable("proposals")
	clearTable("community_users")
	clearTable("votes")
	clearTable("balances")
	clearTable("lists")
	code := m.Run()
	// Clear DB tables after running tests
	// clearTable("communities")
	// clearTable("proposals")
	// clearTable("votes")
	// clearTable("community_users")
	os.Exit(code)
}

//////////////////
// Test Helpers //
//////////////////

// Database stuff

// func addActiveProposals(cId int, count int) []int {
// 	if count < 1 {
// 		count = 1
// 	}
// 	retIds := []int{}
// 	choices := []string{"a", "b", "c"}
// 	for i := 0; i < count; i++ {
// 		lastId := 0
// 		err := A.DB.Conn.QueryRow(A.DB.Context, `
// 		INSERT INTO proposals(community_id, name, choices, creator_addr, start_time, end_time, strategy, status, body)
// 		VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
//     `, cId, "proposal "+strconv.Itoa(i), pq.Array(choices), utils.ServiceAccountAddress, time.Now().AddDate(0, -1, 0), time.Now().Add(time.Hour*24*30), "token-weighted-default", "published", "<html>something</html").Scan(&lastId)
// 		if err != nil {
// 			log.Error().Err(err).Msg("addActivePropsosals DB err")
// 		}
// 		retIds = append(retIds, lastId)
// 	}
// 	return retIds
// }

// func addVotes(pId int, count int) {
// 	if count < 1 {
// 		count = 1
// 	}
// 	var addr string
// 	for i := 0; i < count; i++ {
// 		if i == 0 {
// 			addr = "0x24d31c55bf2ceceb"
// 		} else {
// 			addr = "0x" + strings.Repeat(strconv.Itoa(i), 16)
// 		}

// 		compositeSignatures := utils.SignMessage(addr, utils.ValidServiceAccountKey, "message")
// 		_, err := A.DB.Conn.Exec(A.DB.Context, `
// 			INSERT INTO votes(proposal_id, addr, choice, composite_signatures, message)
// 			VALUES($1, $2, $3, $4, $5)
// 			`, pId, addr, "yes", compositeSignatures, "__msg__")
// 		if err != nil {
// 			log.Error().Err(err).Msg("addVotes DB err")
// 		}
// 	}
// }

// func addCommunityUsers(cId int, count int) {
// 	if count < 1 {
// 		count = 1
// 	}
// 	for i := 0; i < count; i++ {
// 		_, err := A.DB.Conn.Exec(A.DB.Context, `
//       INSERT INTO community_users(community_id, addr, user_type)
//       VALUES($1, $2, $3)
//     `, cId, utils.ServiceAccountAddress, utils.DefaultUserType)
// 		if err != nil {
// 			log.Error().Err(err).Msg("addCommunityUsers DB err")
// 		}
// 	}
// }

const tableCreationQuery = `
  CREATE TABLE IF NOT EXISTS communities (
    id BIGSERIAL primary key,
    name VARCHAR(256) not null,
    body TEXT,
    logo VARCHAR(256),
    cid VARCHAR(64),
    created_at TIMESTAMP default now()
  )
`

func ensureTableExists() {
	if _, err := A.DB.Conn.Exec(A.DB.Context, tableCreationQuery); err != nil {
		log.Fatal().Err(err)
	}
}

func clearTable(name string) {
	log.Debug().Msgf("Clearing DB table: %s", name)
	A.DB.Conn.Exec(A.DB.Context, "TRUNCATE "+name+" RESTART IDENTITY CASCADE")
}

// HTTP Stuff

func executeRequest(req *http.Request) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	A.Router.ServeHTTP(rr, req)

	return rr
}

func checkResponseCode(t *testing.T, expected, actual int) {
	if expected != actual {
		t.Errorf("Expected response code %d. Got %d\n", expected, actual)
	}
}

func CheckResponseCode(t *testing.T, expected, actual int) {
	if expected != actual {
		t.Errorf("Expected response code %d. Got %d\n", expected, actual)
	}
}
