package strategies

import (
	"errors"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/rs/zerolog/log"
)

type FloatNFTs struct {
	shared.StrategyStruct
	DB *shared.Database
}

func (f *FloatNFTs) FetchBalance(
	balance *models.Balance,
	p *models.Proposal,
) (*models.Balance, error) {

	v := models.Vote{Proposal_id: balance.Proposal_id, Addr: balance.Addr}
	vb := &models.VoteWithBalance{
		NFTs: []*models.NFT{},
		Vote: v,
	}

	var c models.Community
	if err := c.GetCommunityByProposalId(f.DB, balance.Proposal_id); err != nil {
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

	if err := f.queryNFTs(*vb, strategy, balance); err != nil {
		return nil, err
	}

	return balance, nil
}

func (f *FloatNFTs) queryNFTs(
	vb models.VoteWithBalance,
	strategy models.Strategy,
	balance *models.Balance,
) error {
	hasEventNFT, err := f.FlowAdapter.CheckIfUserHasEvent(vb.Vote.Addr, &strategy.Contract)
	if err != nil {
		return err
	}

	if !hasEventNFT {
		errMsg := "the user does not have this Float event in their wallet"
		log.Error().Err(err).Msg(errMsg)
		return errors.New(errMsg)
	}

	nftIds, err := f.FlowAdapter.GetFloatNFTIds(vb.Vote.Addr, &strategy.Contract)
	for _, nftId := range nftIds {
		nft := &models.NFT{
			ID: nftId,
		}
		vb.NFTs = append(vb.NFTs, nft)
	}

	doesExist, err := models.DoesNFTExist(f.DB, &vb)
	if err != nil {
		return err
	}

	//in this strategy we don't consider multple NFTs for the same event
	//so we just use 1 for NFTCount
	if !doesExist {
		err = models.CreateUserNFTRecord(f.DB, &vb)
		balance.NFTCount = 1 // force set to one if user has an event.
	}

	return err
}

func (f *FloatNFTs) TallyVotes(
	votes []*models.VoteWithBalance,
	r *models.ProposalResults,
	proposal *models.Proposal,
) (models.ProposalResults, error) {

	for _, vote := range votes {
		if len(vote.NFTs) != 0 {
			var voteWeight float64

			voteWeight, err := f.GetVoteWeightForBalance(vote, proposal)
			if err != nil {
				return models.ProposalResults{}, err
			}

			r.Results[vote.Choice] += int(voteWeight)
			r.Results_float[vote.Choice] += voteWeight
		}
	}

	return *r, nil
}

func (f *FloatNFTs) GetVoteWeightForBalance(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error) {
	nftIds, err := models.GetUserNFTs(f.DB, vote)
	if err != nil {
		log.Error().Err(err).Msg("error in GetVoteWeightForBalance for BalanceOfNFTs strategy")
		return 0.00, err
	}

	if proposal.Max_weight != nil && float64(len(nftIds)) > *proposal.Max_weight {
		return *proposal.Max_weight, nil
	}

	return float64(len(nftIds)), nil
}

func (f *FloatNFTs) GetVotes(
	votes []*models.VoteWithBalance,
	proposal *models.Proposal,
) ([]*models.VoteWithBalance, error) {

	for _, vote := range votes {
		weight, err := f.GetVoteWeightForBalance(vote, proposal)
		if err != nil {
			return nil, err
		}
		vote.Weight = &weight
	}

	return votes, nil
}

func (f *FloatNFTs) RequiresSnapshot() bool {
	return false
}

func (f *FloatNFTs) InitStrategy(
	fa *shared.FlowAdapter,
	db *shared.Database,
) {
	f.FlowAdapter = fa
	f.DB = db
}
