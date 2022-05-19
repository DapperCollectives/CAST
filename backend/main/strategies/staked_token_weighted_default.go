package strategies

type StakedTokenWeightedDefault struct{}

func (s *StakedTokenWeightedDefault) TallyVotes(votes []int, proposalId int) ([]int, error) {
	return nil, nil
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
