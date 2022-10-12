package main

import (
	"encoding/json"
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
	communityStruct := otu.GenerateCommunityStruct("account", "dao")
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
	communityStruct := otu.GenerateCommunityStruct("account", "dao")
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
	communityStruct := otu.GenerateCommunityStruct("account", "dao")
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
	otu.AddCommunities(1, "dao")

	response := otu.GetCommunityAPI(1)

	checkResponseCode(t, http.StatusOK, response.Code)
}

func TestGetCommunitiesForHomepageAPI(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	communityIds := otu.AddCommunities(2, "dao")
	otu.MakeFeaturedCommunity(communityIds[0])

	response := otu.GetCommunitiesForHomepageAPI()

	checkResponseCode(t, http.StatusOK, response.Code)

	//Parse the response
	var p test_utils.PaginatedResponseWithCommunity
	json.Unmarshal(response.Body.Bytes(), &p)

	assert.Equal(t, 1, len(p.Data))
}

func TestSearchForCommunities(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	communityIds := otu.AddCommunities(5, "dao")
	otu.MakeFeaturedCommunity(communityIds[0])
	otu.MakeFeaturedCommunity(communityIds[1])

	communityIds = otu.AddCommunities(3, "social")
	otu.MakeFeaturedCommunity(communityIds[0])
	otu.MakeFeaturedCommunity(communityIds[1])

	communityIds = otu.AddCommunities(2, "protocol")
	otu.MakeFeaturedCommunity(communityIds[0])

	otu.AddCommunities(1, "Collector")

	t.Run("Default Search for Featured Communities", func(t *testing.T) {
		response := otu.GetSearchCommunitiesAPI([]string{}, "", nil)

		checkResponseCode(t, http.StatusOK, response.Code)

		var p test_utils.PaginatedResponseSearch
		json.Unmarshal(response.Body.Bytes(), &p)

		assert.Equal(t, 2, p.Filters[0].Amount)                // Dao
		assert.Equal(t, 2, p.Filters[1].Amount)                // Social
		assert.Equal(t, 1, p.Filters[2].Amount)                // Protocol
		assert.Equal(t, 5, p.Filters[len(p.Filters)-1].Amount) // All
		assert.Equal(t, 5, len(p.Results.Data))                // Featured Communities
	})

	t.Run("Default Search with filter", func(t *testing.T) {
		response := otu.GetSearchCommunitiesAPI([]string{"social"}, "", nil)

		checkResponseCode(t, http.StatusOK, response.Code)

		var p1 test_utils.PaginatedResponseSearch
		json.Unmarshal(response.Body.Bytes(), &p1)

		assert.Equal(t, 2, p1.Filters[0].Amount)                 // Dao
		assert.Equal(t, 2, p1.Filters[1].Amount)                 // Social
		assert.Equal(t, 1, p1.Filters[2].Amount)                 // Protocol
		assert.Equal(t, 5, p1.Filters[len(p1.Filters)-1].Amount) // All
		assert.Equal(t, 2, len(p1.Results.Data))                 // Filtered by "social"

		response = otu.GetSearchCommunitiesAPI([]string{"social,dao"}, "", nil)

		checkResponseCode(t, http.StatusOK, response.Code)

		var p2 test_utils.PaginatedResponseSearch
		json.Unmarshal(response.Body.Bytes(), &p2)

		assert.Equal(t, 2, p2.Filters[0].Amount)                 // Dao
		assert.Equal(t, 2, p2.Filters[1].Amount)                 // Social
		assert.Equal(t, 1, p2.Filters[2].Amount)                 // Protocol
		assert.Equal(t, 5, p2.Filters[len(p2.Filters)-1].Amount) // All
		assert.Equal(t, 4, len(p2.Results.Data))                 // Filtered by "social" and "dao"
	})

	t.Run("Limit Default Search", func(t *testing.T) {
		limit := 2
		response := otu.GetSearchCommunitiesAPI([]string{}, "", &limit)

		checkResponseCode(t, http.StatusOK, response.Code)

		var p test_utils.PaginatedResponseSearch
		json.Unmarshal(response.Body.Bytes(), &p)

		assert.Equal(t, 2, p.Filters[0].Amount)                // Dao
		assert.Equal(t, 2, p.Filters[1].Amount)                // Social
		assert.Equal(t, 1, p.Filters[2].Amount)                // Protocol
		assert.Equal(t, 5, p.Filters[len(p.Filters)-1].Amount) // All
		assert.Equal(t, limit, len(p.Results.Data))            // Featured Communities limited
	})

	t.Run("Limit Default Search with filter", func(t *testing.T) {
		limit := 1
		response := otu.GetSearchCommunitiesAPI([]string{"dao"}, "", &limit)

		checkResponseCode(t, http.StatusOK, response.Code)

		var p test_utils.PaginatedResponseSearch
		json.Unmarshal(response.Body.Bytes(), &p)

		assert.Equal(t, 2, p.Filters[0].Amount)                // Dao
		assert.Equal(t, 2, p.Filters[1].Amount)                // Social
		assert.Equal(t, 1, p.Filters[2].Amount)                // Protocol
		assert.Equal(t, 5, p.Filters[len(p.Filters)-1].Amount) // All
		assert.Equal(t, limit, len(p.Results.Data))            // Filtered and limited
	})

	t.Run("Search with text", func(t *testing.T) {
		response := otu.GetSearchCommunitiesAPI([]string{}, "test", nil)

		checkResponseCode(t, http.StatusOK, response.Code)

		var p test_utils.PaginatedResponseSearch
		json.Unmarshal(response.Body.Bytes(), &p)

		assert.Equal(t, 5, p.Filters[0].Amount)                 // Dao
		assert.Equal(t, 3, p.Filters[1].Amount)                 // Social
		assert.Equal(t, 2, p.Filters[2].Amount)                 // Protocol
		assert.Equal(t, 10, p.Filters[len(p.Filters)-1].Amount) // All
		assert.Equal(t, 10, len(p.Results.Data))                // text = "test"
	})

	t.Run("Search with text no results", func(t *testing.T) {
		response := otu.GetSearchCommunitiesAPI([]string{}, "abc", nil)

		checkResponseCode(t, http.StatusOK, response.Code)

		var p test_utils.PaginatedResponseSearch
		json.Unmarshal(response.Body.Bytes(), &p)

		assert.Equal(t, 0, p.Filters[0].Amount)                // Dao
		assert.Equal(t, 0, p.Filters[1].Amount)                // Social
		assert.Equal(t, 0, p.Filters[2].Amount)                // Protocol
		assert.Equal(t, 0, p.Filters[len(p.Filters)-1].Amount) // All
		assert.Equal(t, 0, len(p.Results.Data))                // text = "abc"
	})

	t.Run("Search with text and filter", func(t *testing.T) {
		response := otu.GetSearchCommunitiesAPI([]string{"dao"}, "test", nil)

		checkResponseCode(t, http.StatusOK, response.Code)

		var p test_utils.PaginatedResponseSearch
		json.Unmarshal(response.Body.Bytes(), &p)

		assert.Equal(t, 5, p.Filters[0].Amount)                 // Dao
		assert.Equal(t, 3, p.Filters[1].Amount)                 // Social
		assert.Equal(t, 2, p.Filters[2].Amount)                 // Protocol
		assert.Equal(t, 10, p.Filters[len(p.Filters)-1].Amount) // All
		assert.Equal(t, 5, len(p.Results.Data))                 // text = "test"
	})

	t.Run("Search with text and multiple filters", func(t *testing.T) {
		response := otu.GetSearchCommunitiesAPI([]string{"dao", "social"}, "test", nil)

		checkResponseCode(t, http.StatusOK, response.Code)

		var p test_utils.PaginatedResponseSearch
		json.Unmarshal(response.Body.Bytes(), &p)

		assert.Equal(t, 5, p.Filters[0].Amount)                 // Dao
		assert.Equal(t, 3, p.Filters[1].Amount)                 // Social
		assert.Equal(t, 2, p.Filters[2].Amount)                 // Protocol
		assert.Equal(t, 10, p.Filters[len(p.Filters)-1].Amount) // All
		assert.Equal(t, 8, len(p.Results.Data))                 // text = "test"
	})

	t.Run("Limit Search with text", func(t *testing.T) {
		limit := 5
		response := otu.GetSearchCommunitiesAPI([]string{}, "test", &limit)

		checkResponseCode(t, http.StatusOK, response.Code)

		var p test_utils.PaginatedResponseSearch
		json.Unmarshal(response.Body.Bytes(), &p)

		assert.Equal(t, 5, p.Filters[0].Amount)                 // Dao
		assert.Equal(t, 3, p.Filters[1].Amount)                 // Social
		assert.Equal(t, 2, p.Filters[2].Amount)                 // Protocol
		assert.Equal(t, 10, p.Filters[len(p.Filters)-1].Amount) // All
		assert.Equal(t, limit, len(p.Results.Data))             // limited to 5
	})

	t.Run("Limit Search with text and filter", func(t *testing.T) {
		limit := 3
		response := otu.GetSearchCommunitiesAPI([]string{"dao"}, "test", &limit)

		checkResponseCode(t, http.StatusOK, response.Code)

		var p test_utils.PaginatedResponseSearch
		json.Unmarshal(response.Body.Bytes(), &p)

		assert.Equal(t, 5, p.Filters[0].Amount)                 // Dao
		assert.Equal(t, 3, p.Filters[1].Amount)                 // Social
		assert.Equal(t, 2, p.Filters[2].Amount)                 // Protocol
		assert.Equal(t, 10, p.Filters[len(p.Filters)-1].Amount) // All
		assert.Equal(t, limit, len(p.Results.Data))             // limited to 3
	})

	t.Run("Search Pagination", func(t *testing.T) {
		limit := 3
		response := otu.GetSearchCommunitiesAPI([]string{"dao"}, "test", &limit)

		checkResponseCode(t, http.StatusOK, response.Code)

		var p test_utils.PaginatedResponseSearch
		json.Unmarshal(response.Body.Bytes(), &p)

		assert.Equal(t, 5, p.Filters[0].Amount)                 // Dao
		assert.Equal(t, 3, p.Filters[1].Amount)                 // Social
		assert.Equal(t, 2, p.Filters[2].Amount)                 // Protocol
		assert.Equal(t, 10, p.Filters[len(p.Filters)-1].Amount) // All
		assert.Equal(t, limit, len(p.Results.Data))             // limited to 3
	})

	t.Run("Total Records should be the same as all field of filters", func(t *testing.T) {
		response := otu.GetSearchCommunitiesAPI([]string{"dao"}, "test", nil)

		checkResponseCode(t, http.StatusOK, response.Code)

		var p test_utils.PaginatedResponseSearch
		json.Unmarshal(response.Body.Bytes(), &p)

		assert.Equal(t, p.Results.TotalRecords, p.Filters[len(p.Filters)-1].Amount) // All
	})

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
	communityStruct := otu.GenerateCommunityStruct("account", "dao")
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
