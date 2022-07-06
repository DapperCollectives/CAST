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
	proposalIds := otu.AddActiveProposalsWithStartTimeNow(communityId, 3)
	voteChoice := "a"

	otu.CreateVoteAPI(proposalIds[0], otu.GenerateValidVotePayload("user1", proposalIds[0], voteChoice))
	otu.CreateVoteAPI(proposalIds[1], otu.GenerateValidVotePayload("user1", proposalIds[1], voteChoice))
	otu.CreateVoteAPI(proposalIds[2], otu.GenerateValidVotePayload("user1", proposalIds[2], voteChoice))
	otu.CreateVoteAPI(proposalIds[0], otu.GenerateValidVotePayload("user2", proposalIds[0], voteChoice))
	otu.CreateVoteAPI(proposalIds[1], otu.GenerateValidVotePayload("user2", proposalIds[1], voteChoice))
}
