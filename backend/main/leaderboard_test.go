package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"testing"
	"time"

	"github.com/DapperCollectives/CAST/backend/main/test_utils"
	"github.com/stretchr/testify/assert"
)

func TestGetLeaderboard(t *testing.T) {
	fmt.Printf("TestGetLeaderboard")

	clearTable("communities")
	clearTable("community_users")
	clearTable("user_achievements")
	clearTable("proposals")
	clearTable("votes")

	communityId := otu.AddCommunities(1)[0]
	fmt.Printf("communityId: %d\n", communityId)

	expectedUsers := 2
	expectedProposals := 2

	// users get single vote for each proposal they voted on
	expectedScore := expectedProposals

	otu.GenerateVotes(communityId, expectedProposals, expectedUsers)
	fmt.Printf("Generated Votes")

	// Remove all achievements to test base case for scoring
	clearTable("user_achievements")

	response := otu.GetCommunityLeaderboardAPI(communityId)
	fmt.Printf("Response %+v", response.Body)
	checkResponseCode(t, http.StatusOK, response.Code)

	var p test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response.Body.Bytes(), &p)

	receivedUser1Score := p.Data[0].Score
	receivedUser2Score := p.Data[0].Score

	fmt.Printf("p %+v", p)

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

	otu.AddActiveProposals(communityId, 1)

	count := 3

	// Leaderboard with no users because no votes yet
	response1 := otu.GetCommunityLeaderboardAPIWithPaging(communityId, 0, count)
	checkResponseCode(t, http.StatusOK, response1.Code)

	var p1 test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response1.Body.Bytes(), &p1)

	numUsers := 6
	numProposals := 1

	otu.GenerateVotes(communityId, numProposals, numUsers)

	// First Page
	response2 := otu.GetCommunityLeaderboardAPIWithPaging(communityId, 0, count)
	checkResponseCode(t, http.StatusOK, response2.Code)

	var p2 test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response2.Body.Bytes(), &p2)

	// Second Page
	response3 := otu.GetCommunityLeaderboardAPIWithPaging(communityId, 1, count)
	checkResponseCode(t, http.StatusOK, response3.Code)

	var p3 test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response3.Body.Bytes(), &p3)

	// Invalid Page
	response4 := otu.GetCommunityLeaderboardAPIWithPaging(communityId, 3, count)
	checkResponseCode(t, http.StatusOK, response4.Code)

	var p4 test_utils.PaginatedResponseWithLeaderboardUser
	json.Unmarshal(response4.Body.Bytes(), &p4)

	expectedNoUsersLength := 0
	expectedLength := 3
	assert.Equal(t, expectedNoUsersLength, len(p1.Data))
	assert.Equal(t, expectedLength, len(p2.Data))
	assert.Equal(t, expectedLength, len(p3.Data))
	assert.Equal(t, expectedLength, len(p4.Data))
}
