package main

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/DapperCollectives/CAST/backend/main/test_utils"
	utils "github.com/DapperCollectives/CAST/backend/main/test_utils"
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
	checkResponseCode(t, http.StatusNotFound, response.Code)

	var m map[string]string
	json.Unmarshal(response.Body.Bytes(), &m)

	assert.Equal(t, "Community not found.", m["error"])
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

func TestCreateCommunityFail(t *testing.T) {
	// Prep
	clearTable("communities")
	clearTable("community_users")

	// Create Community
	communityStruct := otu.GenerateFailCommunityStruct("account")
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

	assert.Equal(t, false, p.Data[0].Is_admin)
	assert.Equal(t, true, p.Data[0].Is_author)
	assert.Equal(t, true, p.Data[0].Is_member)
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
