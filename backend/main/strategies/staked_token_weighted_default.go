package strategies

import (
	"fmt"
	"math"

	"github.com/brudfyi/flow-voting-tool/main/models"
)

type StakedTokenWeightedDefault struct{}

// should handle and return error case here
func (s *StakedTokenWeightedDefault) TallyVotes(votes []*models.VoteWithBalance, proposalId int) (models.ProposalResults, error) {
	var r models.ProposalResults
	r.Results = map[string]int{}
	r.Proposal_id = proposalId
	tallyA := 0
	tallyB := 0

	//tally votes
	for _, vote := range votes {
		if vote.Choice == "A" {
			tallyA += int(*vote.StakingBalance)
			r.Results[vote.Choice] = int(float64(tallyA) * math.Pow(10, -8))
		} else {
			tallyB += int(*vote.StakingBalance)
			r.Results[vote.Choice] = int(float64(tallyB) * math.Pow(10, -8))
		}
	}

	fmt.Printf("choiceA: %d, choiceB: %d\n", tallyA, tallyB)
	return r, nil
}

// for some strategies unique logic may want to be implemented here
func (s *StakedTokenWeightedDefault) GetVotes(votes []*models.VoteWithBalance) ([]*models.VoteWithBalance, error) {
	fmt.Printf("len(votes): %d\n", len(votes))
	return votes, nil
}

func (s *StakedTokenWeightedDefault) GetWeightForAddress(balance *models.Balance, proposal *models.Proposal) (uint64, error) {
	var weight uint64
	var ERROR error = fmt.Errorf("no weight found, address: %s", balance.Addr)

	weight = balance.StakingBalance

	if weight == 0 {
		return 0, ERROR
	}
	if proposal.Min_balance != nil && *proposal.Min_balance > 0 && weight < *proposal.Min_balance {
		return 0, ERROR
	}

	return weight, nil
}

func (s *StakedTokenWeightedDefault) GetWeightsForAddress(addr string, proposalId int) ([]int, error) {
	return nil, nil
}
