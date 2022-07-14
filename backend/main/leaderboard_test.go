package main

import (
	"encoding/json"
	"net/http"
	"sort"
	"testing"
	"time"

	"github.com/DapperCollectives/CAST/backend/main/test_utils"
	"github.com/stretchr/testify/assert"
)

func TestGetLeaderboard(t *testing.T) {
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

func TestGetLeaderboardWithEarlyVotes(t *testing.T) {
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

func TestGetLeaderboardWithSingleStreak(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("user_achievements")
	clearTable("proposals")
	clearTable("votes")

	communityId := otu.AddCommunities(1)[0]
	streaks := []int{3, 4}
	streakBonus := 1
	expectedUsers := 2
	expectedScoreA := streaks[0] + (1 * streakBonus)
	expectedScoreB := streaks[1] + (1 * streakBonus)

	otu.GenerateSingleStreakAchievements(communityId, streaks)

	response := otu.GetCommunityLeaderboardAPI(communityId)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response.Body.Bytes(), &p)

	// ensure scores ordered for assert
	sort.Slice(p.Data, func(i, j int) bool {
		return p.Data[i].Score < p.Data[j].Score
	})

	receivedScoreA := p.Data[0].Score
	receivedScoreB := p.Data[1].Score

	assert.Equal(t, expectedUsers, len(p.Data))
	assert.Equal(t, expectedScoreA, receivedScoreA)
	assert.Equal(t, expectedScoreB, receivedScoreB)
}

func TestGetLeaderboardWithMultiStreaks(t *testing.T) {
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

func TestGetLeaderboardWithWinningVote(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("user_achievements")
	clearTable("proposals")
	clearTable("proposal_results")
	clearTable("votes")
	communityId := otu.AddCommunities(1)[0]
	winningVoteBonus := 1

	proposalId := otu.GenerateWinningVoteAchievement(communityId, "one-address-one-vote")
	otu.UpdateProposalEndTime(proposalId, time.Now().UTC())
	otu.GetProposalResultsAPI(proposalId)

	response := otu.GetCommunityLeaderboardAPI(communityId)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response.Body.Bytes(), &p)

	winningUserScore := 1 + 1*winningVoteBonus
	losingUserScore := 1

	receivedWinners := 0
	receivedLosers := 0

	for _, user := range p.Data {
		if user.Score == winningUserScore {
			receivedWinners += 1
		} else if user.Score == losingUserScore {
			receivedLosers += 1
		}
	}

	expectedWinners := 3
	expectedLosers := 1

	assert.Equal(t, expectedWinners, receivedWinners)
	assert.Equal(t, expectedLosers, receivedLosers)
}
