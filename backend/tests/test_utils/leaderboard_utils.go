package test_utils

import (
	"strconv"
)

func (otu *OverflowTestUtils) GenerateVotes(communityId int, numProposals int, numUsers int) {
	if numProposals == 0 {
		panic("0 invalid value for numProposals")
	}
	if numUsers == 0 {
		panic("0 invalid value for numUsers")
	}

	proposalIds := otu.AddActiveProposals(communityId, numProposals)
	voteChoiceId := 0

	for _, id := range proposalIds {
		for i := 1; i <= numUsers; i++ {
			otu.CreateVoteAPI(id, otu.GenerateValidVotePayload("user"+strconv.Itoa(i), id, voteChoiceId))
		}
	}
}

func (otu *OverflowTestUtils) GenerateEarlyVoteAchievements(communityId int, numProposals int, numUsers int) []int {
	if numProposals == 0 {
		panic("0 invalid value for numProposals")
	}
	if numUsers == 0 {
		panic("0 invalid value for numUsers")
	}

	proposalIds := otu.AddActiveProposalsWithStartTimeNow(communityId, numProposals)
	voteChoiceId := 0

	for _, id := range proposalIds {
		for i := 1; i <= numUsers; i++ {
			otu.CreateVoteAPI(id, otu.GenerateValidVotePayload("user"+strconv.Itoa(i), id, voteChoiceId))
		}
	}

	return proposalIds
}

func (otu *OverflowTestUtils) GenerateSingleStreakAchievements(communityId int, streakLengths []int) {
	if len(streakLengths) == 0 {
		panic("Must have at least one streak length")
	}

	proposalIds := otu.AddActiveProposals(communityId, max(streakLengths))
	voteChoiceId := 0

	for i, l := range streakLengths {
		for j := 0; j < l; j++ {
			otu.CreateVoteAPI(proposalIds[j], otu.GenerateValidVotePayload("user"+strconv.Itoa(i+1), proposalIds[j], voteChoiceId))
		}
	}
}

func (otu *OverflowTestUtils) GenerateMultiStreakAchievements(communityId int, streakLengths []int) {
	if len(streakLengths) < 2 {
		panic("Must have at least two streak lengths")
	}

	// create enough proposals for streak lengths and gaps to create multiple separate streaks
	numProposals := max(streakLengths)*len(streakLengths) + len(streakLengths)
	proposalIds := otu.AddActiveProposals(communityId, numProposals)
	voteChoiceId := 0

	i := 0
	for _, l := range streakLengths {
		for j := 0; j < l; j++ {
			otu.CreateVoteAPI(proposalIds[i], otu.GenerateValidVotePayload("user1", proposalIds[i], voteChoiceId))
			i++
		}
		i++ // skip a proposal to start next streak
	}
}

func (otu *OverflowTestUtils) GenerateWinningVoteAchievement(communityId int, strategy string) int {
	proposalIds, _ := otu.AddProposalsForStrategy(communityId, strategy, 1)
	proposalId := proposalIds[0]
	winningChoiceId := 0
	losingChoiceId := 1

	otu.CreateVoteAPI(proposalId, otu.GenerateValidVotePayload("user1", proposalId, losingChoiceId))
	otu.CreateVoteAPI(proposalId, otu.GenerateValidVotePayload("user2", proposalId, winningChoiceId))
	otu.CreateVoteAPI(proposalId, otu.GenerateValidVotePayload("user3", proposalId, winningChoiceId))
	otu.CreateVoteAPI(proposalId, otu.GenerateValidVotePayload("user4", proposalId, winningChoiceId))

	return proposalId
}

func max(s []int) int {
	var m int
	for i, v := range s {
		if i == 0 || v > m {
			m = v
		}
	}
	return m
}
