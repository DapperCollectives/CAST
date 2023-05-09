package strategies

import (
	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/rs/zerolog/log"
)

type BalanceOfNfts struct {
	shared.StrategyStruct
	DB *shared.Database
}

func (b *BalanceOfNfts) FetchBalance(
	balance *models.Balance,
	p *models.Proposal,
) (*models.Balance, error) {

	v := models.Vote{Proposal_id: balance.Proposal_id, Addr: balance.Addr}
	vb := &models.VoteWithBalance{
		NFTs: []*models.NFT{},
		Vote: v,
	}

	var c models.Community
	if err := c.GetCommunityByProposalId(b.DB, balance.Proposal_id); err != nil {
		return nil, err
	}

	strategy, err := models.MatchStrategyByProposal(*c.Strategies, *p.Strategy)
	if err != nil {
		log.Error().Err(err).Msg("Unable to find strategy for contract.")
		return nil, err
	}

	if err := b.queryNFTs(*vb, strategy, balance); err != nil {
		return nil, err
	}

	return balance, nil
}

func (b *BalanceOfNfts) queryNFTs(
	vb models.VoteWithBalance,
	strategy models.Strategy,
	balance *models.Balance,
) error {
	scriptPath := "./main/cadence/scripts/get_nfts_ids.cdc"
	nftIds, err := b.FlowAdapter.GetNFTIds(
		balance.Addr,
		&strategy.Contract,
		scriptPath,
	)
	if err != nil {
		return err
	}

	for _, nftId := range nftIds {
		nft := &models.NFT{
			ID: nftId,
		}
		vb.NFTs = append(vb.NFTs, nft)
	}

	doesExist, err := models.DoesNFTExist(b.DB, &vb)
	if err != nil {
		return err
	}

	//only if the NFT ID is not already in the DB,
	//do we add the balance
	if !doesExist && err == nil {
		err = models.CreateUserNFTRecord(b.DB, &vb)
		balance.NFTCount = len(vb.NFTs)
	}

	return err
}

func (b *BalanceOfNfts) TallyVotes(
	votes []*models.VoteWithBalance,
	r *models.ProposalResults,
	proposal *models.Proposal,
) (models.ProposalResults, error) {

	for _, vote := range votes {
		if len(vote.NFTs) != 0 {
			var voteWeight float64

			voteWeight, err := b.GetVoteWeightForBalance(vote, proposal)
			if err != nil {
				return models.ProposalResults{}, err
			}

			r.Results[vote.Choice] += int(voteWeight)
			r.Results_float[vote.Choice] += voteWeight
		}
	}

	return *r, nil
}

func (b *BalanceOfNfts) GetVoteWeightForBalance(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error) {
	nftIds, err := models.GetUserNFTs(b.DB, vote)
	if err != nil {
		log.Error().Err(err).Msg("error in GetVoteWeightForBalance for BalanceOfNFTs strategy")
		return 0.00, err
	}

	if proposal.Max_weight != nil && float64(len(nftIds)) > *proposal.Max_weight {
		return *proposal.Max_weight, nil
	}

	return float64(len(nftIds)), nil
}

func (b *BalanceOfNfts) GetVotes(
	votes []*models.VoteWithBalance,
	proposal *models.Proposal,
) ([]*models.VoteWithBalance, error) {
	for _, vote := range votes {
		weight, err := b.GetVoteWeightForBalance(vote, proposal)
		if err != nil {
			return nil, err
		}
		vote.Weight = &weight
	}

	return votes, nil
}

func (b *BalanceOfNfts) RequiresSnapshot() bool {
	return false
}

func (b *BalanceOfNfts) InitStrategy(
	f *shared.FlowAdapter,
	db *shared.Database,
) {
	b.FlowAdapter = f
	b.DB = db
}
