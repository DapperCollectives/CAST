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
	"github.com/DapperCollectives/CAST/backend/main/shared"
)

//////////////
// PROPOSALS
//////////////

var (
	proposalBody                = "<html>something</html>"
	published                   = "published"
	draft                       = "draft"
	tokenWeightedDefault        = "token-weighted-default"
	blockHeight          uint64 = 1

	DefaultProposalStruct = models.Proposal{
		Name: "Test Proposal",
		Body: &proposalBody,
		Choices: []shared.Choice{
			{Choice_text: "a"},
			{Choice_text: "b"},
		},
		Creator_addr: ServiceAccountAddress,
		Strategy:     &tokenWeightedDefault,
		Status:       &published,
		Block_height: &blockHeight,
	}

	DraftProposalStruct = models.Proposal{
		Name:   "Draft Proposal",
		Body:   &proposalBody,
		Status: &draft,
	}
)

func (otu *OverflowTestUtils) GetProposalsForCommunityAPI(communityId int) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(communityId)+"/proposals", nil)
	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) GetProposalsForCommunityQueryParamsAPI(communityId int, qp string) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(communityId)+"/proposals?"+qp, nil)
	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) GetProposalByIdAPI(communityId int, proposalId int) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(communityId)+"/proposals/"+strconv.Itoa(proposalId), nil)
	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) CreateProposalAPI(proposal *models.Proposal) *httptest.ResponseRecorder {
	json, _ := json.Marshal(proposal)
	req, _ := http.NewRequest(
		"POST",
		"/communities/"+strconv.Itoa(proposal.Community_id)+"/proposals",
		bytes.NewBuffer(json),
	)
	req.Header.Set("Content-Type", "application/json")
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) DeleteProposalAPI(communityId int, proposalId int) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("DELETE", "/communities/"+strconv.Itoa(communityId)+"/proposals/"+strconv.Itoa(proposalId), nil)
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) UpdateProposalAPI(
	proposalId int,
	payload *models.UpdateProposalRequestPayload,
) *httptest.ResponseRecorder {
	json, _ := json.Marshal(payload)
	req, _ := http.NewRequest("PUT", "/proposals/"+strconv.Itoa(proposalId), bytes.NewBuffer(json))
	req.Header.Set("Content-Type", "application/json")
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) GetProposalResultsAPI(proposalId int) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/proposals/"+strconv.Itoa(proposalId)+"/results", nil)
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) GenerateProposalStruct(signer string, communityId int) *models.Proposal {
	// deep copy
	proposal := DefaultProposalStruct
	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", signer))
	address := fmt.Sprintf("0x%s", account.Address().String())
	proposal.Creator_addr = address
	proposal.Community_id = communityId
	proposal.Start_time = time.Now().AddDate(0, 1, 0)
	proposal.End_time = time.Now().Add(30 * 24 * time.Hour)
	return &proposal
}

func (otu *OverflowTestUtils) GenerateDraftProposalStruct(
	signer string,
	communityId int,
) *models.Proposal {
	proposal := DraftProposalStruct
	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", signer))
	address := fmt.Sprintf("0x%s", account.Address().String())
	proposal.Creator_addr = address
	proposal.Community_id = communityId
	proposal.Start_time = time.Now().AddDate(0, 1, 0)
	proposal.End_time = time.Now().Add(30 * 24 * time.Hour)
	return &proposal
}

func (otu *OverflowTestUtils) GenerateCancelProposalStruct(
	signer string,
) *models.UpdateProposalRequestPayload {
	cancelled := "cancelled"
	payload := models.UpdateProposalRequestPayload{Proposal: &models.Proposal{Status: &cancelled}}
	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
	compositeSignatures := otu.GenerateCompositeSignatures(signer, timestamp)
	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", signer))
	payload.Signing_addr = fmt.Sprintf("0x%s", account.Address().String())
	payload.Timestamp = timestamp
	payload.Composite_signatures = compositeSignatures

	return &payload
}

func (otu *OverflowTestUtils) GenerateUpdatedDraftProposalPayload(
	signer string,
	strategy string,
) *models.UpdateProposalRequestPayload {
	draft := "draft"
	payload := models.UpdateProposalRequestPayload{
		Proposal: &models.Proposal{
			Status:   &draft,
			Strategy: &strategy,
		},
	}
	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
	compositeSignatures := otu.GenerateCompositeSignatures(signer, timestamp)
	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", signer))
	payload.Signing_addr = fmt.Sprintf("0x%s", account.Address().String())
	payload.Timestamp = timestamp
	payload.Composite_signatures = compositeSignatures

	return &payload
}

func (otu *OverflowTestUtils) GenerateClosedProposalStruct(
	signer string,
) *models.UpdateProposalRequestPayload {
	closed := "closed"
	payload := models.UpdateProposalRequestPayload{Proposal: &models.Proposal{Status: &closed}}
	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
	compositeSignatures := otu.GenerateCompositeSignatures(signer, timestamp)
	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", signer))
	payload.Signing_addr = fmt.Sprintf("0x%s", account.Address().String())
	payload.Timestamp = timestamp
	payload.Composite_signatures = compositeSignatures

	return &payload
}

func (otu *OverflowTestUtils) GenerateProposalPayload(signer string, proposal *models.Proposal) *models.Proposal {
	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
	compositeSignatures := otu.GenerateCompositeSignatures(signer, timestamp)

	proposal.Timestamp = timestamp
	proposal.Composite_signatures = compositeSignatures

	return proposal
}

func (otu *OverflowTestUtils) CreatePendingProposal(authorName string, communityId int) *models.Proposal {
	proposalStruct := otu.GenerateProposalStruct(authorName, communityId)
	payload := otu.GenerateProposalPayload(authorName, proposalStruct)
	response := otu.CreateProposalAPI(payload)

	var p models.Proposal
	json.Unmarshal(response.Body.Bytes(), &p)

	// Get proposal
	response = otu.GetProposalByIdAPI(communityId, p.ID)
	json.Unmarshal(response.Body.Bytes(), &p)

	return &p
}

func (otu *OverflowTestUtils) CreateActiveProposal(authorName string, communityId int) *models.Proposal {
	proposalStruct := otu.GenerateProposalStruct(authorName, communityId)
	payload := otu.GenerateProposalPayload(authorName, proposalStruct)
	response := otu.CreateProposalAPI(payload)

	var p models.Proposal
	json.Unmarshal(response.Body.Bytes(), &p)

	// Update startime so proposal will be active
	otu.UpdateProposalStartTime(p.ID, time.Now().UTC())

	// Get proposal
	response = otu.GetProposalByIdAPI(communityId, p.ID)
	json.Unmarshal(response.Body.Bytes(), &p)

	// assert.Equal(otu.T, "active", *p.Computed_status)
	return &p
}

func (otu *OverflowTestUtils) CreateCancelledProposal(authorName string, communityId int) *models.Proposal {
	proposalStruct := otu.GenerateProposalStruct(authorName, communityId)
	payload := otu.GenerateProposalPayload(authorName, proposalStruct)
	response := otu.CreateProposalAPI(payload)

	var p models.Proposal
	json.Unmarshal(response.Body.Bytes(), &p)

	// Cancel the proposal
	cancelPayload := otu.GenerateCancelProposalStruct(authorName)
	otu.UpdateProposalAPI(p.ID, cancelPayload)

	// Get proposal
	response = otu.GetProposalByIdAPI(communityId, p.ID)
	json.Unmarshal(response.Body.Bytes(), &p)

	// assert.Equal(otu.T, "cancelled", *p.Computed_status)
	return &p
}

func (otu *OverflowTestUtils) CreateClosedProposal(authorName string, communityId int) *models.Proposal {
	proposalStruct := otu.GenerateProposalStruct(authorName, communityId)
	payload := otu.GenerateProposalPayload(authorName, proposalStruct)
	response := otu.CreateProposalAPI(payload)

	var p models.Proposal
	json.Unmarshal(response.Body.Bytes(), &p)

	// Close the proposal
	otu.UpdateProposalStartTime(p.ID, time.Now().UTC())
	otu.UpdateProposalEndTime(p.ID, time.Now().UTC())

	// Get proposal
	response = otu.GetProposalByIdAPI(communityId, p.ID)
	json.Unmarshal(response.Body.Bytes(), &p)

	// assert.Equal(otu.T, "closed", *p.Computed_status)
	return &p
}

// func GenerateInvalidSignatureProposalPayload(communityId int) []byte {
// 	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
// 	compositeSignatures := SignMessage(ServiceAccountAddress, InvalidServiceAccountKey, timestamp)

// 	proposal := models.Proposal{
// 		Name:                 "Test Proposal",
// 		Body:                 &proposalBody,
// 		Choices:              []string{"one", "two", "three"},
// 		Creator_addr:         ServiceAccountAddress,
// 		Strategy:             &strategy,
// 		Start_time:           time.Now(),
// 		End_time:             time.Now().Add(30 * 24 * time.Hour),
// 		Timestamp:            timestamp,
// 		Composite_signatures: compositeSignatures,
// 		Community_id:         communityId,
// 	}

// 	jsonStr, _ := json.Marshal(proposal)
// 	return []byte(jsonStr)
// }

// func GenerateExpiredTimestampProposalPayload(communityId int) []byte {
// 	timestamp := fmt.Sprint(time.Now().Add(-10*time.Minute).UnixNano() / int64(time.Millisecond))
// 	compositeSignatures := SignMessage(ServiceAccountAddress, ValidServiceAccountKey, timestamp)

// 	proposal := models.Proposal{
// 		Name:                 "Test Proposal",
// 		Body:                 &proposalBody,
// 		Choices:              []string{"one", "two", "three"},
// 		Creator_addr:         ValidServiceAccountKey,
// 		Strategy:             &strategy,
// 		Start_time:           time.Now(),
// 		End_time:             time.Now().Add(30 * 24 * time.Hour),
// 		Timestamp:            timestamp,
// 		Composite_signatures: compositeSignatures,
// 		Community_id:         communityId,
// 	}

// 	jsonStr, _ := json.Marshal(proposal)
// 	return []byte(jsonStr)
// }

// func GenerateCancelProposalPayload(communityId int) []byte {
// 	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
// 	compositeSignatures := SignMessage(ServiceAccountAddress, ValidServiceAccountKey, timestamp)

// 	updateProposalPayload := models.UpdateProposalRequestPayload{
// 		Status: "cancelled",
// 	}

// 	updateProposalPayload.Composite_signatures = compositeSignatures
// 	updateProposalPayload.Signing_addr = ServiceAccountAddress
// 	updateProposalPayload.Timestamp = timestamp

// 	jsonStr, _ := json.Marshal(updateProposalPayload)
// 	return []byte(jsonStr)
// }
