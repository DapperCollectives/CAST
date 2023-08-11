package main

import (
	"encoding/json"
	"math"
	"net/http"
	"testing"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/DapperCollectives/CAST/backend/main/strategies"
	utils "github.com/DapperCollectives/CAST/backend/tests/test_utils"
	"github.com/stretchr/testify/assert"
)

type Strategy interface {
	TallyVotes(votes []*models.VoteWithBalance, proposal *models.Proposal) (models.ProposalResults, error)
	GetVotes(votes []*models.VoteWithBalance, proposal *models.Proposal) ([]*models.VoteWithBalance, error)
	GetVoteWeightForBalance(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error)
	InitStrategy(f *shared.FlowAdapter, db *shared.Database, dps *shared.DpsAdapter)
	FetchBalance(b *models.Balance, p *models.Proposal) (*models.Balance, error)
}

var strategyMap = map[string]Strategy{
	"token-weighted-default":        &strategies.TokenWeightedDefault{},
	"staked-token-weighted-default": &strategies.StakedTokenWeightedDefault{},
	"one-address-one-vote":          &strategies.OneAddressOneVote{},
	"balance-of-nfts":               &strategies.BalanceOfNfts{},
	"float-nfts":                    &strategies.FloatNFTs{},
	"custom-script":                 &strategies.CustomScript{},
}

/* Token Weighted Default */
func TestTokenWeightedDefaultStrategy(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	clearTable("votes")
	clearTable("balances")

	communityId := otu.AddCommunities(1, "dao")[0]
	proposalIds, proposals := otu.AddProposalsForStrategy(communityId, "token-weighted-default", 2)
	votes := otu.GenerateListOfVotes(proposalIds[0], 10)
	proposalId := proposalIds[0]
	proposalIdTwo := proposalIds[1]

	err := otu.AddDummyVotesAndBalances(votes)
	if err != nil {
		t.Errorf("Error adding votes and balances: %s", err)
	}

	t.Run("Test Tallying Results", func(t *testing.T) {
		// Tally results
		strategyName := "token-weighted-default"

		s := strategyMap[strategyName]
		_results, err := s.TallyVotes(votes, proposals[0])
		if err != nil {
			t.Errorf("Error tallying votes: %v", err)
		}

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
			_vote := (votes)[i]
			expectedWeight := float64(*_vote.PrimaryAccountBalance) * math.Pow(10, -8)
			assert.Equal(t, expectedWeight, *v.Weight)
		}
	})

	t.Run("Test Fetching Vote for Address", func(t *testing.T) {
		_vote := (votes)[0]
		response := otu.GetVoteForProposalByAddressAPI(proposalId, _vote.Addr)

		CheckResponseCode(t, http.StatusOK, response.Code)

		var vote models.VoteWithBalance
		json.Unmarshal(response.Body.Bytes(), &vote)

		_expectedWeight := float64(*_vote.PrimaryAccountBalance) * math.Pow(10, -8)
		assert.Equal(t, _expectedWeight, *vote.Weight)
	})

	t.Run("Test Fetching Votes For Address", func(t *testing.T) {
		_vote := (votes)[0]
		proposalIds := []int{proposalId, proposalIdTwo}

		response := otu.GetVotesForAddressAPI(_vote.Addr, proposalIds)
		CheckResponseCode(t, http.StatusOK, response.Code)

		var votes []models.VoteWithBalance
		json.Unmarshal(response.Body.Bytes(), &votes)

		for _, v := range votes {
			_expectedWeight := float64(*_vote.PrimaryAccountBalance) * math.Pow(10, -8)
			assert.Equal(t, _expectedWeight, *v.Weight)
		}
	})
}

/* Balance of NFT */
func TestBalanceOfNFTsStrategy(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	clearTable("votes")
	clearTable("balances")
	clearTable("nfts")

	communityId, community := otu.AddCommunitiesWithNFTContract(1, "user1")
	proposalIds, proposals := otu.AddProposalsForStrategy(communityId[0], "balance-of-nfts", 1)
	proposalId := proposalIds[0]

	var contract = &shared.Contract{
		Name:        community.Contract_name,
		Addr:        community.Contract_addr,
		Public_path: community.Public_path,
	}

	votes, err := otu.GenerateListOfVotesWithNFTs(proposalId, 5, contract)
	if err != nil {
		t.Error(err)
	}

	otu.AddDummyVotesAndNFTs(votes)
	t.Run("Test Tallying Results For NFT Balance Strategy", func(t *testing.T) {
		strategyName := "balance-of-nfts"

		s := strategyMap[strategyName]
		s.InitStrategy(otu.A.FlowAdapter, otu.A.DB, otu.A.DpsAdapter)
		_results, err := s.TallyVotes(votes, proposals[0])
		if err != nil {
			t.Errorf("Error tallying votes: %v", err)
		}

		response := otu.GetProposalResultsAPI(proposalId)
		CheckResponseCode(t, http.StatusOK, response.Code)

		var results models.ProposalResults
		json.Unmarshal(response.Body.Bytes(), &results)

		assert.Equal(t, _results.Results_float["a"], results.Results_float["a"])
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
		_vote := (votes)[0]
		response := otu.GetVoteForProposalByAddressAPI(proposalId, _vote.Addr)

		CheckResponseCode(t, http.StatusOK, response.Code)

		var vote models.VoteWithBalance
		json.Unmarshal(response.Body.Bytes(), &vote)

		expectedWeight := float64(1.00)
		assert.Equal(t, expectedWeight, *vote.Weight)
	})

	// t.Run("Attempt to cheat the NFT strategy", func(t *testing.T) {
	// 	proposalWithChoices := models.NewProposalResults(proposalId, choices)
	// 	_ = otu.TallyResultsForBalanceOfNfts(votes, proposalWithChoices)

	// 	response := otu.GetProposalResultsAPI(proposalId)
	// 	CheckResponseCode(t, http.StatusOK, response.Code)

	// 	var correctResults models.ProposalResults
	// 	json.Unmarshal(response.Body.Bytes(), &correctResults)

	// 	otu.SetupAccountForNFTs("user6")
	// 	otu.TransferNFT("user2", "user3", 1)

	// 	cheatVote, err := otu.GenerateSingleVoteWithNFT(proposalId, 3, contract)
	// 	if err != nil {
	// 		t.Error(err)
	// 	}
	// 	votesWithCheat := append(*votes, *cheatVote)
	// 	cheatResults := otu.TallyResultsForBalanceOfNfts(&votesWithCheat, proposalWithChoices)

	// 	response = otu.GetProposalResultsAPI(proposalId)
	// 	CheckResponseCode(t, http.StatusOK, response.Code)

	// 	json.Unmarshal(response.Body.Bytes(), &cheatResults)

	// 	//weight should be the same as before the cheat vote was added
	// 	//because the cheat vote should be ignored by the server
	// 	//therefor the cheatResults should be the same as the correctResults

	// 	assert.Equal(t, correctResults.Proposal_id, cheatResults.Proposal_id)
	// 	assert.Equal(t, correctResults.Results_float["a"], cheatResults.Results_float["a"])
	// 	assert.Equal(t, correctResults.Results_float["b"], cheatResults.Results_float["b"])
	// })
}

/* Staked Token Weighted Default */
func TestStakedTokenWeightedDefaultStrategy(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	clearTable("votes")
	clearTable("balances")

	communityId := otu.AddCommunities(1, "dao")[0]
	proposalIds, proposals := otu.AddProposalsForStrategy(communityId, "staked-token-weighted-default", 2)
	proposalIdTwo := proposalIds[1]
	proposalId := proposalIds[0]
	votes := otu.GenerateListOfVotes(proposalId, 10)
	otu.AddDummyVotesAndBalances(votes)

	t.Run("Test Tallying Results", func(t *testing.T) {
		// Tally results
		strategyName := "staked-token-weighted-default"

		s := strategyMap[strategyName]
		_results, err := s.TallyVotes(votes, proposals[0])
		if err != nil {
			t.Errorf("Error tallying votes: %v", err)
		}

		// Fetch Proposal Results
		response := otu.GetProposalResultsAPI(proposalId)
		CheckResponseCode(t, http.StatusOK, response.Code)

		var results models.ProposalResults
		json.Unmarshal(response.Body.Bytes(), &results)

		assert.Equal(t, _results, results)
	})

	t.Run("Test Fetching Votes for Proposal", func(t *testing.T) {
		response := otu.GetVotesForProposalAPI(proposalId)
		CheckResponseCode(t, http.StatusOK, response.Code)

		var body utils.PaginatedResponseWithVotes
		json.Unmarshal(response.Body.Bytes(), &body)

		// Validate vote weights are returned correctly
		for i, v := range body.Data {
			_vote := (votes)[i]
			expectedWeight := float64(*_vote.StakingBalance) * math.Pow(10, -8)
			assert.Equal(t, expectedWeight, *v.Weight)
		}
	})

	t.Run("Test Fetching Vote for Address", func(t *testing.T) {
		_vote := (votes)[0]
		response := otu.GetVoteForProposalByAddressAPI(proposalId, _vote.Addr)

		CheckResponseCode(t, http.StatusOK, response.Code)

		var vote models.VoteWithBalance
		json.Unmarshal(response.Body.Bytes(), &vote)

		_expectedWeight := float64(*_vote.StakingBalance) * math.Pow(10, -8)
		assert.Equal(t, _expectedWeight, *vote.Weight)
	})

	t.Run("Test Fetching Votes For Address", func(t *testing.T) {
		_vote := (votes)[0]
		proposalIds := []int{proposalId, proposalIdTwo}

		response := otu.GetVotesForAddressAPI(_vote.Addr, proposalIds)
		CheckResponseCode(t, http.StatusOK, response.Code)

		var votes []models.VoteWithBalance
		json.Unmarshal(response.Body.Bytes(), &votes)

		for _, v := range votes {
			_expectedWeight := float64(*_vote.StakingBalance) * math.Pow(10, -8)
			assert.Equal(t, _expectedWeight, *v.Weight)
		}
	})
}

/* One Token One Vote */
// func TestOneTokenOneVoteStrategy(t *testing.T) {
// 	clearTable("communities")
// 	clearTable("community_users")
// 	clearTable("proposals")
// 	clearTable("votes")
// 	clearTable("balances")

// 	communityId := otu.AddCommunities(1)[0]
// 	proposalIds, proposals := otu.AddProposalsForStrategy(communityId, "one-address-one-vote", 2)
// 	proposalIdTwo := proposalIds[1]
// 	proposalId := proposalIds[0]
// 	choices := proposals[0].Choices
// 	votes := otu.GenerateListOfVotes(proposalId, 10)
// 	otu.AddDummyVotesAndBalances(votes)

// 	t.Run("Test Tallying Results", func(t *testing.T) {
// 		//Tally Results
// 		proposalWithChoices := models.NewProposalResults(proposalId, choices)
// 		_results := otu.TallyResultsForOneAddressOneVote(votes, proposalWithChoices)

// 		// Fetch Proposal Results
// 		response := otu.GetProposalResultsAPI(proposalId)
// 		CheckResponseCode(t, http.StatusOK, response.Code)

// 		var results models.ProposalResults
// 		json.Unmarshal(response.Body.Bytes(), &results)

// 		assert.Equal(t, _results.Proposal_id, results.Proposal_id)
// 		assert.Equal(t, _results.Results["a"], results.Results["a"])
// 		assert.Equal(t, _results.Results["b"], results.Results["b"])
// 	})

// 	t.Run("Test Fetching Votes for Proposal", func(t *testing.T) {
// 		response := otu.GetVotesForProposalAPI(proposalId)

// 		CheckResponseCode(t, http.StatusOK, response.Code)

// 		var body utils.PaginatedResponseWithVotes
// 		json.Unmarshal(response.Body.Bytes(), &body)

// 		// Validate vote weights are returned correctly
// 		for _, v := range body.Data {
// 			expectedWeight := float64(1.00)
// 			assert.Equal(t, expectedWeight, *v.Weight)
// 		}
// 	})

// 	t.Run("Test Fetching Vote for Address", func(t *testing.T) {
// 		_vote := (*votes)[0]
// 		response := otu.GetVoteForProposalByAddressAPI(proposalId, _vote.Addr)

// 		CheckResponseCode(t, http.StatusOK, response.Code)

// 		var vote models.VoteWithBalance
// 		json.Unmarshal(response.Body.Bytes(), &vote)

// 		expectedWeight := float64(1.00)
// 		assert.Equal(t, expectedWeight, *vote.Weight)
// 	})

// 	t.Run("Test Fetching Votes for Address", func(t *testing.T) {
// 		_vote := (*votes)[0]
// 		proposalIds := []int{proposalId, proposalIdTwo}
// 		response := otu.GetVotesForAddressAPI(_vote.Addr, proposalIds)

// 		CheckResponseCode(t, http.StatusOK, response.Code)

// 		var votes []models.VoteWithBalance
// 		json.Unmarshal(response.Body.Bytes(), &votes)

// 		for _, v := range votes {
// 			expectedWeight := float64(1.00)
// 			assert.Equal(t, expectedWeight, *v.Weight)
// 		}
// 	})
// }
