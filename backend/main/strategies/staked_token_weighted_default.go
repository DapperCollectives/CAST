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
	r.Results_float = map[string]float64{}
	r.Proposal_id = proposalId

	for _, vote := range votes {
		r.Results[vote.Choice] += int(float64(*vote.StakingBalance) * math.Pow(10, -8))
		r.Results_float[vote.Choice] += float64(*vote.StakingBalance) * math.Pow(10, -8)
	}

	return r, nil
}

// for some strategies unique logic may want to be implemented here
func (s *StakedTokenWeightedDefault) GetVotes(votes []*models.VoteWithBalance) ([]*models.VoteWithBalance, error) {
	return votes, nil
}

func (s *StakedTokenWeightedDefault) GetVoteWeightForBalance(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error) {
	var weight float64
	var ERROR error = fmt.Errorf("no weight found, address: %s, strategy: %s", vote.Addr, *proposal.Strategy)

	if vote.StakingBalance == nil {
		return 0.00, nil
	}

	weight = float64(*vote.StakingBalance) * math.Pow(10, -8)

	switch {
	case proposal.Max_weight != nil && weight > *proposal.Max_weight:
		weight = *proposal.Max_weight
		return weight, nil
	case proposal.Max_weight != nil && weight < *proposal.Max_weight:
		return weight, nil
	case weight > 0.00:
		return weight, nil
	case weight == 0.00:
		return 0.00, nil
	default:
		return weight, ERROR
	}
}
