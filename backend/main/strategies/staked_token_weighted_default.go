package strategies

type StakedTokenWeightedDefault struct {
}

func (s *StakedTokenWeightedDefault) Name() string {
	return "staked_token_weighted_default"
}

func (s *StakedTokenWeightedDefault) GetVotes(votes []string, stake int64) []string {
	return votes
}
