package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	utils "github.com/DapperCollectives/CAST/backend/tests/test_utils"
	"github.com/stretchr/testify/assert"
)

/*****************/
/*   Proposals   */
/*****************/

func TestGetProposal(t *testing.T) {

	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	communityId := otu.AddCommunities(1, "dao")[0]

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

		expectedErr := errProposalNotFound

		var e errorResponse
		json.Unmarshal(response.Body.Bytes(), &e)
		assert.Equal(t, expectedErr, e)
	})

	t.Run("Should fetch existing proposal by ID", func(t *testing.T) {
		proposalId := otu.AddProposals(communityId, 1)[0]
		response := otu.GetProposalByIdAPI(communityId, proposalId)
		CheckResponseCode(t, http.StatusOK, response.Code)
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

		expectedErr := errForbidden
		expectedErr.StatusCode = http.StatusForbidden

		var e errorResponse
		json.Unmarshal(response.Body.Bytes(), &e)
		assert.Equal(t, expectedErr, e)
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

		expectedErr := errForbidden
		expectedErr.StatusCode = http.StatusForbidden

		var e errorResponse
		json.Unmarshal(response.Body.Bytes(), &e)
		assert.Equal(t, expectedErr, e)
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

	t.Run("A community author should be able to cancel an active proposal created by another author", func(t *testing.T) {
		proposalStruct := otu.GenerateProposalStruct(authorName, communityId)
		// Make proposal active
		proposalStruct.Start_time = time.Now().AddDate(0, -1, 0)

		payload := otu.GenerateProposalPayload(authorName, proposalStruct)
		response := otu.CreateProposalAPI(payload)

		CheckResponseCode(t, http.StatusCreated, response.Code)
		var p models.Proposal
		json.Unmarshal(response.Body.Bytes(), &p)

		//Generate second author
		userStruct := otu.GenerateCommunityUserStruct("user2", "author")
		userPayload := otu.GenerateCommunityUserPayload("user1", userStruct)

		response = otu.CreateCommunityUserAPI(communityId, userPayload)
		checkResponseCode(t, http.StatusCreated, response.Code)

		// Get proposal after create
		response = otu.GetProposalByIdAPI(communityId, p.ID)
		var created models.Proposal
		json.Unmarshal(response.Body.Bytes(), &created)

		assert.Equal(t, "active", *created.Computed_status)

		cancelPayload := otu.GenerateCancelProposalStruct("user2", communityId)
		response = otu.UpdateProposalAPI(p.ID, cancelPayload)
		checkResponseCode(t, http.StatusOK, response.Code)

		// Get proposal after update
		response = otu.GetProposalByIdAPI(communityId, p.ID)
		var cancelled models.Proposal
		json.Unmarshal(response.Body.Bytes(), &cancelled)
		assert.Equal(t, "cancelled", *cancelled.Computed_status)
	})
}

func TestCreateManyProposals(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")

	// Create a community
	authorName := "account"
	communityId := otu.AddCommunitiesWithUsers(1, authorName)[0]

	t.Run("A community author should be able to create many proposals", func(t *testing.T) {
		numProposals := 4

		for i := 0; i < numProposals; i++ {
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
		}
	})
}

func TestGetProposalsByStatus(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")

	// Create a community
	authorName := "account"
	communityId := otu.AddCommunitiesWithUsers(1, authorName)[0]

	var pendingProposal models.Proposal
	var activeProposal models.Proposal
	var cancelledProposal models.Proposal
	var closedProposal models.Proposal

	var idToStatus = map[int]string{}

	t.Run("Fetching a proposal by ID should return the corrected computed status", func(t *testing.T) {
		pendingProposal = *otu.CreatePendingProposal(authorName, communityId)
		assert.Equal(t, "pending", *pendingProposal.Computed_status)

		activeProposal = *otu.CreateActiveProposal(authorName, communityId)
		assert.Equal(t, "active", *activeProposal.Computed_status)

		cancelledProposal = *otu.CreateCancelledProposal(authorName, communityId)
		assert.Equal(t, "cancelled", *cancelledProposal.Computed_status)

		closedProposal = *otu.CreateClosedProposal(authorName, communityId)
		assert.Equal(t, "closed", *closedProposal.Computed_status)

		// Assign IDs
		idToStatus[pendingProposal.ID] = *pendingProposal.Computed_status
		idToStatus[activeProposal.ID] = *activeProposal.Computed_status
		idToStatus[cancelledProposal.ID] = *cancelledProposal.Computed_status
		idToStatus[closedProposal.ID] = *closedProposal.Computed_status

	})

	t.Run("Get proposals endpoint should accept single status filters correctly", func(t *testing.T) {
		statuses := []string{"pending", "active", "cancelled", "closed"}

		for _, status := range statuses {
			response := otu.GetProposalsForCommunityQueryParamsAPI(communityId, "order=asc&status="+status)

			var proposalsResponse utils.PaginatedResponseWithProposal
			json.Unmarshal(response.Body.Bytes(), &proposalsResponse)

			expectedStatus := idToStatus[proposalsResponse.Data[0].ID]

			assert.Equal(t, 1, proposalsResponse.Count)
			assert.Equal(t, expectedStatus, *proposalsResponse.Data[0].Computed_status)
		}
	})

	t.Run("Get proposals endpoint should accept combination of statuses filter correctly", func(t *testing.T) {
		combinations := [][]string{
			{"pending", "active"},
			{"cancelled", "closed"},
			{"pending", "active", "cancelled", "closed"},
		}

		for _, statuses := range combinations {
			response := otu.GetProposalsForCommunityQueryParamsAPI(communityId, "order=asc&status="+strings.Join(statuses, ","))

			var proposalsResponse utils.PaginatedResponseWithProposal
			json.Unmarshal(response.Body.Bytes(), &proposalsResponse)

			// Assert correct number of proposals are returned.
			// We know we created one proposal for each status.
			assert.Equal(t, len(statuses), proposalsResponse.Count)

			// Check each proposal ID has correct status
			for _, proposal := range proposalsResponse.Data {
				expectedStatus := idToStatus[proposal.ID]
				assert.Equal(t, expectedStatus, *proposal.Computed_status)
			}
		}
	})
}

func TestDraftProposal(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")

	authorName := "account"
	communityId := otu.AddCommunitiesWithUsers(1, authorName)[0]

	t.Run("A community author should be able to create a draft proposal", func(t *testing.T) {
		proposalStruct := otu.GenerateDraftProposalStruct(authorName, communityId)
		payload := otu.GenerateProposalPayload(authorName, proposalStruct)
		response := otu.CreateProposalAPI(payload)

		CheckResponseCode(t, http.StatusCreated, response.Code)
		var p models.Proposal
		json.Unmarshal(response.Body.Bytes(), &p)

		// Get proposal after create
		response = otu.GetProposalByIdAPI(1, p.ID)
		CheckResponseCode(t, http.StatusOK, response.Code)

		var created models.Proposal
		json.Unmarshal(response.Body.Bytes(), &created)

		assert.Equal(t, 1, created.ID)
		assert.Equal(t, "draft", *created.Status)
	})

	//	proposalID := 1

	// 	t.Run("A community author should be able to update a draft proposal", func(t *testing.T) {
	// 		response := otu.GetDraftProposalAPI(proposalID)
	// 		CheckResponseCode(t, http.StatusOK, response.Code)

	// 		var p models.Proposal

	// 		json.Unmarshal(response.Body.Bytes(), &p)
	// 		strategy := "balance-of-nfts"
	// 		p.Strategy = &strategy

	// 		payload := otu.GenerateProposalPayload(authorName, &p)
	// 		response = otu.UpdateDraftProposalAPI(proposalID, payload)
	// 		CheckResponseCode(t, http.StatusOK, response.Code)

	// 		var updated models.Proposal
	// 		json.Unmarshal(response.Body.Bytes(), &updated)

	// 		assert.Equal(t, 1, updated.ID)
	// 		assert.Equal(t, "draft", *updated.Status)
	// 		assert.Equal(t, "balance-of-nfts", *updated.Strategy)
	// 	})

	// 	t.Run("A community author should be able to delete a draft proposal", func(t *testing.T) {
	// 		response := otu.GetDraftProposalAPI(proposalID)
	// 		CheckResponseCode(t, http.StatusOK, response.Code)

	// 		response = otu.DeleteDraftProposalAPI(proposalID)
	// 		CheckResponseCode(t, http.StatusOK, response.Code)

	// 		response = otu.GetDraftProposalAPI(proposalID)
	// 		CheckResponseCode(t, http.StatusNotFound, response.Code)
	// 	})
}
