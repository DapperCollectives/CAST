package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/brudfyi/flow-voting-tool/main/models"
	"github.com/brudfyi/flow-voting-tool/main/shared"
	"github.com/stretchr/testify/assert"
)

/*****************/
/*   Proposals   */
/*****************/

func TestGetProposal(t *testing.T) {

	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	communityId := otu.AddCommunities(1)[0]

	t.Run("Requesting proposals for a community with none created should succeed and return an empty array", func(t *testing.T) {
		response := otu.GetProposalsForCommunityAPI(communityId)

		CheckResponseCode(t, http.StatusOK, response.Code)

		var proposalsResponse shared.PaginatedResponse
		json.Unmarshal(response.Body.Bytes(), &proposalsResponse)

		assert.Equal(t, 0, proposalsResponse.Count)
	})

	t.Run("Should throw an error if proposal with ID doesnt exist", func(t *testing.T) {

		response := otu.GetProposalByIdAPI(communityId, 420)

		CheckResponseCode(t, http.StatusNotFound, response.Code)

		var m map[string]string
		json.Unmarshal(response.Body.Bytes(), &m)
		assert.Equal(t, "Proposal not found", m["error"])
	})

	t.Run("Should fetch existing proposal by ID", func(t *testing.T) {
		proposalId := otu.AddProposals(communityId, 1)[0]
		response := otu.GetProposalByIdAPI(communityId, proposalId)
		CheckResponseCode(t, http.StatusOK, response.Code)
	})
}

func TestCreateProposalThreshold(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	communityId := otu.AddCommunitiesWithUsersAndThreshold(1, "user1")[0]

	t.Run("Should be able to create a valid proposal given a token threshold", func(t *testing.T) {
		proposalStruct := otu.GenerateProposalStruct("user1", communityId)
		payload := otu.GenerateProposalPayload("user1", proposalStruct)

		response := otu.CreateProposalAPI(payload)
		CheckResponseCode(t, http.StatusCreated, response.Code)

		var p models.Proposal
		json.Unmarshal(response.Body.Bytes(), &p)

		assert.NotNil(t, p.Cid)

		assert.Equal(t, proposalStruct.Name, p.Name)
		assert.Equal(t, *proposalStruct.Body, *p.Body)
		assert.Equal(t, proposalStruct.Choices, p.Choices)
		assert.Equal(t, proposalStruct.Community_id, p.Community_id)
		assert.Equal(t, *proposalStruct.Strategy, *p.Strategy)
	})
}

func TestCreateProposal(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	communityId := otu.AddCommunitiesWithUsers(1, "user1")[0]

	t.Run("Should be able to create a valid proposal", func(t *testing.T) {
		proposalStruct := otu.GenerateProposalStruct("user1", communityId)
		payload := otu.GenerateProposalPayload("user1", proposalStruct)

		response := otu.CreateProposalAPI(payload)
		CheckResponseCode(t, http.StatusCreated, response.Code)

		var p models.Proposal
		json.Unmarshal(response.Body.Bytes(), &p)

		assert.NotNil(t, p.Cid)

		assert.Equal(t, proposalStruct.Name, p.Name)
		assert.Equal(t, *proposalStruct.Body, *p.Body)
		assert.Equal(t, proposalStruct.Choices, p.Choices)
		assert.Equal(t, proposalStruct.Community_id, p.Community_id)
		assert.Equal(t, *proposalStruct.Strategy, *p.Strategy)
	})

	t.Run("Should throw an error if signature is invalid", func(t *testing.T) {
		proposalStruct := otu.GenerateProposalStruct("user1", communityId)
		payload := otu.GenerateProposalPayload("user1", proposalStruct)
		// Invalidate the signature by signing a new timestamp
		newTimestamp := fmt.Sprint(time.Now().UnixNano()/int64(time.Millisecond) + 1234)
		compositeSigs := otu.GenerateCompositeSignatures("user1", newTimestamp)
		payload.Composite_signatures = compositeSigs
		response := otu.CreateProposalAPI(payload)

		CheckResponseCode(t, http.StatusForbidden, response.Code)

		var m map[string]interface{}
		json.Unmarshal(response.Body.Bytes(), &m)

		assert.Equal(t, "invalid signature", m["error"])
	})

	t.Run("Should throw an error if timestamp is more than 60 seconds", func(t *testing.T) {
		proposalStruct := otu.GenerateProposalStruct("user1", communityId)
		payload := otu.GenerateProposalPayload("user1", proposalStruct)
		// Invalidate by signing an old timestamp
		newTimestamp := fmt.Sprint(time.Now().Add(-10*time.Minute).UnixNano() / int64(time.Millisecond))
		compositeSigs := otu.GenerateCompositeSignatures("user1", newTimestamp)
		payload.Timestamp = newTimestamp
		payload.Composite_signatures = compositeSigs

		response := otu.CreateProposalAPI(payload)

		CheckResponseCode(t, http.StatusForbidden, response.Code)

		var m map[string]interface{}
		json.Unmarshal(response.Body.Bytes(), &m)

		assert.Equal(t, "timestamp on request has expired", m["error"])
	})
}

func TestUpdateProposal(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	// Create a community
	authorName := "user1"
	communityId := otu.AddCommunitiesWithUsers(1, authorName)[0]

	t.Run("A community author should be able to cancel a pending proposal they have created", func(t *testing.T) {
		proposalStruct := otu.GenerateProposalStruct(authorName, communityId)
		payload := otu.GenerateProposalPayload(authorName, proposalStruct)
		response := otu.CreateProposalAPI(payload)

		CheckResponseCode(t, http.StatusCreated, response.Code)
		var p models.Proposal
		json.Unmarshal(response.Body.Bytes(), &p)

		// Get proposal after create
		response = otu.GetProposalByIdAPI(communityId, p.ID)
		var created models.Proposal
		json.Unmarshal(response.Body.Bytes(), &created)

		assert.Equal(t, "pending", *created.Computed_status)

		cancelPayload := otu.GenerateCancelProposalStruct(authorName, p.ID)
		response = otu.UpdateProposalAPI(p.ID, cancelPayload)
		checkResponseCode(t, http.StatusOK, response.Code)

		// Get proposal after update
		response = otu.GetProposalByIdAPI(communityId, p.ID)
		var cancelled models.Proposal
		json.Unmarshal(response.Body.Bytes(), &cancelled)
		assert.Equal(t, "cancelled", *cancelled.Computed_status)
	})

	t.Run("A community author should be able to cancel an active proposal", func(t *testing.T) {
		proposalStruct := otu.GenerateProposalStruct(authorName, communityId)
		// Make proposal active
		proposalStruct.Start_time = time.Now().AddDate(0, -1, 0)

		payload := otu.GenerateProposalPayload(authorName, proposalStruct)
		response := otu.CreateProposalAPI(payload)

		CheckResponseCode(t, http.StatusCreated, response.Code)
		var p models.Proposal
		json.Unmarshal(response.Body.Bytes(), &p)

		// Get proposal after create
		response = otu.GetProposalByIdAPI(communityId, p.ID)
		var created models.Proposal
		json.Unmarshal(response.Body.Bytes(), &created)

		assert.Equal(t, "active", *created.Computed_status)

		cancelPayload := otu.GenerateCancelProposalStruct(authorName, communityId)
		response = otu.UpdateProposalAPI(p.ID, cancelPayload)
		checkResponseCode(t, http.StatusOK, response.Code)

		// Get proposal after update
		response = otu.GetProposalByIdAPI(communityId, p.ID)
		var cancelled models.Proposal
		json.Unmarshal(response.Body.Bytes(), &cancelled)
		assert.Equal(t, "cancelled", *cancelled.Computed_status)
	})

}
