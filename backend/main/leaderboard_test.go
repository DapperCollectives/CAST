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
	clearTable("proposals")
	clearTable("votes")
	communityId := otu.AddCommunities(1)[0]
	proposalIdA := otu.AddActiveProposals(communityId, 1)[0]
	proposalIdB := otu.AddActiveProposals(communityId, 2)[0]
	proposalIdC := otu.AddActiveProposals(communityId, 3)[0]
	voteChoice := "a"

	otu.CreateVoteAPI(proposalIdA, otu.GenerateValidVotePayload("user1", proposalIdA, voteChoice))
	otu.CreateVoteAPI(proposalIdB, otu.GenerateValidVotePayload("user1", proposalIdB, voteChoice))
	otu.CreateVoteAPI(proposalIdC, otu.GenerateValidVotePayload("user1", proposalIdC, voteChoice))
	otu.CreateVoteAPI(proposalIdA, otu.GenerateValidVotePayload("user2", proposalIdA, voteChoice))
	otu.CreateVoteAPI(proposalIdB, otu.GenerateValidVotePayload("user2", proposalIdB, voteChoice))

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
	clearTable("proposals")
	clearTable("votes")
	communityId := otu.AddCommunities(1)[0]
	proposalIdA := otu.AddActiveProposals(communityId, 1)[0]
	proposalIdB := otu.AddActiveProposals(communityId, 2)[0]
	proposalIdC := otu.AddActiveProposals(communityId, 3)[0]
	voteChoice := "a"
	earlyVoteBonus := 1

	otu.CreateVoteAPI(proposalIdA, otu.GenerateValidVotePayload("user1", proposalIdA, voteChoice))
	otu.CreateVoteAPI(proposalIdB, otu.GenerateValidVotePayload("user1", proposalIdB, voteChoice))
	otu.CreateVoteAPI(proposalIdC, otu.GenerateValidVotePayload("user1", proposalIdC, voteChoice))
	otu.CreateVoteAPI(proposalIdA, otu.GenerateValidVotePayload("user2", proposalIdA, voteChoice))
	otu.CreateVoteAPI(proposalIdB, otu.GenerateValidVotePayload("user2", proposalIdB, voteChoice))

	response := otu.GetCommunityLeaderboardAPI(communityId)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response.Body.Bytes(), &p)

	assert.Equal(t, 2, len(p.Data))
	assert.Equal(t, 3+3*earlyVoteBonus, p.Data[0].Score)
	assert.Equal(t, 2+2*earlyVoteBonus, p.Data[1].Score)
}