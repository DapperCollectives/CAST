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

func (s *TokenWeightedDefault) GetVotes(votes []*models.VoteWithBalance) ([]*models.VoteWithBalance, error) {
	return votes, nil
}

func (s *TokenWeightedDefault) GetVoteWeightForBalance(balance *models.Balance, proposal *models.Proposal) (float64, error) {
	var weight float64
	var ERROR error = fmt.Errorf("no weight found, address: %s, strategy: %s", balance.Addr, *proposal.Strategy)

	weight = float64(balance.PrimaryAccountBalance) * math.Pow(10, -8)

	if weight == 0 {
		return 0, ERROR
	}

	return weight, nil
}

func (s *TokenWeightedDefault) GetVoteWeightsForBalances(addr string, proposalId int) ([]int, error) {
	return nil, nil
}
