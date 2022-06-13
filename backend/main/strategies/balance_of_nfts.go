package strategies

import (
	"fmt"
	"math"

	"github.com/DapperCollectives/CAST/backend/main/models"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
)

type BalanceOfNfts struct{}

func (s *BalanceOfNfts) FetchBalance(db *s.Database, b *models.Balance, sc *s.SnapshotClient) (*models.Balance, error) {

	if err := b.GetBalanceByAddressAndBlockHeight(db); err != nil && err.Error() != pgx.ErrNoRows.Error() {
		log.Error().Err(err).Msg("error querying address b at blockheight")
		return nil, err
	}

	if b.ID == "" {
		err := b.FetchAddressBalanceAtBlockHeight(sc, b.Addr, b.BlockHeight)
		if err != nil {
			log.Error().Err(err).Msg("error fetching address b at blockheight.")
			return nil, err
		}

		if err = b.CreateBalance(db); err != nil {
			log.Error().Err(err).Msg("error saving b to DB")
			return nil, err
		}
	}

	return b, nil
}

func (s *BalanceOfNfts) TallyVotes(votes []*models.VoteWithBalance, proposalId int) (models.ProposalResults, error) {
	var r models.ProposalResults
	r.Results_float = map[string]float64{}
	r.Results_float["a"] = 0
	r.Results_float["b"] = 0

	for _, v := range votes {
		//print the length of v.NFTs
		nftCount := len(v.NFTs)
		r.Results_float[v.Choice] += float64(nftCount) * math.Pow(10, -8)
	}

	r.Proposal_id = proposalId

	return r, nil
}

func (s *BalanceOfNfts) GetVoteWeightForBalance(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error) {
	var weight float64
	var ERROR error = fmt.Errorf("no address found")

	if vote.Addr == "" {
		return 0.00, ERROR
	}
	weight = 1.00

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
