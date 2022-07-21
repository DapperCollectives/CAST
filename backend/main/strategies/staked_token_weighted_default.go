package strategies

import (
	"fmt"
	"math"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/rs/zerolog/log"
)

type StakedTokenWeightedDefault struct {
	s.StrategyStruct
	SC s.SnapshotClient
	DB *s.Database
}

func (s *StakedTokenWeightedDefault) FetchBalance(
	b *models.Balance,
	p *models.Proposal,
) (*models.Balance, error) {

	var c models.Community
	if err := c.GetCommunityByProposalId(s.DB, b.Proposal_id); err != nil {
		return nil, err
	}

	strategy, err := models.MatchStrategyByProposal(*c.Strategies, *p.Strategy)
	if err != nil {
		log.Error().Err(err).Msg("Unable to find strategy for contract")
		return nil, err
	}

	if err := s.SC.GetAddressBalanceAtBlockHeight(
		b.Addr,
		b.BlockHeight,
		b,
		&strategy.Contract,
	); err != nil {
		log.Error().Err(err).Msg("Error fetching balance.")
		return nil, err
	}

	if err := b.CreateBalance(s.DB); err != nil {
		log.Error().Err(err).Msg("Error creating balance in the database.")
		return nil, err
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

func (s *StakedTokenWeightedDefault) InitStrategy(
	f *shared.FlowAdapter,
	db *shared.Database,
	sc *s.SnapshotClient,
) {
	s.FlowAdapter = f
	s.DB = db
	s.SC = *sc
}
