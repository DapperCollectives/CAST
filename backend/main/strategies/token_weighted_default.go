package strategies

import (
	"fmt"
	"math"

	"github.com/brudfyi/flow-voting-tool/main/models"
)

type TokenWeightedDefault struct{}

func (s *TokenWeightedDefault) TallyVotes(votes []*models.VoteWithBalance, proposalId int) (models.ProposalResults, error) {
	var r models.ProposalResults
	r.Results = map[string]int{}
	r.Results_float = map[string]float64{}
	r.Proposal_id = proposalId

	//tally votes
	for _, vote := range votes {
		r.Results[vote.Choice] += int(float64(*vote.PrimaryAccountBalance) * math.Pow(10, -8))
		r.Results_float[vote.Choice] += float64(*vote.PrimaryAccountBalance) * math.Pow(10, -8)
	}

	return r, nil
}

func (s *TokenWeightedDefault) GetVotes(votes []*models.VoteWithBalance, proposal *models.Proposal) ([]*models.VoteWithBalance, error) {

	for _, vote := range votes {
		weight, err := s.GetVoteWeightForBalance(vote, proposal)
		if err != nil {
			return nil, err
		}
		vote.Weight = &weight
	}
	return votes, nil
}

func (s *TokenWeightedDefault) GetVoteWeightForBalance(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error) {
	var weight float64
	var ERROR error = fmt.Errorf("no weight found, address: %s, strategy: %s", vote.Addr, *proposal.Strategy)

	if vote.PrimaryAccountBalance == nil {
		return 0.00, nil
	}

	weight = float64(*vote.PrimaryAccountBalance) * math.Pow(10, -8)

	switch {
	case proposal.Max_weight != nil && weight > *proposal.Max_weight:
		weight = *proposal.Max_weight
		return weight, nil
	case proposal.Max_weight != nil && weight < *proposal.Max_weight:
		return weight, nil
	case weight == 0.00:
		return 0.00, nil
	case weight > 0.00:
		return weight, nil
	default:
		return weight, ERROR
	}
}
