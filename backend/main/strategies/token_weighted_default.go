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

type TokenWeightedDefault struct {
	shared.StrategyStruct
}

func (s *TokenWeightedDefault) FetchBalance(
	db *s.Database,
	b *models.Balance,
	sc *s.SnapshotClient,
) (*models.Balance, error) {

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

func (s *TokenWeightedDefault) TallyVotes(
	votes []*models.VoteWithBalance,
	p *models.ProposalResults,
) (models.ProposalResults, error) {
	//tally votes
	for _, vote := range votes {
		if vote.PrimaryAccountBalance == nil {
			p.Results[vote.Choice] = 0.0
			p.Results_float[vote.Choice] = 0.0
			continue
		}
		p.Results[vote.Choice] += int(float64(*vote.PrimaryAccountBalance) * math.Pow(10, -8))
		p.Results_float[vote.Choice] += float64(*vote.PrimaryAccountBalance) * math.Pow(10, -8)

	}

	return *p, nil
}

func (s *TokenWeightedDefault) GetVoteWeightForBalance(
	vote *models.VoteWithBalance,
	proposal *models.Proposal,
) (float64, error) {
	var weight float64
	var ERROR error = fmt.Errorf("no weight found, address: %s, strategy: %s", vote.Addr, *proposal.Strategy)

	if vote.PrimaryAccountBalance == nil {
		return 0.00, nil
	}

	weight = float64(*vote.PrimaryAccountBalance) * math.Pow(10, -8)

	switch {
	case proposal.Max_weight != nil && weight > *proposal.Max_weight:
		weight = *proposal.Max_weight
		return weight, nil
	case proposal.Max_weight != nil && weight < *proposal.Max_weight:
		return weight, nil
	case weight == 0.00:
		return 0.00, nil
	case weight > 0.00:
		return weight, nil
	default:
		return weight, ERROR
	}
}

func (s *TokenWeightedDefault) GetVotes(
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

func (s *TokenWeightedDefault) InitStrategy(f *shared.FlowAdapter, db *shared.Database) {
	s.FlowAdapter = f
	s.DB = db
}
