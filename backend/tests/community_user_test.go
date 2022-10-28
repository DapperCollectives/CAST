package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"testing"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/tests/test_utils"
	utils "github.com/DapperCollectives/CAST/backend/tests/test_utils"
	"github.com/stretchr/testify/assert"
)

////////////////////
// CommunityUsers //
////////////////////

func TestCreateCommunityUsers(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")

	communityStruct := otu.GenerateCommunityStruct("account", "dao")

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

	communityStruct := otu.GenerateCommunityStruct("account", "dao")
	communityPayload := otu.GenerateCommunityPayload("account", communityStruct)

	response := otu.CreateCommunityAPI(communityPayload)
	checkResponseCode(t, http.StatusCreated, response.Code)

	var community models.Community
	json.Unmarshal(response.Body.Bytes(), &community)

	response = otu.GetCommunityUsersAPI(community.ID)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithUserType
	json.Unmarshal(response.Body.Bytes(), &p)

	t.Run("Community creator should be assigned correct roles", func(t *testing.T) {
		assert.Equal(t, 1, len(p.Data))
		assert.Equal(t, true, p.Data[0].Is_admin)
		assert.Equal(t, true, p.Data[0].Is_author)
		assert.Equal(t, true, p.Data[0].Is_member)
	})
}

func TestGetCommunityUsersByType(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")

	communityStruct := otu.GenerateCommunityStruct("account", "dao")
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

	communityStruct := otu.GenerateCommunityStruct("account", "dao")
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

	communityStruct := otu.GenerateCommunityStruct("account", "dao")
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

func TestUserProposals(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")

	t.Run("Get user proposals", func(t *testing.T) {

		argsOne := map[string]string{"user": "account", "type": "dao"}
		argsTwo := map[string]string{"user": "account", "type": "protocol"}
		argsThree := map[string]string{"user": "account", "type": "creator"}

		communityArgs := []map[string]string{argsOne, argsTwo, argsThree}

		for _, args := range communityArgs {
			communityID := 1
			communityStruct := otu.GenerateCommunityStruct(args["user"], args["type"])
			communityPayload := otu.GenerateCommunityPayload(args["user"], communityStruct)

			response := otu.CreateCommunityAPI(communityPayload)
			checkResponseCode(t, http.StatusCreated, response.Code)

			proposal := otu.GenerateProposalStruct("account", communityID)
			proposalPayload := otu.GenerateProposalPayload("account", proposal)

			response = otu.CreateProposalAPI(proposalPayload)
			fmt.Printf("For Loop Response: %v \n", response.Body)
			checkResponseCode(t, http.StatusCreated, response.Code)
			communityID += 1
		}

		response := otu.GetCommunityUserProposalsAPI(utils.AdminAddr)

		fmt.Printf("Response: %v ", response.Body.String())
		checkResponseCode(t, http.StatusOK, response.Code)

		var p test_utils.PaginatedResponseWithProposal
		json.Unmarshal(response.Body.Bytes(), &p)

		//all have the same community id
		assert.Equal(t, 1, p.Data[0].Community_id)
		assert.Equal(t, 1, p.Data[1].Community_id)
		assert.Equal(t, 1, p.Data[2].Community_id)
		assert.NotNil(t, p.Data[0].Name)
	})

	clearTable("communities")
	clearTable("community_users")

	t.Run("Get user proposals with 'draft' status filter applied", func(t *testing.T) {
		argsOne := map[string]string{"user": "account", "type": "dao"}
		argsTwo := map[string]string{"user": "account", "type": "protocol"}
		argsThree := map[string]string{"user": "account", "type": "creator"}

		communityArgs := []map[string]string{argsOne, argsTwo, argsThree}

		for _, args := range communityArgs {
			communityID := 1
			communityStruct := otu.GenerateCommunityStruct(args["user"], args["type"])
			communityPayload := otu.GenerateCommunityPayload(args["user"], communityStruct)

			response := otu.CreateCommunityAPI(communityPayload)
			checkResponseCode(t, http.StatusCreated, response.Code)

			proposal := otu.GenerateDraftProposalStruct("account", communityID)
			proposalPayload := otu.GenerateProposalPayload("account", proposal)

			response = otu.CreateProposalAPI(proposalPayload)
			checkResponseCode(t, http.StatusCreated, response.Code)
			communityID += 1
		}

		response := otu.GetCommunityUserProposalsAPIWithFilter(utils.AdminAddr, "draft")
		checkResponseCode(t, http.StatusOK, response.Code)

		var p test_utils.PaginatedResponseWithProposal
		json.Unmarshal(response.Body.Bytes(), &p)

		assert.Equal(t, "draft", *p.Data[0].Status)
		assert.Equal(t, "draft", *p.Data[1].Status)
		assert.Equal(t, "draft", *p.Data[2].Status)

		assert.Equal(t, 1, p.Data[0].Community_id)
		assert.Equal(t, 1, p.Data[1].Community_id)
		assert.Equal(t, 1, p.Data[2].Community_id)
	})

	t.Run("Get user proposals with 'profile-votes' filter applied", func(t *testing.T) {
		argsOne := map[string]string{"user": "account", "type": "dao"}
		argsTwo := map[string]string{"user": "account", "type": "protocol"}
		argsThree := map[string]string{"user": "account", "type": "creator"}

		communityArgs := []map[string]string{argsOne, argsTwo, argsThree}

		for _, args := range communityArgs {
			communityStruct := otu.GenerateCommunityStruct(args["user"], args["type"])
			communityPayload := otu.GenerateCommunityPayload(args["user"], communityStruct)

			response := otu.CreateCommunityAPI(communityPayload)
			checkResponseCode(t, http.StatusCreated, response.Code)

			var createdCommunity models.Community
			json.Unmarshal(response.Body.Bytes(), &createdCommunity)

			proposal := otu.GenerateProposalStruct("account", createdCommunity.ID)
			proposalPayload := otu.GenerateProposalPayload("account", proposal)

			response = otu.CreateProposalAPI(proposalPayload)
			checkResponseCode(t, http.StatusCreated, response.Code)

			var createdProposal models.Proposal
			json.Unmarshal(response.Body.Bytes(), &createdProposal)

			votePayload := otu.GenerateValidVotePayload("account", createdProposal.ID, 0)

			response = otu.CreateVoteAPI(createdProposal.ID, votePayload)
			CheckResponseCode(t, http.StatusCreated, response.Code)

			response = otu.GetProposalByIdAPI(createdCommunity.ID, createdProposal.ID)
			checkResponseCode(t, http.StatusOK, response.Code)

			cancelPayload := otu.GenerateClosedProposalPayload("account")

			response = otu.UpdateProposalAPI(createdProposal.ID, cancelPayload)
			checkResponseCode(t, http.StatusOK, response.Code)
		}

		response := otu.GetCommunityUserProposalsAPIWithFilter(utils.AdminAddr, "profile-votes")
		checkResponseCode(t, http.StatusOK, response.Code)

		var p test_utils.PaginatedUserProposalsResponse
		json.Unmarshal(response.Body.Bytes(), &p)

		assert.Equal(t, "closed", *p.Data[0].Proposal.Status)
		assert.Equal(t, "closed", *p.Data[1].Proposal.Status)
		assert.Equal(t, "closed", *p.Data[2].Proposal.Status)
	})
}

func TestDeleteUserFromCommunity(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")

	communityStruct := otu.GenerateCommunityStruct("account", "dao")

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
