package main

import (
	"encoding/json"
	"math"
	"net/http"
	"testing"

	"github.com/brudfyi/flow-voting-tool/main/models"
	"github.com/brudfyi/flow-voting-tool/main/shared"
	utils "github.com/brudfyi/flow-voting-tool/main/test_utils"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
)

func TestTokenWeightedDefaultStrategy(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	clearTable("votes")
	clearTable("balances")

	communityId := otu.AddCommunities(1)[0]
	proposalId := otu.AddProposalsForStrategy(communityId, "token-weighted-default", 1)[0]
	votes := otu.GenerateListOfVotes(proposalId, 10)

	otu.AddDummyVotesAndBalances(votes)

	t.Run("Test Tallying Results", func(t *testing.T) {
		// Tally results
		_results := otu.TallyResultsForTokenWeightedDefault(proposalId, votes)

		// Fetch Proposal Results
		response := otu.GetProposalResultsAPI(proposalId)
		CheckResponseCode(t, http.StatusOK, response.Code)

		var results models.ProposalResults
		json.Unmarshal(response.Body.Bytes(), &results)

		assert.Equal(t, _results.Proposal_id, results.Proposal_id)
		assert.Equal(t, _results.Results_float["a"], results.Results_float["a"])
		assert.Equal(t, _results.Results_float["b"], results.Results_float["b"])
	})

	t.Run("Test Fetching Votes for Proposal", func(t *testing.T) {
		response := otu.GetVotesForProposalAPI(proposalId)

		CheckResponseCode(t, http.StatusOK, response.Code)

		var body utils.PaginatedResponseWithVotes
		json.Unmarshal(response.Body.Bytes(), &body)

		// Validate vote weights are returned correctly
		for i, v := range body.Data {
			_vote := (*votes)[i]
			expectedWeight := float64(_vote.Primary_account_balance) * math.Pow(10, -8)
			assert.Equal(t, &expectedWeight, v.Weight)
		}
	})

	t.Run("Test Fetching Vote for Address", func(t *testing.T) {
		_vote := (*votes)[0]
		response := otu.GetVoteForProposalByAddressAPI(proposalId, _vote.Addr)

		CheckResponseCode(t, http.StatusOK, response.Code)

		var vote models.VoteWithBalance
		json.Unmarshal(response.Body.Bytes(), &vote)

		_expectedWeight := float64(_vote.Primary_account_balance) * math.Pow(10, -8)
		assert.Equal(t, _expectedWeight, *vote.Weight)
	})

	t.Run("Test Fetching Votes For Address", func(t *testing.T) {
		_vote := (*votes)[0]
		proposalIdTwo := otu.AddProposalsForStrategy(communityId, "token-weighted-default", 1)[0]
		proposalIds := []int{proposalId, proposalIdTwo}

		response := otu.GetVotesForAddressAPI(_vote.Addr, proposalIds)
		CheckResponseCode(t, http.StatusOK, response.Code)

		var votes []models.VoteWithBalance
		json.Unmarshal(response.Body.Bytes(), &votes)

		for _, v := range votes {
			_expectedWeight := float64(_vote.Primary_account_balance) * math.Pow(10, -8)
			assert.Equal(t, _expectedWeight, *v.Weight)
		}
	})
}

func TestBalanceOfNFTsStrategy(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	clearTable("votes")
	clearTable("balances")
	clearTable("nfts")

	otu.CreateNFTCollection("user1")

	communityId, community := otu.AddCommunitiesWithNFTContract(1, "user1")
	proposalId := otu.AddProposalsForStrategy(communityId[0], "balance-of-nfts", 1)[0]

	var contract = &shared.Contract{
		Name: community.Contract_name,
		Addr: community.Contract_addr,
	}

	votes, err := otu.GenerateListOfVotesWithNFTs(proposalId, 5, contract)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to generate list of votes")
	}

	otu.AddDummyVotesAndNFTs(votes)
	t.Run("Test Tallying Results For NFT Balance Strategy", func(t *testing.T) {

		_results := otu.TallyResultsForBalanceOfNfts(proposalId, votes)

		response := otu.GetProposalResultsAPI(proposalId)
		CheckResponseCode(t, http.StatusOK, response.Code)

		var results models.ProposalResults
		json.Unmarshal(response.Body.Bytes(), &results)

		assert.Equal(t, _results.Proposal_id, results.Proposal_id)
		assert.Equal(t, _results.Results_float["a"], results.Results_float["a"])
		assert.Equal(t, _results.Results_float["b"], results.Results_float["b"])
	})

	t.Run("Test Fetching Votes for Proposal", func(t *testing.T) {
		response := otu.GetVotesForProposalAPI(proposalId)

		CheckResponseCode(t, http.StatusOK, response.Code)

		var body utils.PaginatedResponseWithVotes
		json.Unmarshal(response.Body.Bytes(), &body)

		// Validate vote weights are returned correctly
		for _, v := range body.Data {
			expectedWeight := float64(1.00)
			assert.Equal(t, expectedWeight, *v.Weight)
		}
	})

	t.Run("Test Fetching Vote for Address", func(t *testing.T) {
		_vote := (*votes)[0]
		response := otu.GetVoteForProposalByAddressAPI(proposalId, _vote.Addr)

		CheckResponseCode(t, http.StatusOK, response.Code)

		var vote models.VoteWithBalance
		json.Unmarshal(response.Body.Bytes(), &vote)

		expectedWeight := float64(1.00)
		assert.Equal(t, expectedWeight, *vote.Weight)
	})
}

/* Token Weighted Default */
/* Staked Token Weighted Default */
func TestStakedTokenWeightedDefaultStrategy(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	clearTable("votes")
	clearTable("balances")

	communityId := otu.AddCommunities(1)[0]
	proposalId := otu.AddProposalsForStrategy(communityId, "staked-token-weighted-default", 1)[0]
	votes := otu.GenerateListOfVotes(proposalId, 10)
	otu.AddDummyVotesAndBalances(votes)

	t.Run("Test Tallying Results", func(t *testing.T) {
		// Tally results
		_results := otu.TallyResultsForStakedTokenWeightedDefault(proposalId, votes)

		// Fetch Proposal Results
		response := otu.GetProposalResultsAPI(proposalId)
		CheckResponseCode(t, http.StatusOK, response.Code)

		var results models.ProposalResults
		json.Unmarshal(response.Body.Bytes(), &results)

		assert.Equal(t, _results.Proposal_id, results.Proposal_id)
		assert.Equal(t, _results.Results_float["a"], results.Results_float["a"])
		assert.Equal(t, _results.Results_float["b"], results.Results_float["b"])
	})

	t.Run("Test Fetching Votes for Proposal", func(t *testing.T) {
		response := otu.GetVotesForProposalAPI(proposalId)

		CheckResponseCode(t, http.StatusOK, response.Code)

		var body utils.PaginatedResponseWithVotes
		json.Unmarshal(response.Body.Bytes(), &body)

		// Validate vote weights are returned correctly
		for i, v := range body.Data {
			_vote := (*votes)[i]
			expectedWeight := float64(_vote.Staking_balance) * math.Pow(10, -8)
			assert.Equal(t, expectedWeight, *v.Weight)
		}
	})

	t.Run("Test Fetching Vote for Address", func(t *testing.T) {
		_vote := (*votes)[0]
		response := otu.GetVoteForProposalByAddressAPI(proposalId, _vote.Addr)

		CheckResponseCode(t, http.StatusOK, response.Code)

		var vote models.VoteWithBalance
		json.Unmarshal(response.Body.Bytes(), &vote)

		_expectedWeight := float64(_vote.Staking_balance) * math.Pow(10, -8)
		assert.Equal(t, _expectedWeight, *vote.Weight)
	})

	t.Run("Test Fetching Votes For Address", func(t *testing.T) {
		_vote := (*votes)[0]
		proposalIdTwo := otu.AddProposalsForStrategy(communityId, "staked-token-weighted-default", 1)[0]
		proposalIds := []int{proposalId, proposalIdTwo}

		response := otu.GetVotesForAddressAPI(_vote.Addr, proposalIds)
		CheckResponseCode(t, http.StatusOK, response.Code)

		var votes []models.VoteWithBalance
		json.Unmarshal(response.Body.Bytes(), &votes)

		for _, v := range votes {
			_expectedWeight := float64(_vote.Staking_balance) * math.Pow(10, -8)
			assert.Equal(t, _expectedWeight, *v.Weight)
		}
	})
}

/* One Token One Vote */
func TestOneTokenOneVoteStrategy(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	clearTable("votes")
	clearTable("balances")

	communityId := otu.AddCommunities(1)[0]
	proposalId := otu.AddProposalsForStrategy(communityId, "one-address-one-vote", 1)[0]
	votes := otu.GenerateListOfVotes(proposalId, 10)
	otu.AddDummyVotesAndBalances(votes)

	t.Run("Test Tallying Results", func(t *testing.T) {
		//Tally Results
		_results := otu.TallyResultsForOneAddressOneVote(proposalId, votes)

		// Fetch Proposal Results
		response := otu.GetProposalResultsAPI(proposalId)
		CheckResponseCode(t, http.StatusOK, response.Code)

		var results models.ProposalResults
		json.Unmarshal(response.Body.Bytes(), &results)

		assert.Equal(t, _results.Proposal_id, results.Proposal_id)
		assert.Equal(t, _results.Results["a"], results.Results["a"])
		assert.Equal(t, _results.Results["b"], results.Results["b"])
	})

	t.Run("Test Fetching Votes for Proposal", func(t *testing.T) {
		response := otu.GetVotesForProposalAPI(proposalId)

		CheckResponseCode(t, http.StatusOK, response.Code)

		var body utils.PaginatedResponseWithVotes
		json.Unmarshal(response.Body.Bytes(), &body)

		// Validate vote weights are returned correctly
		for _, v := range body.Data {
			expectedWeight := float64(1.00)
			assert.Equal(t, expectedWeight, *v.Weight)
		}
	})

	t.Run("Test Fetching Vote for Address", func(t *testing.T) {
		_vote := (*votes)[0]
		response := otu.GetVoteForProposalByAddressAPI(proposalId, _vote.Addr)

		CheckResponseCode(t, http.StatusOK, response.Code)

		var vote models.VoteWithBalance
		json.Unmarshal(response.Body.Bytes(), &vote)

		expectedWeight := float64(1.00)
		assert.Equal(t, expectedWeight, *vote.Weight)
	})

	t.Run("Test Fetching Votes for Address", func(t *testing.T) {
		_vote := (*votes)[0]
		proposalIdTwo := otu.AddProposalsForStrategy(communityId, "one-address-one-vote", 1)[0]
		proposalIds := []int{proposalId, proposalIdTwo}
		response := otu.GetVotesForAddressAPI(_vote.Addr, proposalIds)

		CheckResponseCode(t, http.StatusOK, response.Code)

		var votes []models.VoteWithBalance
		json.Unmarshal(response.Body.Bytes(), &votes)

		for _, v := range votes {
			expectedWeight := float64(1.00)
			assert.Equal(t, expectedWeight, *v.Weight)
		}
	})
}
