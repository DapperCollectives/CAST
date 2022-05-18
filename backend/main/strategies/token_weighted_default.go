package strategies

import "github.com/brudfyi/flow-voting-tool/main/models"

type TokenWeightedDefault struct {
	SomeData string
}

func (s *TokenWeightedDefault) TallyVotes(votes []*models.Vote) {
}

func (s *TokenWeightedDefault) GetVotes(proposalId string) []*models.Vote {
	return nil
}
