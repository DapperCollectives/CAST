package main

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/DapperCollectives/CAST/backend/main/test_utils"
	"github.com/stretchr/testify/assert"
)

func TestGetCommunityLeaderboard(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("community_users_achievements")
	clearTable("proposals")
	clearTable("votes")

	communityId := otu.AddCommunities(1)[0]
	proposalIds := otu.AddActiveProposals(communityId, 3)
	voteChoice := "a"

	otu.CreateVoteAPI(proposalIds[0], otu.GenerateValidVotePayload("user1", proposalIds[0], voteChoice))
	otu.CreateVoteAPI(proposalIds[1], otu.GenerateValidVotePayload("user1", proposalIds[1], voteChoice))
	otu.CreateVoteAPI(proposalIds[2], otu.GenerateValidVotePayload("user1", proposalIds[2], voteChoice))
	otu.CreateVoteAPI(proposalIds[0], otu.GenerateValidVotePayload("user2", proposalIds[0], voteChoice))
	otu.CreateVoteAPI(proposalIds[1], otu.GenerateValidVotePayload("user2", proposalIds[1], voteChoice))

	// Remove all achievements to test base case for scoring
	clearTable("community_users_achievements")

	response := otu.GetCommunityLeaderboardAPI(communityId)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response.Body.Bytes(), &p)

	assert.Equal(t, 2, len(p.Data))
	assert.Equal(t, 3, p.Data[0].Score)
	assert.Equal(t, 2, p.Data[1].Score)
}

func TestGetCommunityLeaderboardWithEarlyVotes(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("community_users_achievements")
	clearTable("proposals")
	clearTable("votes")

	communityId := otu.AddCommunities(1)[0]
	proposalIds := otu.AddActiveProposalsWithStartTimeNow(communityId, 3)
	voteChoice := "a"
	earlyVoteBonus := 1

	otu.CreateVoteAPI(proposalIds[0], otu.GenerateValidVotePayload("user1", proposalIds[0], voteChoice))
	otu.CreateVoteAPI(proposalIds[1], otu.GenerateValidVotePayload("user1", proposalIds[1], voteChoice))
	otu.CreateVoteAPI(proposalIds[2], otu.GenerateValidVotePayload("user1", proposalIds[2], voteChoice))
	otu.CreateVoteAPI(proposalIds[0], otu.GenerateValidVotePayload("user2", proposalIds[0], voteChoice))
	otu.CreateVoteAPI(proposalIds[1], otu.GenerateValidVotePayload("user2", proposalIds[1], voteChoice))

	response := otu.GetCommunityLeaderboardAPI(communityId)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response.Body.Bytes(), &p)

	assert.Equal(t, 2, len(p.Data))
	assert.Equal(t, 3+3*earlyVoteBonus, p.Data[0].Score)
	assert.Equal(t, 2+2*earlyVoteBonus, p.Data[1].Score)
}
