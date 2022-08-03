package strategies

import (
	"math"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/rs/zerolog/log"
)

type FloatNFTs struct {
	s.StrategyStruct
	SC s.SnapshotClient
	DB *s.Database
}

func (s *FloatNFTs) FetchBalance(
	balance *models.Balance,
	p *models.Proposal,
) (*models.Balance, error) {

	v := models.Vote{Proposal_id: balance.Proposal_id, Addr: balance.Addr}
	vb := &models.VoteWithBalance{
		NFTs: []*models.NFT{},
		Vote: v,
	}

	var c models.Community
	if err := c.GetCommunityByProposalId(s.DB, balance.Proposal_id); err != nil {
		return nil, err
	}

	strategy, err := models.MatchStrategyByProposal(*c.Strategies, *p.Strategy)
	if err != nil {
		log.Error().Err(err).Msg("Unable to find strategy for contract.")
		return nil, err
	}

	if strategy.Contract.Float_event_id == nil {
		log.Error().Msg("No float event id field was found for contract.")
	}

	if err := s.queryNFTs(*vb, strategy, balance); err != nil {
		return nil, err
	}

	return balance, nil
}

func (s *FloatNFTs) queryNFTs(
	vb models.VoteWithBalance,
	strategy models.Strategy,
	balance *models.Balance,
) error {
	hasEventNFT, err := s.FlowAdapter.CheckIfUserHasEvent(vb.Vote.Addr, &strategy.Contract)
	if err != nil {
		return err
	}

	if !hasEventNFT {
		log.Error().Err(err).Msg("the user does not have this Float event in their wallet")
		return err
	}

	nftIds, err := s.FlowAdapter.GetFloatNFTIds(vb.Vote.Addr, &strategy.Contract)
	for _, nftId := range nftIds {
		nft := &models.NFT{
			ID: nftId,
		}
		vb.NFTs = append(vb.NFTs, nft)
	}

	doesExist, err := models.DoesNFTExist(s.DB, &vb)
	if err != nil {
		return err
	}

	//in this strategy we don't consider multple NFTs for the same event
	//so we just use 1 for NFTCount
	if !doesExist && err == nil {
		err = models.CreateUserNFTRecord(s.DB, &vb)
		balance.NFTCount = 1 // force set to one if user has an event.
	}

	return err
}

func (s *FloatNFTs) TallyVotes(
	votes []*models.VoteWithBalance,
	r *models.ProposalResults,
	proposal *models.Proposal,
) (models.ProposalResults, error) {

	for _, vote := range votes {

		if len(vote.NFTs) != 0 {
			var allowedBalance float64

			if proposal.Max_weight != nil {
				allowedBalance = proposal.EnforceMaxWeight(float64(*vote.PrimaryAccountBalance))
			} else {
				allowedBalance = float64(len(vote.NFTs))
			}

			r.Results[vote.Choice] += int(allowedBalance * math.Pow(10, -8))
			r.Results_float[vote.Choice] += allowedBalance * math.Pow(10, -8)
		}
	}

	return *r, nil
}

func (s *FloatNFTs) GetVoteWeightForBalance(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error) {
	nftIds, err := models.GetUserNFTs(s.DB, vote)
	if err != nil {
		log.Error().Err(err).Msg("error in GetVoteWeightForBalance for BalanceOfNFTs strategy")
		return 0.00, err
	}
	return float64(len(nftIds)), nil
}

func (s *FloatNFTs) GetVotes(
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

func (s *FloatNFTs) RequiresSnapshot() bool {
	return false
}

func (s *FloatNFTs) InitStrategy(
	f *shared.FlowAdapter,
	db *shared.Database,
	sc *s.SnapshotClient,
) {
	s.FlowAdapter = f
	s.DB = db
	s.SC = *sc
}
