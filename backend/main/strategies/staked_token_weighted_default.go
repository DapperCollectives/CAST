package strategies

import (
	"fmt"
	"math"

	"github.com/DapperCollectives/CAST/backend/main/models"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
)

type StakedTokenWeightedDefault struct{}

// should handle and return error case here
func (s *StakedTokenWeightedDefault) FetchBalance(db *s.Database, b *models.Balance, sc *s.SnapshotClient) (*models.Balance, error) {

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

func (s *StakedTokenWeightedDefault) TallyVotes(votes []*models.VoteWithBalance, p *models.ProposalResults) (models.ProposalResults, error) {
	for _, vote := range votes {
		p.Results[vote.Choice] += int(float64(*vote.StakingBalance) * math.Pow(10, -8))
		p.Results_float[vote.Choice] += float64(*vote.StakingBalance) * math.Pow(10, -8)
	}

	return *p, nil
}

func (s *StakedTokenWeightedDefault) GetVoteWeightForBalance(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error) {
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

func (s *StakedTokenWeightedDefault) GetVotes(votes []*models.VoteWithBalance, proposal *models.Proposal) ([]*models.VoteWithBalance, error) {

	for _, vote := range votes {
		weight, err := s.GetVoteWeightForBalance(vote, proposal)
		if err != nil {
			return nil, err
		}
		vote.Weight = &weight
	}

	return votes, nil
}
