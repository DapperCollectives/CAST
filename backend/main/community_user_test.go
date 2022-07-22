package main

import (
	"encoding/json"
	"net/http"
	"sort"
	"strings"
	"testing"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/test_utils"
	utils "github.com/DapperCollectives/CAST/backend/main/test_utils"
	"github.com/stretchr/testify/assert"
)

////////////////////
// CommunityUsers //
////////////////////

func TestCreateCommunityUsers(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")

	communityStruct := otu.GenerateCommunityStruct("account")

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

	var p test_utils.PaginatedResponseWithUserType
	json.Unmarshal(response.Body.Bytes(), &p)

	assert.Equal(t, 1, len(p.Data))
	assert.Equal(t, true, p.Data[0].Is_admin)
	assert.Equal(t, true, p.Data[0].Is_author)
	assert.Equal(t, true, p.Data[0].Is_member)
}

func TestGetCommunityUsersByType(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")

	communityStruct := otu.GenerateCommunityStruct("account")
	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)
	checkResponseCode(t, http.StatusCreated, response.Code)

	var community models.Community
	json.Unmarshal(response.Body.Bytes(), &community)

	response = otu.GetCommunityUsersAPIByType(community.ID, "admin")
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithUser
	json.Unmarshal(response.Body.Bytes(), &p)

	assert.Equal(t, 1, len(p.Data))
	assert.Equal(t, "admin", p.Data[0].User_type)

	response = otu.GetCommunityUsersAPIByType(community.ID, "author")
	checkResponseCode(t, http.StatusOK, response.Code)

	json.Unmarshal(response.Body.Bytes(), &p)

	assert.Equal(t, 1, len(p.Data))
	assert.Equal(t, "author", p.Data[0].User_type)

	response = otu.GetCommunityUsersAPIByType(community.ID, "member")
	checkResponseCode(t, http.StatusOK, response.Code)

	json.Unmarshal(response.Body.Bytes(), &p)

	assert.Equal(t, 1, len(p.Data))
	assert.Equal(t, "member", p.Data[0].User_type)
}

func TestGetCommunityUsersByInvalidType(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")

	communityStruct := otu.GenerateCommunityStruct("account")
	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)
	checkResponseCode(t, http.StatusCreated, response.Code)

	var community models.Community
	json.Unmarshal(response.Body.Bytes(), &community)

	response = otu.GetCommunityUsersAPIByType(community.ID, "invalidType")
	checkResponseCode(t, http.StatusBadRequest, response.Code)
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

	var p test_utils.PaginatedResponseWithUserCommunity
	json.Unmarshal(response.Body.Bytes(), &p)

	roles := strings.Split(p.Data[0].Roles, ",")
	sort.Strings(roles)

	assert.Equal(t, 1, p.TotalRecords)
	assert.Equal(t, "admin,author,member", strings.Join(roles, ","))
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
