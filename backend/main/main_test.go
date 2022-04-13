package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/brudfyi/flow-voting-tool/main/shared"
	utils "github.com/brudfyi/flow-voting-tool/main/test_utils"
	"github.com/joho/godotenv"
	"github.com/lib/pq"
	"github.com/rs/zerolog/log"
)

var a App

func TestMain(m *testing.M) {

	CWD := "../"
	os.Setenv("CWD", CWD)
	// Load .env file
	err := godotenv.Load(CWD + ".env")
	if err != nil {
		log.Fatal().Err(err).Msg("Error loading .env file")
	}
	os.Chdir(CWD)

	a.Initialize(
		os.Getenv("DB_USERNAME"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("TEST_DB_NAME"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("IPFS_KEY"),
		os.Getenv("IPFS_SECRET"),
	)

	ensureTableExists()
	// Clear DB tables before running tests
	clearTable("communities")
	clearTable("proposals")
	clearTable("votes")
	code := m.Run()
	// Clear DB tables after running tests
	// clearTable("communities")
	// clearTable("proposals")
	clearTable("votes")
	os.Exit(code)
}

func TestTest(t *testing.T) {

}

///////////
// Tests //
///////////

/*********************/
/*     COMMUNITIES   */
/*********************/

func TestEmptyCommunityTable(t *testing.T) {
	clearTable("communities")

	req, _ := http.NewRequest("GET", "/communities", nil)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var body shared.PaginatedResponse
	json.Unmarshal(response.Body.Bytes(), &body)

	if body.Count != 0 {
		t.Errorf("Expected empty body. Got count of %d", body.Count)
	}
}

func TestGetNonExistentCommunity(t *testing.T) {
	clearTable("communities")

	req, _ := http.NewRequest("GET", "/communities/420", nil)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusNotFound, response.Code)

	var m map[string]string
	json.Unmarshal(response.Body.Bytes(), &m)
	if m["error"] != "Community not found" {
		t.Errorf("Expected the 'error' key of the response to be set to 'Community not found'. Got '%s'", m["error"])
	}
}

func TestCreateCommunity(t *testing.T) {
	clearTable("communities")

	communityPayload := utils.GenerateValidCommunityPayload(utils.ServiceAccountAddress)

	req, _ := http.NewRequest("POST", "/communities", bytes.NewBuffer(communityPayload))
	req.Header.Set("Content-Type", "application/json")

	response := executeRequest(req)
	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["cid"] == nil {
		t.Errorf("Expected proposal cid to exist. Got '%v'", m["cid"])
	}
	if m["name"] != utils.ValidCommunityStruct.Name {
		t.Errorf("Expected community name to be 'TestDAO'. Got '%v'", m["name"])
	}
	if m["body"] != *utils.ValidCommunityStruct.Body {
		t.Errorf("Expected community body to be '%s'. Got '%v'", *utils.ValidCommunityStruct.Body, m["body"])
	}
	if m["logo"] != *utils.ValidCommunityStruct.Logo {
		t.Errorf("Expected community logo to be '%s'. Got '%v'", *utils.ValidCommunityStruct.Logo, m["logo"])
	}
	// the id is compared to 1.0 because JSON unmarshaling converts numbers to
	// floats, when the target is a map[string]interface{}
	if m["id"] != 1.0 {
		t.Errorf("Expected community ID to be '1'. Got '%v'", m["id"])
	}
}

func TestCreateCommunityAllowlist(t *testing.T) {
	clearTable("communities")

	communityPayload := utils.GenerateValidCommunityPayload("0x01")

	req, _ := http.NewRequest("POST", "/communities", bytes.NewBuffer(communityPayload))
	req.Header.Set("Content-Type", "application/json")

	response := executeRequest(req)
	checkResponseCode(t, http.StatusForbidden, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["error"] != "user does not have permission" {
		t.Errorf("Expected err to be 'user does not have permission'. Got '%v'", m["error"])
	}
}

func TestGetCommunity(t *testing.T) {
	clearTable("communities")
	addCommunities(1)

	req, _ := http.NewRequest("GET", "/communities/1", nil)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)
}

func TestUpdateCommunity(t *testing.T) {
	clearTable("communities")
	addCommunities(1)

	req, _ := http.NewRequest("GET", "/communities/1", nil)
	response := executeRequest(req)
	var ogCommunity map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &ogCommunity)

	var jsonStr = []byte(`{
    "name":"TestDAO - updated", "body": "test - updated",
    "logo":"toad.jpeg"
    }`)
	req, _ = http.NewRequest("PUT", "/communities/1", bytes.NewBuffer(jsonStr))
	req.Header.Set("Content-Type", "application/json")

	response = executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["id"] != ogCommunity["id"] {
		t.Errorf("Expected the id to remain the same (%v). Got %v", ogCommunity["id"], m["id"])
	}
	if m["name"] == ogCommunity["name"] {
		t.Errorf("Expected the name to change from '%v' to '%v'. Got '%v'", ogCommunity["name"], m["name"], m["name"])
	}
	if m["body"] == ogCommunity["body"] {
		t.Errorf("Expected the body to change from '%v' to '%v'. Got '%v'", ogCommunity["body"], m["body"], m["body"])
	}
	if m["logo"] == ogCommunity["logo"] {
		t.Errorf("Expected logo to change from '%v' to '%v'. Got %v", ogCommunity["logo"], m["logo"], m["logo"])
	}
}

/*****************/
/*   Proposals   */
/*****************/

func TestEmptyProposals(t *testing.T) {
	clearTable("communities")
	clearTable("proposals")
	communityId := addCommunities(1)[0]

	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(communityId)+"/proposals", nil)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var proposalsResponse shared.PaginatedResponse
	json.Unmarshal(response.Body.Bytes(), &proposalsResponse)
	if proposalsResponse.Count != 0 {
		t.Errorf("Expected count to be 0. Got %d", proposalsResponse.Count)
	}
}

func TestGetNonExistentProposal(t *testing.T) {
	clearTable("proposals")
	clearTable("communities")
	communityId := addCommunities(1)[0]

	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(communityId)+"/proposals/420", nil)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusNotFound, response.Code)

	var m map[string]string
	json.Unmarshal(response.Body.Bytes(), &m)
	if m["error"] != "Proposal not found" {
		t.Errorf("Expected the 'error' key of the response to be set to 'Proposal not found'. Got '%s'", m["error"])
	}
}

func TestCreateProposal(t *testing.T) {
	clearTable("communities")
	clearTable("proposals")
	communityId := addCommunities(1)[0]

	proposalPayload := utils.GenerateValidProposalPayload(communityId)

	req, _ := http.NewRequest("POST", "/communities/"+strconv.Itoa(communityId)+"/proposals", bytes.NewBuffer(proposalPayload))
	req.Header.Set("Content-Type", "application/json")

	response := executeRequest(req)
	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["error"] != nil {
		t.Errorf("Error msg: %v\n", m["error"])
	}

	if m["cid"] == nil {
		t.Errorf("Expected proposal cid to exist. Got '%v'", m["cid"])
	}

	if m["name"] != utils.DefaultProposalStruct.Name {
		t.Errorf("Expected proposal name to be '%s'. Got '%v'", utils.DefaultProposalStruct.Name, m["name"])
	}
	if m["body"] != *utils.DefaultProposalStruct.Body {
		t.Errorf("Expected proposal body to be '%s'. Got '%v'", *utils.DefaultProposalStruct.Body, m["body"])
	}

	choiceLength := len(m["choices"].([]interface{}))
	if choiceLength != 3 {
		t.Errorf("Expected proposal choices to be of len == 3. Got len == %v", choiceLength)
	}

	// the id is compared to 1.0 because JSON unmarshaling converts numbers to
	// floats, when the target is a map[string]interface{}
	if m["communityId"] != 1.0 {
		t.Errorf("Expected communityId to be '1'. Got '%v'", m["communityId"])
	}
}

func TestCreateProposalInvalidSignature(t *testing.T) {
	clearTable("communities")
	clearTable("proposals")
	communityId := addCommunities(1)[0]

	invalidProposalPayload := utils.GenerateInvalidSignatureProposalPayload(communityId)

	req, _ := http.NewRequest("POST", "/communities/"+strconv.Itoa(communityId)+"/proposals", bytes.NewBuffer(invalidProposalPayload))
	req.Header.Set("Content-Type", "application/json")

	response := executeRequest(req)
	checkResponseCode(t, http.StatusForbidden, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["error"] != "invalid signature" {
		t.Errorf("Error msg: %v.  Expected 'invalid signature'\n", m["error"])
	}
}
func TestCreateProposalExpiredTimestamp(t *testing.T) {
	clearTable("communities")
	clearTable("proposals")
	communityId := addCommunities(1)[0]

	invalidProposalPayload := utils.GenerateExpiredTimestampProposalPayload(communityId)

	req, _ := http.NewRequest("POST", "/communities/"+strconv.Itoa(communityId)+"/proposals", bytes.NewBuffer(invalidProposalPayload))
	req.Header.Set("Content-Type", "application/json")

	response := executeRequest(req)
	checkResponseCode(t, http.StatusForbidden, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["error"] != "timestamp on request has expired" {
		t.Errorf("Got error msg: %v. Expected 'timestamp on request has expired'\n", m["error"])
	}
}

func TestGetProposal(t *testing.T) {
	clearTable("communities")
	clearTable("proposals")
	communityId := addCommunities(1)[0]
	addProposals(communityId, 1)

	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(communityId)+"/proposals/1", nil)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)
}

func TestUpdateProposal(t *testing.T) {
	clearTable("communities")
	clearTable("proposals")
	communityId := addCommunities(1)[0]
	addProposals(communityId, 1)

	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(communityId)+"/proposals/1", nil)
	response := executeRequest(req)
	var ogProposal map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &ogProposal)

	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
	compositeSignature := utils.SignMessage(utils.ServiceAccountAddress, utils.ValidServiceAccountKey, timestamp)

	compositeSignatureJSON, _ := json.Marshal(compositeSignature)
	var payload = fmt.Sprintf(`{"status":"cancelled", "timestamp":"%s","compositeSignatures":%s}`, timestamp, compositeSignatureJSON)
	var jsonStr = []byte(payload)

	req, _ = http.NewRequest("PUT", "/communities/1/proposals/1", bytes.NewBuffer(jsonStr))
	req.Header.Set("Content-Type", "application/json")

	response = executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["id"] != ogProposal["id"] {
		t.Errorf("Expected the id to remain the same (%v). Got %v", ogProposal["id"], m["id"])
	}
	if m["status"] != "cancelled" {
		t.Errorf("Expected status to be updated to '%v'. Got '%v'", "cancelled", m["status"])
	}
}

// func TestUpdateActiveProposal(t *testing.T) {
// 	clearTable("communities")
// 	clearTable("proposals")
// 	communityId := addCommunities(1)[0]
// 	addActiveProposals(communityId, 1)

// 	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(communityId)+"/proposals/1", nil)
// 	response := executeRequest(req)
// 	var ogProposal map[string]interface{}
// 	json.Unmarshal(response.Body.Bytes(), &ogProposal)

// 	var jsonStr = []byte(`{
//     "name":"proposal - updated", "description": "test - updated",
//     "optionA":"yes", "optionB":"no"
//     }`)

// 	req, _ = http.NewRequest("PUT", "/communities/1/proposals/1", bytes.NewBuffer(jsonStr))
// 	req.Header.Set("Content-Type", "application/json")

// 	response = executeRequest(req)

// 	checkResponseCode(t, http.StatusInternalServerError, response.Code)
// }

/**************/
/*   Votes    */
/**************/

func TestEmptyVotesTable(t *testing.T) {
	clearTable("communities")
	clearTable("proposals")
	clearTable("votes")
	communityId := addCommunities(1)[0]
	proposalId := addProposals(communityId, 1)[0]

	req, _ := http.NewRequest("GET", "/proposals/"+strconv.Itoa(proposalId)+"/votes", nil)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var body shared.PaginatedResponse
	json.Unmarshal(response.Body.Bytes(), &body)

	if body.Count != 0 {
		t.Errorf("Expected votes to be empty. Got %s", strconv.Itoa(body.Count))
	}
}

func TestGetNonExistentVote(t *testing.T) {
	clearTable("communities")
	clearTable("proposals")
	clearTable("votes")
	communityId := addCommunities(1)[0]
	proposalId := addProposals(communityId, 1)[0]

	req, _ := http.NewRequest("GET", "/proposals/"+strconv.Itoa(proposalId)+"/votes/0x0000000000000000", nil)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusNotFound, response.Code)

	var m map[string]string
	json.Unmarshal(response.Body.Bytes(), &m)
	if m["error"] != "Vote not found" {
		t.Errorf("Expected the 'error' key of the response to be set to 'Vote not found'. Got '%s'", m["error"])
	}
}

func TestCreateVote(t *testing.T) {
	clearTable("communities")
	clearTable("proposals")
	clearTable("votes")
	communityId := addCommunities(1)[0]
	proposalId := addActiveProposals(communityId, 1)[0]
	voteChoice := "a"

	votePayload := utils.GenerateValidVotePayload(proposalId, voteChoice)
	req, err := http.NewRequest("POST", "/proposals/"+strconv.Itoa(proposalId)+"/votes", bytes.NewBuffer(votePayload))
	req.Header.Set("Content-Type", "application/json")

	response := executeRequest(req)
	if err != nil {
		log.Error().Msgf("Err casting vote: %v\n", err)
	}
	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	json.Unmarshal(response.Body.Bytes(), &m)

	if m["cid"] == nil {
		t.Errorf("Expected proposal cid to exist. Got '%v'", m["cid"])
	}

	if m["addr"] != utils.ServiceAccountAddress {
		t.Errorf("Expected addr to be '%s'. Got '%v'", utils.ServiceAccountAddress, m["addr"])
	}
	if m["choice"] != utils.DefaultProposalStruct.Choices[0] {
		t.Errorf("Expected choice to be '%s'. Got '%v'", utils.DefaultProposalStruct.Choices[0], m["choice"])
	}
	if m["proposalId"] != 1.0 {
		t.Errorf("Expected proposalId to be '1'. Got '%v'", m["proposalId"])
	}
	// the id is compared to 1.0 because JSON unmarshaling converts numbers to
	// floats, when the target is a map[string]interface{}
	if m["id"] != 1.0 {
		t.Errorf("Expected vote ID to be '1'. Got '%v'", m["id"])
	}
}

func TestGetVotesForProposal(t *testing.T) {
	clearTable("communities")
	clearTable("proposals")
	clearTable("votes")
	communityId := addCommunities(1)[0]
	proposalId := addProposals(communityId, 1)[0]
	addVotes(1, 1)

	req, _ := http.NewRequest("GET", "/proposals/"+strconv.Itoa(proposalId)+"/votes", nil)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)
}

// func TestUpdateVote(t *testing.T) {
// 	clearTable("communities")
// 	clearTable("proposals")
// 	clearTable("votes")
// 	communityId := addCommunities(1)[0]
// 	proposalId := addProposals(communityId, 1)[0]
// 	addVotes(1, 1)

// 	req, _ := http.NewRequest("GET", "/proposals/"+strconv.Itoa(proposalId)+"/votes/0x24d31c55bf2ceceb", nil)
// 	response := executeRequest(req)
// 	var ogVote map[string]interface{}
// 	json.Unmarshal(response.Body.Bytes(), &ogVote)

// 	// TODO: require user to sign a message containing the history of their
// 	// votes (some sort of unique string).  Otherwise, a middleman could  intercept the
// 	// signature of the original vote and change the vote back themselves by
// 	// pretending to be the voter

// 	// TODO: ensure that the address of an already recorded vote cannot be changed

// 	var jsonStr = []byte(`{
//     "choice": "no", "sig": "__sig__"
//     }`)
// 	req, _ = http.NewRequest("PUT", "/proposals/1/votes/0x24d31c55bf2ceceb", bytes.NewBuffer(jsonStr))
// 	req.Header.Set("Content-Type", "application/json")

// 	response = executeRequest(req)

// 	checkResponseCode(t, http.StatusOK, response.Code)

// 	var m map[string]interface{}
// 	json.Unmarshal(response.Body.Bytes(), &m)

// 	if m["id"] != ogVote["id"] {
// 		t.Errorf("Expected the id to remain the same (%v). Got %v", ogVote["id"], m["id"])
// 	}
// 	if m["choice"] == ogVote["choice"] {
// 		t.Errorf("Expected the name to change from '%v' to '%v'. Got '%v'", ogVote["choice"], m["choice"], m["choice"])
// 	}
// 	if m["addr"] != ogVote["addr"] {
// 		t.Errorf("Expected the voter address to remain the same (%v). Got '%v'", ogVote["addr"], m["addr"])
// 	}
// }

//////////////////
// Test Helpers //
//////////////////

// Database stuff

func addCommunities(count int) []int {
	if count < 1 {
		count = 1
	}
	retIds := []int{}
	for i := 0; i < count; i++ {
		lastId := 0
		err := a.DB.Conn.QueryRow(a.DB.Context, "INSERT INTO communities(name, slug, body, creator_addr) VALUES($1, $2, $3, $4) RETURNING id", "Community "+strconv.Itoa(i), "slug-it", "<html>someghing</html>", "0xf8d6e0586b0a20c7").Scan(&lastId)
		if err != nil {
			log.Error().Err(err).Msg("addCommunities DB err")
		}
		retIds = append(retIds, lastId)
	}
	return retIds
}

func addProposals(cId int, count int) []int {
	if count < 1 {
		count = 1
	}
	retIds := []int{}
	choices := []string{"a", "b", "c"}
	for i := 0; i < count; i++ {
		lastId := 0
		err := a.DB.Conn.QueryRow(a.DB.Context, `
      INSERT INTO proposals(community_id, name, choices, creator_addr, start_time, end_time, strategy, min_balance, max_weight, status, body, cid)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id
    `, cId, "proposal "+strconv.Itoa(i), pq.Array(choices), utils.ServiceAccountAddress, time.Now().Add(time.Hour*24), time.Now().Add(time.Hour*24*30), "token-weighted-capped", 0, 5, "published", "<html>whahhha</html>", "Qx13...").Scan(&lastId)
		if err != nil {
			log.Error().Err(err).Msg("addProposals DB err")
		}
		retIds = append(retIds, lastId)
	}
	return retIds
}

func addActiveProposals(cId int, count int) []int {
	if count < 1 {
		count = 1
	}
	retIds := []int{}
	choices := []string{"a", "b", "c"}
	for i := 0; i < count; i++ {
		lastId := 0
		err := a.DB.Conn.QueryRow(a.DB.Context, `
		INSERT INTO proposals(community_id, name, choices, creator_addr, start_time, end_time, strategy, status, body)
		VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
    `, cId, "proposal "+strconv.Itoa(i), pq.Array(choices), "0x0000000000000000", time.Now().AddDate(0, -1, 0), time.Now().Add(time.Hour*24*30), "token-weighted-default", "published", "<html>something</html").Scan(&lastId)
		if err != nil {
			log.Error().Err(err).Msg("addActivePropsosals DB err")
		}
		retIds = append(retIds, lastId)
	}
	return retIds
}

func addVotes(pId int, count int) {
	if count < 1 {
		count = 1
	}
	var addr string
	for i := 0; i < count; i++ {
		if i == 0 {
			addr = "0x24d31c55bf2ceceb"
		} else {
			addr = "0x" + strings.Repeat(strconv.Itoa(i), 16)
		}

		compositeSignatures := utils.SignMessage(addr, utils.ValidServiceAccountKey, "message")
		_, err := a.DB.Conn.Exec(a.DB.Context, `
			INSERT INTO votes(proposal_id, addr, choice, composite_signatures, message)
			VALUES($1, $2, $3, $4, $5)
			`, pId, addr, "yes", compositeSignatures, "__msg__")
		if err != nil {
			log.Error().Err(err).Msg("addVotes DB err")
		}
	}
}

func ensureTableExists() {
	if _, err := a.DB.Conn.Exec(a.DB.Context, tableCreationQuery); err != nil {
		log.Fatal().Err(err)
	}
}

func clearTable(name string) {
	log.Debug().Msgf("Clearing DB table: %s", name)
	a.DB.Conn.Exec(a.DB.Context, "TRUNCATE "+name+" RESTART IDENTITY CASCADE")
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

// HTTP Stuff

func executeRequest(req *http.Request) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	a.Router.ServeHTTP(rr, req)

	return rr
}

func checkResponseCode(t *testing.T, expected, actual int) {
	if expected != actual {
		t.Errorf("Expected response code %d. Got %d\n", expected, actual)
	}
}
