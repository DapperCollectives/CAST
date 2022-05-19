package strategies

type TokenWeightedDefault struct{}

func (s *TokenWeightedDefault) TallyVotes(votes []int, proposalId int) ([]int, error) {
	return votes, nil
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
