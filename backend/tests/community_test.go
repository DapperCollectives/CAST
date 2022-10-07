package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/DapperCollectives/CAST/backend/tests/test_utils"
	utils "github.com/DapperCollectives/CAST/backend/tests/test_utils"
	"github.com/stretchr/testify/assert"
)

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

	response := otu.GetCommunityAPI(420)
	checkResponseCode(t, http.StatusBadRequest, response.Code)

	var e errorResponse
	json.Unmarshal(response.Body.Bytes(), &e)
	assert.Equal(t, errIncompleteRequest, e)
}

func TestCreateCommunity(t *testing.T) {
	// Prep
	clearTable("communities")
	clearTable("community_users")

	// Create Community
	communityStruct := otu.GenerateCommunityStruct("account")
	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)
	checkResponseCode(t, http.StatusCreated, response.Code)

	// Parse
	var community models.Community
	json.Unmarshal(response.Body.Bytes(), &community)

	// Validate
	assert.Equal(t, utils.DefaultCommunity.Name, community.Name)
	assert.Equal(t, utils.DefaultCommunity.Body, community.Body)
	assert.Equal(t, utils.DefaultCommunity.Logo, community.Logo)
	assert.NotNil(t, community.ID)
}

func TestCreateCommunityFailStrategy(t *testing.T) {
	// Prep
	clearTable("communities")
	clearTable("community_users")

	// Create Community
	communityStruct := otu.GenerateFailStrategyCommunityStruct("account")
	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)
	checkResponseCode(t, http.StatusBadRequest, response.Code)
}

func TestCreateCommunityFailThreshold(t *testing.T) {
	// Prep
	clearTable("communities")
	clearTable("community_users")

	// Create Community
	communityStruct := otu.GenerateFailThresholdCommunityStruct("account")
	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)
	checkResponseCode(t, http.StatusBadRequest, response.Code)
}

func TestCreateCommunityNilStrategy(t *testing.T) {
	// Prep
	clearTable("communities")
	clearTable("community_users")

	// Create Community
	communityStruct := otu.GenerateNilStrategyCommunityStruct("account")
	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)
	checkResponseCode(t, http.StatusCreated, response.Code)

	// Parse
	var community models.Community
	json.Unmarshal(response.Body.Bytes(), &community)

	// Validate
	assert.Equal(t, utils.NilStrategyCommunity.Name, community.Name)
	assert.Equal(t, utils.NilStrategyCommunity.Body, community.Body)
	assert.Equal(t, utils.NilStrategyCommunity.Logo, community.Logo)
	assert.NotNil(t, community.ID)
}

func TestCommunityAdminRoles(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")

	//CreateCommunity
	communityStruct := otu.GenerateCommunityStruct("account")
	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)
	checkResponseCode(t, http.StatusCreated, response.Code)

	// Parse Community
	var community models.Community
	json.Unmarshal(response.Body.Bytes(), &community)

	response = otu.GetCommunityUsersAPI(community.ID)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithUserType
	json.Unmarshal(response.Body.Bytes(), &p)

	//Admin user has all possible roles
	assert.Equal(t, true, p.Data[0].Is_admin)
	assert.Equal(t, true, p.Data[0].Is_author)
	assert.Equal(t, true, p.Data[0].Is_member)
}

func TestCommunityAuthorRoles(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")

	//CreateCommunity
	communityStruct := otu.GenerateCommunityStruct("account")
	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)
	checkResponseCode(t, http.StatusCreated, response.Code)

	// Parse Community
	var community models.Community
	json.Unmarshal(response.Body.Bytes(), &community)

	//Generate the user, admin must be the signer
	userStruct := otu.GenerateCommunityUserStruct("user1", "author")
	userPayload := otu.GenerateCommunityUserPayload("account", userStruct)

	response = otu.CreateCommunityUserAPI(community.ID, userPayload)
	checkResponseCode(t, http.StatusCreated, response.Code)

	// Query the community
	response = otu.GetCommunityUsersAPI(community.ID)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithUserType
	json.Unmarshal(response.Body.Bytes(), &p)

	// Make sure we check the correct community_user
	account, _ := otu.O.State.Accounts().ByName("emulator-user1")
	address := "0x" + account.Address().String()
	for _, user := range p.Data {
		if user.Addr == address {
			assert.Equal(t, false, user.Is_admin)
			assert.Equal(t, true, user.Is_author)
			assert.Equal(t, true, user.Is_member)
		}
	}

}

func TestGetCommunityAPI(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	otu.AddCommunities(1)

	response := otu.GetCommunityAPI(1)

	checkResponseCode(t, http.StatusOK, response.Code)
}

func TestGetCommunitiesForHomepageAPI(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	communityIds := otu.AddCommunities(2)
	otu.MakeFeaturedCommunity(communityIds[0])

	response := otu.GetCommunitiesForHomepageAPI()

	checkResponseCode(t, http.StatusOK, response.Code)

	//Parse the response
	var p test_utils.PaginatedResponseWithCommunity
	json.Unmarshal(response.Body.Bytes(), &p)

	assert.Equal(t, 1, len(p.Data))
}

func TestGetCommunityActiveStrategies(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")

	communityId := otu.AddCommunitiesWithUsers(1, "user1")[0]

	proposalStruct := otu.GenerateProposalStruct("user1", communityId)
	payload1 := otu.GenerateProposalPayload("user1", proposalStruct)
	otu.CreateProposalAPI(payload1)

	payload2 := otu.GenerateProposalPayload("user1", proposalStruct)
	otu.CreateProposalAPI(payload2)

	cancelPayload := otu.GenerateCancelProposalStruct("user1", payload1.ID)
	otu.UpdateProposalAPI(payload1.ID, cancelPayload)

	response := otu.GetCommunityActiveStrategies(communityId)
	CheckResponseCode(t, http.StatusOK, response.Code)

	var results []string
	json.Unmarshal(response.Body.Bytes(), &results)

	assert.Equal(t, 1, len(results))
}

func TestUpdateCommunity(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")

	// Create Community
	communityStruct := otu.GenerateCommunityStruct("account")
	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)

	// Check response code
	checkResponseCode(t, http.StatusCreated, response.Code)

	// Fetch community to compare updated version against
	response = otu.GetCommunityAPI(1)

	// Get the original community from the API
	var oldCommunity models.Community
	json.Unmarshal(response.Body.Bytes(), &oldCommunity)

	// Update some fields
	payload := otu.GenerateCommunityPayload("account", &utils.UpdatedCommunity)
	thresholdOne := "1"
	payload.Proposal_threshold = &thresholdOne

	response = otu.UpdateCommunityAPI(oldCommunity.ID, payload)
	checkResponseCode(t, http.StatusOK, response.Code)

	// Get community again for assertions
	response = otu.GetCommunityAPI(oldCommunity.ID)
	var updatedCommunity models.Community
	json.Unmarshal(response.Body.Bytes(), &updatedCommunity)

	assert.Equal(t, oldCommunity.ID, updatedCommunity.ID)
	assert.Equal(t, *utils.UpdatedCommunity.Logo, *updatedCommunity.Logo)
	assert.Equal(t, *utils.UpdatedCommunity.Strategies, *updatedCommunity.Strategies)
	assert.Equal(t, *utils.UpdatedCommunity.Banner_img_url, *updatedCommunity.Banner_img_url)
	assert.Equal(t, *utils.UpdatedCommunity.Website_url, *updatedCommunity.Website_url)
	assert.Equal(t, *utils.UpdatedCommunity.Twitter_url, *updatedCommunity.Twitter_url)
	assert.Equal(t, *utils.UpdatedCommunity.Github_url, *updatedCommunity.Github_url)
	assert.Equal(t, *utils.UpdatedCommunity.Discord_url, *updatedCommunity.Discord_url)
	assert.Equal(t, *utils.UpdatedCommunity.Instagram_url, *updatedCommunity.Instagram_url)
}

func TestCanUserCreateProposalForCommunityOnlyAuthors(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	var _true = true
	var contractType = "ft"

	// Create Community
	communityStruct := otu.GenerateCommunityStruct("account")
	communityStruct.Only_authors_to_submit = &_true
	communityStruct.Contract_type = &contractType
	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)

	var community models.Community
	json.Unmarshal(response.Body.Bytes(), &community)

	// Authors can create proposal
	t.Run("Authors should be able to create proposals", func(t *testing.T) {
		// Generate author user
		userName := "user1"
		userStruct := otu.GenerateCommunityUserStruct(userName, "author")
		userPayload := otu.GenerateCommunityUserPayload("account", userStruct)

		response = otu.CreateCommunityUserAPI(community.ID, userPayload)
		checkResponseCode(t, http.StatusCreated, response.Code)

		// Check if user can create community
		account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", userName))
		address := "0x" + account.Address().String()
		response = otu.GetCanUserCreateProposalAPI(community.ID, address)
		checkResponseCode(t, http.StatusOK, response.Code)
		var responsePayload models.CanUserCreateProposalResponse
		json.Unmarshal(response.Body.Bytes(), &responsePayload)

		assert.True(t, responsePayload.HasPermission)

	})

	t.Run("Admins should be able to create proposals", func(t *testing.T) {
		// Generate admin user
		userName := "user2"
		userStruct := otu.GenerateCommunityUserStruct(userName, "admin")
		userPayload := otu.GenerateCommunityUserPayload("account", userStruct)

		response = otu.CreateCommunityUserAPI(community.ID, userPayload)
		checkResponseCode(t, http.StatusCreated, response.Code)

		// Check if user can create proposal
		account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", userName))
		address := "0x" + account.Address().String()
		response = otu.GetCanUserCreateProposalAPI(community.ID, address)
		checkResponseCode(t, http.StatusOK, response.Code)
		var responsePayload models.CanUserCreateProposalResponse
		json.Unmarshal(response.Body.Bytes(), &responsePayload)

		assert.True(t, responsePayload.HasPermission)

	})

	t.Run("Members should not be able to create proposals if community is configured to Only_authors_to_submit", func(t *testing.T) {
		// Generate member user
		userName := "user3"
		userStruct := otu.GenerateCommunityUserStruct(userName, "member")
		userPayload := otu.GenerateCommunityUserPayload(userName, userStruct)

		response = otu.CreateCommunityUserAPI(community.ID, userPayload)
		checkResponseCode(t, http.StatusCreated, response.Code)

		// Check if user can create community
		account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", userName))
		address := "0x" + account.Address().String()
		response = otu.GetCanUserCreateProposalAPI(community.ID, address)
		checkResponseCode(t, http.StatusOK, response.Code)
		var responsePayload models.CanUserCreateProposalResponse
		json.Unmarshal(response.Body.Bytes(), &responsePayload)

		assert.False(t, responsePayload.HasPermission)
		assert.Contains(t, "is not an author for community", responsePayload.Reason)

	})
}

func TestCanUserCreateProposalForCommunityTokenThreshold(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	var _false = false

	// Create Community
	communityStruct := otu.GenerateCommunityStruct("account")
	communityStruct.Only_authors_to_submit = &_false
	threshold := "10"
	contractName := "FlowToken"
	contractAddr := "0x0ae53cb6e3f42a79"
	contractType := "ft"
	publicPath := "flowTokenBalance"
	communityStruct.Proposal_threshold = &threshold
	communityStruct.Contract_addr = &contractAddr
	communityStruct.Contract_name = &contractName
	communityStruct.Public_path = &publicPath
	communityStruct.Contract_type = &contractType
	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)

	var community models.Community
	json.Unmarshal(response.Body.Bytes(), &community)

	// Authors can create proposal
	t.Run("Authors should be able to create proposals", func(t *testing.T) {
		// Generate author user
		userName := "user1"
		userStruct := otu.GenerateCommunityUserStruct(userName, "author")
		userPayload := otu.GenerateCommunityUserPayload("account", userStruct)

		response = otu.CreateCommunityUserAPI(community.ID, userPayload)
		checkResponseCode(t, http.StatusCreated, response.Code)

		// Check if user can create community
		account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", userName))
		address := "0x" + account.Address().String()
		response = otu.GetCanUserCreateProposalAPI(community.ID, address)
		checkResponseCode(t, http.StatusOK, response.Code)
		var responsePayload models.CanUserCreateProposalResponse
		json.Unmarshal(response.Body.Bytes(), &responsePayload)

		assert.True(t, responsePayload.HasPermission)

	})

	t.Run("Non-authors should not be able to create proposals if they don't have enough tokens", func(t *testing.T) {
		// Generate member user
		userName := "user2"
		userStruct := otu.GenerateCommunityUserStruct(userName, "member")
		userPayload := otu.GenerateCommunityUserPayload(userName, userStruct)

		response = otu.CreateCommunityUserAPI(community.ID, userPayload)
		checkResponseCode(t, http.StatusCreated, response.Code)

		// Check if user can create community
		account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", userName))
		address := "0x" + account.Address().String()
		response = otu.GetCanUserCreateProposalAPI(community.ID, address)
		checkResponseCode(t, http.StatusOK, response.Code)
		var responsePayload models.CanUserCreateProposalResponse
		json.Unmarshal(response.Body.Bytes(), &responsePayload)

		assert.False(t, responsePayload.HasPermission)
		assert.Equal(t, "Insufficient token balance to create proposal.", responsePayload.Reason)
	})

	t.Run("Non-authors should be able to create proposals if they do have enough tokens", func(t *testing.T) {
		// Generate member user
		userName := "user3"
		userStruct := otu.GenerateCommunityUserStruct(userName, "member")
		userPayload := otu.GenerateCommunityUserPayload(userName, userStruct)

		response = otu.CreateCommunityUserAPI(community.ID, userPayload)
		checkResponseCode(t, http.StatusCreated, response.Code)

		// Give user 5 flow tokens
		var amount float64 = 5.0
		otu.TransferFlowTokens("account", userName, amount)

		// Check if user can create community
		account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", userName))
		address := "0x" + account.Address().String()
		response = otu.GetCanUserCreateProposalAPI(community.ID, address)
		checkResponseCode(t, http.StatusOK, response.Code)
		var canCreateProposal bool
		json.Unmarshal(response.Body.Bytes(), &canCreateProposal)

		assert.False(t, canCreateProposal)

		// Give user 5 more flow tokens to meet minimum threshold
		otu.TransferFlowTokens("account", userName, amount)

		// Check if user can create community
		response = otu.GetCanUserCreateProposalAPI(community.ID, address)
		var responsePayload models.CanUserCreateProposalResponse
		json.Unmarshal(response.Body.Bytes(), &responsePayload)

		assert.True(t, responsePayload.HasPermission)
	})
}

// func TestUpdateStrategies(t *testing.T) {
// 	clearTable("communities")
// 	clearTable("community_users")

// 	communityStruct := otu.GenerateCommunityStruct("account")
// 	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)
// 	response := otu.CreateCommunityAPI(communityPayload)

// 	// Check response code
// 	checkResponseCode(t, http.StatusCreated, response.Code)

// 	// Fetch community to compare updated version against
// 	response = otu.GetCommunityAPI(1)

// 	// Get the original community from the API
// 	var oldCommunity models.Community
// 	json.Unmarshal(response.Body.Bytes(), &oldCommunity)

// }
