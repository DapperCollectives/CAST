package strategies

import (
	"fmt"
	"math"

	"github.com/brudfyi/flow-voting-tool/main/models"
)

type StakedTokenWeightedDefault struct{}

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

func (s *StakedTokenWeightedDefault) GetStrategyVotesForProposal(proposalId int) ([]int, error) {
	return nil, nil
}

func (s *StakedTokenWeightedDefault) GetWeightForAddress(addr string, proposalId int) (int, error) {
	return 0, nil
}

func (s *StakedTokenWeightedDefault) GetWeightsForAddress(addr string, proposalId int) ([]int, error) {
	return nil, nil
}
