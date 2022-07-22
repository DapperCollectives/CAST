package strategies

import (
	"fmt"
	"math"
	"time"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
)

type TokenWeightedDefault struct {
	s.StrategyStruct
	SC s.SnapshotClient
	DB *s.Database
	name string
}

type FTBalanceResponse struct {
	ID              string    `json:"id"`
	FungibleTokenID string    `json:"fungibleTokenId"`
	Addr            string    `json:"addr"`
	Balance         uint64    `json:"balance"`
	BlockHeight     uint64    `json:"blockHeight"`
	CreatedAt       time.Time `json:"createdAt"`
	HasVault        bool      `json:"hasVault"`
}

func (s *TokenWeightedDefault) FetchBalance(
	b *models.Balance,
	p *models.Proposal,
) (*models.Balance, error) {

	var c models.Community
	if err := c.GetCommunityByProposalId(s.DB, b.Proposal_id); err != nil {
		return nil, err
	}

	if err := b.GetBalanceByAddressAndBlockHeight(s.DB); err != nil && err.Error() != pgx.ErrNoRows.Error() {
		log.Error().Err(err).Msg("error fetching balance from DB")
		return nil, err
	}

	strategy, err := models.MatchStrategyByProposal(*c.Strategies, *p.Strategy)
	if err != nil {
		log.Error().Err(err).Msg("Unable to find strategy for contract")
		return nil, err
	}

	var ftBalance = &FTBalanceResponse{}
	if err := s.SC.GetAddressBalanceAtBlockHeight(
		b.Addr,
		b.BlockHeight,
		ftBalance,
		&strategy.Contract,
	); err != nil {
		log.Error().Err(err).Msg("error fetching balance")
		return nil, err
	}

	b.PrimaryAccountBalance = ftBalance.Balance
	b.SecondaryAccountBalance = 0
	b.StakingBalance = 0

	if err := b.CreateBalance(s.DB); err != nil {
		log.Error().Err(err).Msg("error creating balance in the DB")
		return nil, err
	}

	return b, nil
}

func (s *TokenWeightedDefault) TallyVotes(
	votes []*models.VoteWithBalance,
	p *models.ProposalResults,
) (models.ProposalResults, error) {

	for _, vote := range votes {
		if vote.PrimaryAccountBalance != nil {
			p.Results[vote.Choice] += int(float64(*vote.PrimaryAccountBalance) * math.Pow(10, -8))
			p.Results_float[vote.Choice] += float64(*vote.PrimaryAccountBalance) * math.Pow(10, -8)
		}
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

func (s *TokenWeightedDefault) RequiresSnapshot() bool {
	return true
}

func (s *TokenWeightedDefault) InitStrategy(
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
