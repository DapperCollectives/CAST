package strategies

import "github.com/brudfyi/flow-voting-tool/main/models"

type TokenWeightedDefault struct{}

func (s *TokenWeightedDefault) TallyVotes(votes []*models.VoteWithBalance, proposalId int) (models.ProposalResults, error) {
	var r models.ProposalResults
	return r, nil
}

func (s *TokenWeightedDefault) GetStrategyVotesForProposal(proposalId int) ([]int, error) {
	return nil, nil
}

func (s *TokenWeightedDefault) GetWeightForAddress(addr string, proposalId int) (int, error) {
	return 0, nil
}

func (s *TokenWeightedDefault) GetWeightsForAddress(addr string, proposalId int) ([]int, error) {
	return nil, nil
}
