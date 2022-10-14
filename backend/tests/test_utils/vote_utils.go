package test_utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"time"

	"github.com/DapperCollectives/CAST/backend/main/models"
)

type PaginatedResponseWithVotes struct {
	Data         []models.VoteWithBalance `json:"data"`
	Start        int                      `json:"start"`
	Count        int                      `json:"count"`
	TotalRecords int                      `json:"totalRecords"`
	Next         int                      `json:"next"`
}

func (otu *OverflowTestUtils) GetVotesForProposalAPI(proposalId int) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/proposals/"+strconv.Itoa(proposalId)+"/votes?order=asc", nil)
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) GetVoteForProposalByAccountNameAPI(proposalId int, accountName string) *httptest.ResponseRecorder {
	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", accountName))
	addr := fmt.Sprintf("0x%s", account.Address().String())
	url := fmt.Sprintf("/proposals/%s/votes/%s", strconv.Itoa(proposalId), addr)
	req, _ := http.NewRequest("GET", url, nil)
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) GetVoteForProposalByAddressAPI(proposalId int, address string) *httptest.ResponseRecorder {
	url := fmt.Sprintf("/proposals/%s/votes/%s", strconv.Itoa(proposalId), address)
	req, _ := http.NewRequest("GET", url, nil)
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) GetVotesForAddressAPI(address string, proposalIds []int) *httptest.ResponseRecorder {
	var proposalIdsString []string

	//comma has to be manually inserted as a string to be a valid query param
	for i, id := range proposalIds {
		proposalIdsString = append(proposalIdsString, strconv.Itoa(id))
		if i != len(proposalIds)-1 {
			proposalIdsString = append(proposalIdsString, ",")
		}
	}

	url := fmt.Sprintf("/votes/%s?proposalIds=%s", address, proposalIdsString)
	req, _ := http.NewRequest("GET", url, nil)
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) CreateVoteAPI(proposalId int, payload *models.Vote) *httptest.ResponseRecorder {
	json, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "/proposals/"+strconv.Itoa(proposalId)+"/votes", bytes.NewBuffer(json))
	req.Header.Set("Content-Type", "application/json")
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) GenerateValidVotePayload(accountName string, proposalId int, choiceId int) *models.Vote {
	timestamp := time.Now().UnixNano() / int64(time.Millisecond)
	choiceIdStr := fmt.Sprintf("%d", choiceId)
	message := strconv.Itoa(proposalId) + ":" + choiceIdStr + ":" + fmt.Sprint(timestamp)
	compositeSignatures := otu.GenerateCompositeSignatures(accountName, message)
	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", accountName))
	address := fmt.Sprintf("0x%s", account.Address().String())

	c := make([]string, 1)
	c[0] = choiceIdStr

	vote := models.Vote{Proposal_id: proposalId, Addr: address, Choices: c,
		Composite_signatures: compositeSignatures, Message: message}

	return &vote
}
