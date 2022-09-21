package strategies

import (
	"fmt"
	"math"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/rs/zerolog/log"
)

type TokenWeightedDefault struct {
	shared.StrategyStruct
	DPS shared.DpsAdapter
	DB  *shared.Database
}

func (s *TokenWeightedDefault) FetchBalance(
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

	if err := s.FetchBalanceFromSnapshot(&strategy, b); err != nil {
		log.Error().Err(err).Msg("Error calling snapshot client")
		return nil, err
	}

	if err := b.CreateBalance(s.DB); err != nil {
		log.Error().Err(err).Msg("Error creating balance in the database.")
		return nil, err
	}

	return b, nil
}

func (s *TokenWeightedDefault) FetchBalanceFromSnapshot(
	strategy *models.Strategy,
	b *models.Balance,
) error {

	var ftBalance = &shared.FTBalanceResponse{}
	var err error
	ftBalance, err = s.DPS.GetBalanceAtBlockheight(
		b.Addr,
		b.BlockHeight,
		&strategy.Contract,
	)
	if err != nil {
		log.Error().Err(err).Msg("Error fetching balance from DPS")
		return err
	}

	if *strategy.Contract.Name == "FlowToken" {
		b.PrimaryAccountBalance = ftBalance.PrimaryAccountBalance
		b.SecondaryAccountBalance = ftBalance.SecondaryAccountBalance
		b.StakingBalance = ftBalance.StakingBalance

	} else {
		b.PrimaryAccountBalance = ftBalance.Balance
		b.SecondaryAccountBalance = 0
		b.StakingBalance = 0
	}

	return nil
}

func (s *TokenWeightedDefault) TallyVotes(
	votes []*models.VoteWithBalance,
	r *models.ProposalResults,
	p *models.Proposal,
) (models.ProposalResults, error) {

	for _, vote := range votes {
		if vote.PrimaryAccountBalance != nil {
			var allowedBalance float64

			if p.Max_weight != nil {
				allowedBalance = p.EnforceMaxWeight(float64(*vote.PrimaryAccountBalance))
			} else {
				allowedBalance = float64(*vote.PrimaryAccountBalance)
			}

			r.Results[vote.Choices[0]] += int(allowedBalance)
			r.Results_float[vote.Choices[0]] += allowedBalance * math.Pow(10, -8)
		}
	}

	return *r, nil
}

func (s *TokenWeightedDefault) GetVoteWeightForBalance(
	vote *models.VoteWithBalance,
	proposal *models.Proposal,
) (float64, error) {
	var weight float64
	var ERROR error = fmt.Errorf("No weight found, address: %s, strategy: %s.", vote.Addr, *proposal.Strategy)

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

func (s *TokenWeightedDefault) InitStrategy(
	fa *shared.FlowAdapter,
	db *shared.Database,
	dps *shared.DpsAdapter,
) {
	s.FlowAdapter = fa
	s.DB = db
	s.DPS = *dps
}
