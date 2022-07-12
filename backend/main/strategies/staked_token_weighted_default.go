package strategies

import (
	"fmt"
	"math"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
)

type StakedTokenWeightedDefault struct {
	shared.StrategyStruct
}

func (s *StakedTokenWeightedDefault) FetchBalance(
	db *s.Database,
	b *models.Balance,
	sc *s.SnapshotClient,
) (*models.Balance, error) {

	if err := b.GetBalanceByAddressAndBlockHeight(db); err != nil && err.Error() != pgx.ErrNoRows.Error() {
		log.Error().Err(err).Msg("error querying address b at blockheight")
		return nil, err
	}

	if b.ID == "" {
		if err := b.CreateBalance(db); err != nil {
			log.Error().Err(err).Msg("error saving b to DB")
			return nil, err
		}
	}

	return b, nil
}

func (s *StakedTokenWeightedDefault) TallyVotes(
	votes []*models.VoteWithBalance,
	r *models.ProposalResults,
) (models.ProposalResults, error) {

	for _, vote := range votes {
		if vote.StakingBalance != nil {
			r.Results[vote.Choice] += int(float64(*vote.StakingBalance) * math.Pow(10, -8))
			r.Results_float[vote.Choice] += float64(*vote.StakingBalance) * math.Pow(10, -8)
		}
	}

	return *r, nil
}

func (s *StakedTokenWeightedDefault) GetVoteWeightForBalance(
	vote *models.VoteWithBalance,
	proposal *models.Proposal,
) (float64, error) {
	var weight float64
	var ERROR error = fmt.Errorf("no weight found, address: %s, strategy: %s", vote.Addr, *proposal.Strategy)

	if vote.StakingBalance == nil {
		return 0.00, nil
	}

	weight = float64(*vote.StakingBalance) * math.Pow(10, -8)

	switch {
	case proposal.Max_weight != nil && weight > *proposal.Max_weight:
		weight = *proposal.Max_weight
		return weight, nil
	case proposal.Max_weight != nil && weight < *proposal.Max_weight:
		return weight, nil
	case weight > 0.00:
		return weight, nil
	case weight == 0.00:
		return 0.00, nil
	default:
		return weight, ERROR
	}
}

func (s *StakedTokenWeightedDefault) GetVotes(
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

func (s *StakedTokenWeightedDefault) InitStrategy(f *shared.FlowAdapter, db *shared.Database) {
	s.FlowAdapter = f
	s.DB = db
}
