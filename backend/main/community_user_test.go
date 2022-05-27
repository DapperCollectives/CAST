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

////////////////////
// CommunityUsers //
////////////////////

func TestCreateCommunityUsers(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")

	communityStruct := otu.GenerateCommunityStruct("account")

	//create the author before generating the payload
	var createCommunityStruct models.CreateCommunityRequestPayload
	createCommunityStruct.Community = *communityStruct
	author := []string{"0x01cf0e2f2f715450"}
	createCommunityStruct.Additional_authors = &author

	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)
	checkResponseCode(t, http.StatusCreated, response.Code)

	//Parse Community
	var community models.Community
	json.Unmarshal(response.Body.Bytes(), &community)

	//Query the community
	response = otu.GetCommunityUsersAPI(community.ID)
	checkResponseCode(t, http.StatusOK, response.Code)

	//Parse the response
	var p test_utils.PaginatedResponseWithUser
	json.Unmarshal(response.Body.Bytes(), &p)

	for _, user := range p.Data {
		if utils.DefaultAuthor == user {
			assert.Equal(t, utils.DefaultAuthor, user)
		}
	}
}

func TestGetCommunityUsers(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")

	communityStruct := otu.GenerateCommunityStruct("account")
	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)
	checkResponseCode(t, http.StatusCreated, response.Code)

	var community models.Community
	json.Unmarshal(response.Body.Bytes(), &community)

	response = otu.GetCommunityUsersAPI(community.ID)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithUser
	json.Unmarshal(response.Body.Bytes(), &p)

	// three user roles created by default
	// admin, author and member
	assert.Equal(t, 3, len(p.Data))
}

func TestGetUserCommunities(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")

	communityStruct := otu.GenerateCommunityStruct("account")
	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)
	checkResponseCode(t, http.StatusCreated, response.Code)

	var community models.Community
	json.Unmarshal(response.Body.Bytes(), &community)

	response = otu.GetUserCommunitiesAPI(utils.AdminAddr)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p shared.PaginatedResponse
	json.Unmarshal(response.Body.Bytes(), &p)

	assert.Equal(t, 3, p.TotalRecords)
}

func TestDeleteUserFromCommunity(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")

	communityStruct := otu.GenerateCommunityStruct("account")

	//create the author before generating the payload
	var createCommunityStruct models.CreateCommunityRequestPayload
	createCommunityStruct.Community = *communityStruct
	author := []string{"0x01cf0e2f2f715450"}
	createCommunityStruct.Additional_authors = &author

	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)
	checkResponseCode(t, http.StatusCreated, response.Code)

	var community models.Community
	json.Unmarshal(response.Body.Bytes(), &community)

	//generate the user, admin must be the signer
	userStruct := otu.GenerateCommunityUserStruct("user1", "author")
	userPayload := otu.GenerateCommunityUserPayload("account", userStruct)

	response = otu.DeleteUserFromCommunityAPI(
		community.ID,
		utils.UserOneAddr,
		"author",
		userPayload,
	)
	checkResponseCode(t, http.StatusOK, response.Code)

	//Query the community
	response = otu.GetCommunityUsersAPI(community.ID)
	checkResponseCode(t, http.StatusOK, response.Code)

	//Parse the response
	var p test_utils.PaginatedResponseWithUser
	json.Unmarshal(response.Body.Bytes(), &p)

	// assert that the user does not have the role of author
	for _, user := range p.Data {
		if user.Addr == utils.UserOneAddr {
			assert.False(t, user.User_type == "author")
		}
	}
}
