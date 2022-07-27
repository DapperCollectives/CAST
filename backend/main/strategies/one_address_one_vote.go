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
	s.StrategyStruct
	SC s.SnapshotClient
	DB *s.Database
}

func (s *OneAddressOneVote) FetchBalance(
	b *models.Balance,
	p *models.Proposal,
) (*models.Balance, error) {

	if err := b.GetBalanceByAddressAndBlockHeight(s.DB); err != nil && err.Error() != pgx.ErrNoRows.Error() {
		log.Error().Err(err).Msg("Error querying address b at blockheight.")
		return nil, err
	}

	if b.ID == "" {
		if err := b.CreateBalance(s.DB); err != nil {
			log.Error().Err(err).Msg("Error saving b to database.")
			return nil, err
		}
	}

	return b, nil
}

func (s *OneAddressOneVote) TallyVotes(
	votes []*models.VoteWithBalance,
	p *models.ProposalResults,
	maxWeight float64,
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
	var ERROR error = fmt.Errorf("No address found.")

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

func (s *OneAddressOneVote) RequiresSnapshot() bool {
	return false
}

func (s *OneAddressOneVote) InitStrategy(
	f *shared.FlowAdapter,
	db *shared.Database,
	sc *s.SnapshotClient,
) {
	s.FlowAdapter = f
	s.DB = db
	s.SC = *sc
}
