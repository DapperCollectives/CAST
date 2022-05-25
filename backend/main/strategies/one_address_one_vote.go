package strategies

import (
	"fmt"
	"math"

	"github.com/brudfyi/flow-voting-tool/main/models"
)

type OneAddressOneVote struct{}

func (s *OneAddressOneVote) TallyVotes(votes []*models.VoteWithBalance, proposalId int) (models.ProposalResults, error) {
	var r models.ProposalResults
	r.Results = map[string]int{}
	r.Proposal_id = proposalId

	//tally votes
	for _, vote := range votes {
		r.Results[vote.Choice]++
	}

	return r, nil
}

func (s *OneAddressOneVote) GetVotes(votes []*models.VoteWithBalance) ([]*models.VoteWithBalance, error) {
	return votes, nil
}

func (s *OneAddressOneVote) GetVoteWeightForBalance(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error) {
	var weight float64
	var ERROR error = fmt.Errorf("no address found")

	if vote.Addr == "" {
		return 0.00, ERROR
	}

	weight = 1 * math.Pow(10, -8)
	return weight, nil

}
