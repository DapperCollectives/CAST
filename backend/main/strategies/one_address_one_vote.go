package strategies

import (
	"fmt"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
)

type OneAddressOneVote struct {
	shared.StrategyStruct
}

func (s *OneAddressOneVote) FetchBalance(db *s.Database, b *models.Balance, sc *s.SnapshotClient) (*models.Balance, error) {

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

func (s *OneAddressOneVote) TallyVotes(
	votes []*models.VoteWithBalance,
	p *models.ProposalResults,
) (models.ProposalResults, error) {

	for _, vote := range votes {
		p.Results[vote.Choice]++
	}

	return *p, nil
}

func (s *OneAddressOneVote) GetVoteWeightForBalance(
	vote *models.VoteWithBalance,
	proposal *models.Proposal,
) (float64, error) {
	var weight float64
	var ERROR error = fmt.Errorf("no address found")

	if vote.Addr == "" {
		return 0.00, ERROR
	}
	weight = 1.00

	return weight, nil
}

func (s *OneAddressOneVote) GetVotes(
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

func (s *OneAddressOneVote) InitStrategy(f *shared.FlowAdapter, db *shared.Database) {
	s.FlowAdapter = f
	s.DB = db
}
