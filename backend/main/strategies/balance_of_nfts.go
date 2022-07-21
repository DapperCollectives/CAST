package strategies

import (
	"math"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
)

type BalanceOfNfts struct {
	s.StrategyStruct
	SC s.SnapshotClient
	DB *s.Database
	name string
}

func (b *BalanceOfNfts) FetchBalance(
	balance *models.Balance,
	p *models.Proposal,
) (*models.Balance, error) {
	return FetchNFTBalance(b.DB, b.FlowAdapter, balance, p)
}

func (b *BalanceOfNfts) TallyVotes(
	votes []*models.VoteWithBalance,
	r *models.ProposalResults,
) (models.ProposalResults, error) {

	for _, v := range votes {
		nftCount := len(v.NFTs)
		r.Results_float[v.Choice] += float64(nftCount) * math.Pow(10, -8)
	}

	return *r, nil
}

func (b *BalanceOfNfts) GetVoteWeightForBalance(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error) {
	var weight float64

	var c models.Community
	if err := c.GetCommunityByProposalId(b.DB, proposal.ID); err != nil {
		return 0, err
	}

	weight = float64(len(vote.NFTs))
	return weight, nil
}

func (s *BalanceOfNfts) GetVotes(
	votes []*models.VoteWithBalance,
	proposal *models.Proposal,
) ([]*models.VoteWithBalance, error) {

	for _, vote := range votes {
		weight, err := s.GetVoteWeightForBalance(vote, proposal)
		if err != nil {
			return nil, err
		}
		vote.Weight = &weight
	}

	return votes, nil
}

func (s *BalanceOfNfts) InitStrategy(
	f *shared.FlowAdapter,
	db *shared.Database,
	sc *s.SnapshotClient,
	name string,
) {
	s.FlowAdapter = f
	s.DB = db
	s.SC = *sc
	s.name = name
}
