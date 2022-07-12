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
	clearTable("user_achievements")
	clearTable("proposals")
	clearTable("votes")

	communityId := otu.AddCommunities(1)[0]

	expectedUsers := 2
	expectedProposals := 2

	// users get single vote for each proposal they voted on
	expectedScore := expectedProposals

	otu.GenerateVotes(communityId, expectedProposals, expectedUsers)

	// Remove all achievements to test base case for scoring
	clearTable("user_achievements")

	response := otu.GetCommunityLeaderboardAPI(communityId)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response.Body.Bytes(), &p)

	receivedUser1Score := p.Data[0].Score
	receivedUser2Score := p.Data[0].Score

	assert.Equal(t, expectedUsers, len(p.Data))
	assert.Equal(t, expectedScore, receivedUser1Score)
	assert.Equal(t, expectedScore, receivedUser2Score)
}

func TestGetCommunityLeaderboardWithEarlyVotes(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("user_achievements")
	clearTable("proposals")
	clearTable("votes")

	communityId := otu.AddCommunities(1)[0]
	earlyVoteBonus := 1
	expectedUsers := 1
	expectedProposals := 2

	// user gets single vote for each proposal they voted on
	expectedScore := expectedProposals + (expectedProposals * earlyVoteBonus)

	otu.GenerateEarlyVoteAchievements(communityId, expectedProposals, expectedUsers)

	response := otu.GetCommunityLeaderboardAPI(communityId)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response.Body.Bytes(), &p)

	receivedScore := p.Data[0].Score

	assert.Equal(t, expectedUsers, len(p.Data))
	assert.Equal(t, expectedScore, receivedScore)
}

func TestGetCommunityLeaderboardWithSingleStreak(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("user_achievements")
	clearTable("proposals")
	clearTable("votes")

	communityId := otu.AddCommunities(1)[0]
	streaks := []int{3, 4}
	streakBonus := 1
	expectedUsers := 2
	expectedUser1Score := 3 + (1 * streakBonus)
	expectedUser2Score := 4 + (1 * streakBonus)

	otu.GenerateSingleStreakAchievements(communityId, streaks)

	response := otu.GetCommunityLeaderboardAPI(communityId)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response.Body.Bytes(), &p)

	receivedUser1Score := p.Data[1].Score
	receivedUser2Score := p.Data[0].Score

	assert.Equal(t, expectedUsers, len(p.Data))
	assert.Equal(t, expectedUser1Score, receivedUser1Score)
	assert.Equal(t, expectedUser2Score, receivedUser2Score)
}

func TestGetCommunityLeaderboardWithMultiStreaks(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("user_achievements")
	clearTable("proposals")
	clearTable("votes")
	communityId := otu.AddCommunities(1)[0]
	streaks := []int{3, 4}
	streakBonus := 1
	expectedUsers := 1

	// user with 7 votes and 2 streaks
	expectedUser1Score := 7 + (2 * streakBonus)

	otu.GenerateMultiStreakAchievements(communityId, streaks)

	response := otu.GetCommunityLeaderboardAPI(communityId)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response.Body.Bytes(), &p)

	receivedUser1Score := p.Data[0].Score

	assert.Equal(t, expectedUsers, len(p.Data))
	assert.Equal(t, expectedUser1Score, receivedUser1Score)
}

func TestGetLeaderboardDefaultPaging(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("user_achievements")
	clearTable("proposals")
	clearTable("votes")

	communityId := otu.AddCommunities(1)[0]

	numUsers := 6
	numProposals := 1

	otu.GenerateVotes(communityId, numProposals, numUsers)

	response := otu.GetCommunityLeaderboardAPI(communityId)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response.Body.Bytes(), &p)

	expectedLength := 6
	assert.Equal(t, expectedLength, len(p.Data))
}

func TestGetLeaderboardPaging(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("user_achievements")
	clearTable("proposals")
	clearTable("votes")

	communityId := otu.AddCommunities(1)[0]

	numUsers := 6
	numProposals := 1

	otu.GenerateVotes(communityId, numProposals, numUsers)

	count := 3

	// First Page
	response1 := otu.GetCommunityLeaderboardAPIWithPaging(communityId, 0, count)
	checkResponseCode(t, http.StatusOK, response1.Code)

	var p1 test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response1.Body.Bytes(), &p1)

	// Second Page
	response2 := otu.GetCommunityLeaderboardAPIWithPaging(communityId, 1, count)
	checkResponseCode(t, http.StatusOK, response2.Code)

	var p2 test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response2.Body.Bytes(), &p2)

	// Invalid Page
	response3 := otu.GetCommunityLeaderboardAPIWithPaging(communityId, 3, count)
	checkResponseCode(t, http.StatusOK, response3.Code)

	var p3 test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response2.Body.Bytes(), &p3)

	expectedLength := 3
	assert.Equal(t, expectedLength, len(p1.Data))
	assert.Equal(t, expectedLength, len(p2.Data))
	assert.Equal(t, expectedLength, len(p3.Data))
}
