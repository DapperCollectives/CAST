package main

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/brudfyi/flow-voting-tool/main/models"
	"github.com/brudfyi/flow-voting-tool/main/shared"
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

// func TestCreateCommunityAllowlist(t *testing.T) {
// 	_ = utils.NewOverflowTest(t, &A)
// 	clearTable("communities")
// 	clearTable("community_users")

// 	communityPayload := utils.GenerateValidCommunityPayload("0x01")

// 	req, _ := http.NewRequest("POST", "/communities", bytes.NewBuffer(communityPayload))
// 	req.Header.Set("Content-Type", "application/json")

// 	response := executeRequest(req)
// 	checkResponseCode(t, http.StatusForbidden, response.Code)

// 	var m map[string]interface{}
// 	json.Unmarshal(response.Body.Bytes(), &m)

// 	if m["error"] != "user does not have permission" {
// 		t.Errorf("Expected err to be 'user does not have permission'. Got '%v'", m["error"])
// 	}
// }

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
