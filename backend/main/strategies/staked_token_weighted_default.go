package strategies

import (
	"fmt"
	"math"

	"github.com/brudfyi/flow-voting-tool/main/models"
)

type StakedTokenWeightedDefault struct{}

// should handle and return error case here
func (s *StakedTokenWeightedDefault) TallyVotes(votes []*models.VoteWithBalance, p *models.ProposalResults) (models.ProposalResults, error) {

	for _, vote := range votes {
		p.Results[vote.Choice] += int(float64(*vote.StakingBalance) * math.Pow(10, -8))
		p.Results_float[vote.Choice] += float64(*vote.StakingBalance) * math.Pow(10, -8)
	}

	return *p, nil
}

func (s *StakedTokenWeightedDefault) GetVotes(votes []*models.VoteWithBalance, proposal *models.Proposal) ([]*models.VoteWithBalance, error) {

	for _, vote := range votes {
		weight, err := s.GetVoteWeightForBalance(vote, proposal)
		if err != nil {
			return nil, err
		}
		vote.Weight = &weight
	}

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
