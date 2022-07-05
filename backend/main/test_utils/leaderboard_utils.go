package test_utils

func (otu *OverflowTestUtils) GenerateLeaderboardBaseCase(communityId int) {
	proposalIds := otu.AddActiveProposals(communityId, 3)
	voteChoice := "a"

	otu.CreateVoteAPI(proposalIds[0], otu.GenerateValidVotePayload("user1", proposalIds[0], voteChoice))
	otu.CreateVoteAPI(proposalIds[1], otu.GenerateValidVotePayload("user1", proposalIds[1], voteChoice))
	otu.CreateVoteAPI(proposalIds[2], otu.GenerateValidVotePayload("user1", proposalIds[2], voteChoice))
	otu.CreateVoteAPI(proposalIds[0], otu.GenerateValidVotePayload("user2", proposalIds[0], voteChoice))
	otu.CreateVoteAPI(proposalIds[1], otu.GenerateValidVotePayload("user2", proposalIds[1], voteChoice))
}

func (otu *OverflowTestUtils) GenerateLeaderboardWithEarlyVotes(communityId int) {
	proposalIds := otu.AddActiveProposalsWithStartTimeNow(communityId, 2)
	voteChoice := "a"

	otu.CreateVoteAPI(proposalIds[0], otu.GenerateValidVotePayload("user1", proposalIds[0], voteChoice))
	otu.CreateVoteAPI(proposalIds[1], otu.GenerateValidVotePayload("user1", proposalIds[1], voteChoice))
	otu.CreateVoteAPI(proposalIds[0], otu.GenerateValidVotePayload("user2", proposalIds[0], voteChoice))
}

func (otu *OverflowTestUtils) GenerateLeaderboardWithSingleStreaks(communityId int) {
	proposalIds := otu.AddActiveProposals(communityId, 4)
	voteChoice := "a"

	// single streak length of 3
	otu.CreateVoteAPI(proposalIds[0], otu.GenerateValidVotePayload("user1", proposalIds[0], voteChoice))
	otu.CreateVoteAPI(proposalIds[1], otu.GenerateValidVotePayload("user1", proposalIds[1], voteChoice))
	otu.CreateVoteAPI(proposalIds[2], otu.GenerateValidVotePayload("user1", proposalIds[2], voteChoice))

	// single streak length of 4
	otu.CreateVoteAPI(proposalIds[0], otu.GenerateValidVotePayload("user2", proposalIds[0], voteChoice))
	otu.CreateVoteAPI(proposalIds[1], otu.GenerateValidVotePayload("user2", proposalIds[1], voteChoice))
	otu.CreateVoteAPI(proposalIds[2], otu.GenerateValidVotePayload("user2", proposalIds[2], voteChoice))
	otu.CreateVoteAPI(proposalIds[3], otu.GenerateValidVotePayload("user2", proposalIds[3], voteChoice))
}

func (otu *OverflowTestUtils) GenerateLeaderboardWithMultiStreaks(communityId int) {
	proposalIds := otu.AddActiveProposals(communityId, 8)
	voteChoice := "a"

	// First Streak
	otu.CreateVoteAPI(proposalIds[0], otu.GenerateValidVotePayload("user1", proposalIds[0], voteChoice))
	otu.CreateVoteAPI(proposalIds[1], otu.GenerateValidVotePayload("user1", proposalIds[1], voteChoice))
	otu.CreateVoteAPI(proposalIds[2], otu.GenerateValidVotePayload("user1", proposalIds[2], voteChoice))

	// Second Streak
	otu.CreateVoteAPI(proposalIds[5], otu.GenerateValidVotePayload("user1", proposalIds[5], voteChoice))
	otu.CreateVoteAPI(proposalIds[6], otu.GenerateValidVotePayload("user1", proposalIds[6], voteChoice))
	otu.CreateVoteAPI(proposalIds[7], otu.GenerateValidVotePayload("user1", proposalIds[7], voteChoice))
}
