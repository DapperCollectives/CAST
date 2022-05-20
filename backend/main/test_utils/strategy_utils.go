package test_utils

import (
	"math"
	"math/rand"
	"strconv"

	"github.com/brudfyi/flow-voting-tool/main/models"
	"github.com/rs/zerolog/log"
)

type VoteWithBalance struct {
	models.Vote

	Primary_account_balance uint64 `json:"primaryAccountBalance"`
	Staking_balance         uint64 `json:"stakingBalance"`
	Block_height            uint64 `json:"blockHeight"`
}

func (otu *OverflowTestUtils) TallyResultsForTokenWeightedDefault(proposalId int, votes *[]VoteWithBalance) *models.ProposalResults {
	r := models.ProposalResults{Proposal_id: proposalId}

	r.Results_float = map[string]float64{}
	r.Results_float["a"] = 0
	r.Results_float["b"] = 0

	for _, v := range *votes {
		choice := v.Choice
		r.Results_float[choice] += float64(v.Primary_account_balance) * math.Pow(10, -8)
	}

	// r.Results_float["a"] = float64(r.Results_float["a"]) * math.Pow(10, -8)
	// r.Results_float["b"] = float64(r.Results_float["b"]) * math.Pow(10, -8)
	return &r
}

func (otu *OverflowTestUtils) TallyResultsForStakedTokenWeightedDefault(proposalId int, votes *[]VoteWithBalance) *models.ProposalResults {
	r := models.ProposalResults{Proposal_id: proposalId}

	r.Results_float = map[string]float64{}
	r.Results_float["a"] = 0
	r.Results_float["b"] = 0

	for _, v := range *votes {
		choice := v.Choice
		r.Results_float[choice] += float64(v.Staking_balance) * math.Pow(10, -8)
		log.Info().Msgf("%d", v.Staking_balance)
	}

	// r.Results_float["a"] = float64(r.Results_float["a"]) * math.Pow(10, -8)
	// r.Results_float["b"] = float64(r.Results_float["b"]) * math.Pow(10, -8)
	return &r
}

func (otu *OverflowTestUtils) GenerateListOfVotes(proposalId int, count int) *[]VoteWithBalance {
	votes := make([]VoteWithBalance, count)
	choices := []string{"a", "b"}
	for i := 0; i < count; i++ {
		addr := "0x" + strconv.Itoa(i)
		randomNumber := rand.Intn(2)
		choice := choices[randomNumber]
		v := models.Vote{
			Proposal_id: proposalId, Addr: addr, Choice: choice,
		}

		// Balance is 1 FLOW * index
		balance := 100000000 * (i + 1)

		vote := VoteWithBalance{
			Vote:                    v,
			Primary_account_balance: uint64(balance),
			Staking_balance:         uint64(balance * 5), // Make this different so staked/reg strats dont have same results
			Block_height:            uint64(0),
		}

		votes[i] = vote
	}

	return &votes
}
