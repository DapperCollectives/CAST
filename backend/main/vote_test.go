package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"testing"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/stretchr/testify/assert"
)

/**************/
/*   Votes    */
/**************/

func TestGetVotes(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	clearTable("votes")
	communityId := otu.AddCommunities(1)[0]
	proposalId := otu.AddProposals(communityId, 1)[0]

	t.Run("Requesting votes for a proposal with none created should return a 200 and empty array", func(t *testing.T) {
		response := otu.GetVotesForProposalAPI(proposalId)

		CheckResponseCode(t, http.StatusOK, response.Code)

		var body shared.PaginatedResponse
		json.Unmarshal(response.Body.Bytes(), &body)

		assert.Equal(t, 0, body.Count)
	})

	t.Run("Should throw an error if vote for address doesnt exist", func(t *testing.T) {
		clearTable("votes")
		response := otu.GetVoteForProposalByAccountNameAPI(proposalId, "user1")

		CheckResponseCode(t, http.StatusNotFound, response.Code)

		var m map[string]string
		json.Unmarshal(response.Body.Bytes(), &m)
		assert.Equal(t, "Vote not found", m["error"])
	})

	t.Run("Should successfully return existing vote for address", func(t *testing.T) {
		clearTable("votes")
		voteCount := 1
		otu.AddVotes(1, voteCount)
		response := otu.GetVoteForProposalByAccountNameAPI(proposalId, "user1")

		checkResponseCode(t, http.StatusOK, response.Code)

		var vote models.VoteWithBalance
		json.Unmarshal(response.Body.Bytes(), &vote)

		assert.NotNil(t, vote.ID)
		assert.Equal(t, proposalId, vote.Proposal_id)
	})

	t.Run("Should successfully return existing votes for proposal", func(t *testing.T) {
		clearTable("votes")
		voteCount := 3
		otu.AddVotes(1, voteCount)
		req, _ := http.NewRequest("GET", "/proposals/"+strconv.Itoa(proposalId)+"/votes", nil)
		response := executeRequest(req)

		checkResponseCode(t, http.StatusOK, response.Code)

		var body shared.PaginatedResponse
		json.Unmarshal(response.Body.Bytes(), &body)

		assert.Equal(t, voteCount, body.Count)
	})
}

func TestCreateVote(t *testing.T) {

	t.Run("should successfully create a vote", func(t *testing.T) {
		clearTable("communities")
		clearTable("community_users")
		clearTable("proposals")
		clearTable("votes")
		communityId := otu.AddCommunities(1)[0]
		proposalId := otu.AddActiveProposals(communityId, 1)[0]
		voteChoice := "a"

		votePayload := otu.GenerateValidVotePayload("user1", proposalId, voteChoice)

		response := otu.CreateVoteAPI(proposalId, votePayload)
		CheckResponseCode(t, http.StatusCreated, response.Code)

		response = otu.GetVoteForProposalByAccountNameAPI(proposalId, "user1")
		CheckResponseCode(t, http.StatusOK, response.Code)

		var createdVote models.Vote
		json.Unmarshal(response.Body.Bytes(), &createdVote)

		// assert.Equal(t, "user1", createdVote.Addr)
		assert.Equal(t, voteChoice, createdVote.Choice)
		assert.Equal(t, proposalId, createdVote.Proposal_id)
		assert.Equal(t, 1, createdVote.ID)
	})
}

func TestCreateNFTVote(t *testing.T) {
	t.Run("should successfully create a vote for balance-of-nft strategy", func(t *testing.T) {
		clearTable("communities")
		clearTable("community_users")
		clearTable("proposals")
		clearTable("votes")

		communityId, _ := otu.AddCommunitiesWithNFTContract(1, "user1")
		proposalId := otu.AddProposalsForStrategy(communityId[0], "balance-of-nfts", 1)[0]
		voteChoice := "a"

		votePayload := otu.GenerateValidVotePayload("user1", proposalId, voteChoice)

		response := otu.CreateVoteAPI(proposalId, votePayload)
		CheckResponseCode(t, http.StatusCreated, response.Code)

		response = otu.GetVoteForProposalByAccountNameAPI(proposalId, "user1")
		CheckResponseCode(t, http.StatusOK, response.Code)

		var createdVote models.Vote
		json.Unmarshal(response.Body.Bytes(), &createdVote)

		// assert.Equal(t, "user1", createdVote.Addr)
		assert.Equal(t, voteChoice, createdVote.Choice)
		assert.Equal(t, proposalId, createdVote.Proposal_id)
		assert.Equal(t, 1, createdVote.ID)
	})
}
