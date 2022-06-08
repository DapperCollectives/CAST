package main

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/brudfyi/flow-voting-tool/main/models"
	"github.com/brudfyi/flow-voting-tool/main/shared"
	"github.com/brudfyi/flow-voting-tool/main/test_utils"
	utils "github.com/brudfyi/flow-voting-tool/main/test_utils"
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

	assert.Equal(t, "Community not found", m["error"])
}

func TestCreateCommunity(t *testing.T) {
	// Prep
	clearTable("communities")
	clearTable("community_users")

	// Create Community
	communityStruct := otu.GenerateCommunityStruct("account")
	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)
	response := otu.CreateCommunityAPI(communityPayload)

	// Check response code
	checkResponseCode(t, http.StatusCreated, response.Code)

	// Parse
	var community models.Community
	json.Unmarshal(response.Body.Bytes(), &community)

	// Validate
	assert.NotEqual(t, nil, community.Cid)
	assert.Equal(t, utils.DefaultCommunity.Name, community.Name)
	assert.Equal(t, utils.DefaultCommunity.Body, community.Body)
	assert.Equal(t, utils.DefaultCommunity.Logo, community.Logo)
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

	var p test_utils.PaginatedResponseWithUser
	json.Unmarshal(response.Body.Bytes(), &p)

	//loop through response, validate user types for specific index
	for i, u := range p.Data {
		if i == 0 && u.Addr == test_utils.AdminAddr {
			assert.Equal(t, "member", u.User_type)
		}
		if i == 1 && u.Addr == test_utils.AdminAddr {
			assert.Equal(t, "author", u.User_type)
		}
		if i == 2 && u.Addr == test_utils.AdminAddr {
			assert.Equal(t, "admin", u.User_type)
		}
	}
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

	var p test_utils.PaginatedResponseWithUser
	json.Unmarshal(response.Body.Bytes(), &p)

	//loop through response, validate user types for specific index
	for i, u := range p.Data {
		if i == 3 && u.Addr == test_utils.UserOneAddr {
			assert.Equal(t, "author", u.User_type)
		}
		if i == 4 && u.Addr == test_utils.UserOneAddr {
			assert.Equal(t, "member", u.User_type)
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
	communityToUpdate := utils.UpdatedCommunity
	payload := otu.GenerateCommunityPayload("account", &communityToUpdate)

	response = otu.UpdateCommunityAPI(oldCommunity.ID, payload)
	checkResponseCode(t, http.StatusOK, response.Code)

	// Get community again for assertions
	response = otu.GetCommunityAPI(oldCommunity.ID)
	var updatedCommunity models.Community
	json.Unmarshal(response.Body.Bytes(), &updatedCommunity)

	assert.Equal(t, oldCommunity.ID, updatedCommunity.ID)
	assert.Equal(t, utils.UpdatedCommunity.Name, updatedCommunity.Name)
	assert.Equal(t, *utils.UpdatedCommunity.Logo, *updatedCommunity.Logo)
	assert.Equal(t, *utils.UpdatedCommunity.Banner_img_url, *updatedCommunity.Banner_img_url)
	assert.Equal(t, *utils.UpdatedCommunity.Website_url, *updatedCommunity.Website_url)
	assert.Equal(t, *utils.UpdatedCommunity.Twitter_url, *updatedCommunity.Twitter_url)
	assert.Equal(t, *utils.UpdatedCommunity.Github_url, *updatedCommunity.Github_url)
	assert.Equal(t, *utils.UpdatedCommunity.Discord_url, *updatedCommunity.Discord_url)
	assert.Equal(t, *utils.UpdatedCommunity.Instagram_url, *updatedCommunity.Instagram_url)
}
