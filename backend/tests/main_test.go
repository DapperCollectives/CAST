package main

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/DapperCollectives/CAST/backend/main/server"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	utils "github.com/DapperCollectives/CAST/backend/tests/test_utils"
	"github.com/bjartek/overflow/overflow"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog/log"
)

var A server.App
var O *overflow.OverflowState
var otu *utils.OverflowTestUtils

const ServiceAddress = "0xf8d6e0586b0a20c7"

type errorResponse struct {
	StatusCode int		`json:"statusCode,string"`
	ErrorCode  string	`json:"errorCode"`
	Message    string	`json:"message"`
	Details    string	`json:"details"`
}

var (
	errIncompleteRequest = errorResponse{
		StatusCode: http.StatusBadRequest,
		ErrorCode:  "ERR_1001",
		Message:    "Error",
		Details:    "There was an error trying to complete your request",
	}

	errCreateCommunity = errorResponse{
		StatusCode: http.StatusBadRequest,
		ErrorCode:  "ERR_1002",
		Message:    "Error",
		Details:    "There was an error trying to create your community",
	}

	errFetchingBalance = errorResponse{
		StatusCode: http.StatusBadRequest,
		ErrorCode:  "ERR_1003",
		Message:    "Error Fetching Balance",
		Details: `While confirming your balance, we've encountered an error
							connecting to the Flow Blockchain.`,
	}

	errInsufficientBalance = errorResponse{
		StatusCode: http.StatusUnauthorized,
		ErrorCode:  "ERR_1004",
		Message:    "Insufficient Balance",
		Details: `In order to vote on this proposal you must have a minimum 
							balance of %d %s tokens in your wallet.`,
	}

	errForbidden = errorResponse{
		StatusCode: http.StatusForbidden,
		ErrorCode:  "ERR_1005",
		Message:    "Forbidden",
		Details:    "You are not authorized to perform this action.",
	}

	errCreateProposal = errorResponse{
		StatusCode: http.StatusForbidden,
		ErrorCode:  "ERR_1006",
		Message:    "Error",
		Details:    "There was an error trying to create your proposal",
	}

	errUpdateCommunity = errorResponse{
		StatusCode: http.StatusForbidden,
		ErrorCode:  "ERR_1007",
		Message:    "Error",
		Details:    "There was an error trying to update your community",
	}

	errStrategyNotFound = errorResponse{
		StatusCode: http.StatusNotFound,
		ErrorCode:  "ERR_1008",
		Message:    "Strategy Not Found",
		Details:    "The strategy name you are trying to use no longer exists.",
	}

	errAlreadyVoted = errorResponse{
		StatusCode: http.StatusBadRequest,
		ErrorCode:  "ERR_1009",
		Message:    "Error",
		Details:    "Address %s has already voted for proposal %d.",
	}

	errInactiveProposal = errorResponse{
		StatusCode: http.StatusBadRequest,
		ErrorCode:  "ERR_1010",
		Message:    "Error",
		Details:    "Cannot vote on an inactive proposal.",
	}

	errGetCommunity = errorResponse{
		StatusCode: http.StatusInternalServerError,
		ErrorCode:  "ERR_1011",
		Message:    "Error",
		Details:    "There was an error retrieving the community.",
	}

	errCreateVote = errorResponse{
		StatusCode: http.StatusInternalServerError,
		ErrorCode:  "ERR_1012",
		Message:    "Error",
		Details:    "There was an error creating the vote.",
	}

	nilErr = errorResponse{}
)

func TestMain(m *testing.M) {
	var err error

	emulator := overflow.NewOverflowEmulator()
	emulator.Config("./flow.json")
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
	os.Setenv("FLOW_ENV", "emulator")

	A.Initialize()

	// Load custom scripts for strategies
	scripts, err := ioutil.ReadFile("../main/cadence/scripts/custom/scripts.json")
	if err != nil {
		log.Error().Err(err).Msg("Error Reading Custom Strategy scripts.")
	}

	var customScripts []shared.CustomScript
	err = json.Unmarshal(scripts, &customScripts)
	if err != nil {
		log.Error().Err(err).Msg("Error during Unmarshalling custom scripts")
	}

	var customScriptsMap = make(map[string]shared.CustomScript)
	for _, script := range customScripts {
		customScriptsMap[script.Key] = script
	}

	adapter := shared.NewFlowClient(os.Getenv("FLOW_ENV"), customScriptsMap)

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
