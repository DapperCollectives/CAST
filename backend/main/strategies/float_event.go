package strategies

import (
	"fmt"
	"math"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/rs/zerolog/log"
)

type FLOATEvent struct {
	s.StrategyStruct
	SC s.SnapshotClient
	DB *s.Database
}

func (b *FLOATEvent) FetchBalance(
	balance *models.Balance,
	p *models.Proposal,
) (*models.Balance, error) {

	vb := &models.VoteWithBalance{
		NFTs: []*models.NFT{},
	}

	var c models.Community
	if err := c.GetCommunityByProposalId(b.DB, balance.Proposal_id); err != nil {
		return nil, err
	}

	nftIds, err := models.GetUserNFTs(b.DB, vb)
	if err != nil {
		log.Error().Err(err).Msg("error getting user nfts")
		return nil, err
	}

	strategy, err := models.MatchStrategyByProposal(*c.Strategies, *p.Strategy)
	if err != nil {
		log.Error().Err(err).Msg("Unable to find strategy for contract")
		return nil, err
	}

	if len(nftIds) == 0 {
		nftIds, err := b.FlowAdapter.GetNFTIds(balance.Addr, &strategy.Contract)
		if err != nil {
			return nil, err
		}

		for _, nftId := range nftIds {
			nft := &models.NFT{
				ID: nftId.(uint64),
			}
			vb.NFTs = append(vb.NFTs, nft)
		}

		doesExist, err := models.DoesNFTExist(b.DB, vb)
		if err != nil {
			return nil, err
		}

		//only if the NFT ID is not already in the DB,
		//do we add the balance
		if !doesExist && err == nil {
			err = models.CreateUserNFTRecord(b.DB, vb)
			balance.NFTCount = len(vb.NFTs)
		}
	}

	return balance, nil
}

func (b *FLOATEvent) TallyVotes(
	votes []*models.VoteWithBalance,
	r *models.ProposalResults,
) (models.ProposalResults, error) {

	for _, v := range votes {
		nftCount := len(v.NFTs)
		r.Results_float[v.Choice] += float64(nftCount) * math.Pow(10, -8)
	}

	return *r, nil
}

func (b *FLOATEvent) GetVoteWeightForBalance(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error) {
	var weight float64
	var ERROR error = fmt.Errorf("this address has no nfts")

	// get the nfts for this address
	var c models.Community
	if err := c.GetCommunityByProposalId(b.DB, proposal.ID); err != nil {
		return 0, err
	}

	var contract = &shared.Contract{
		Name: c.Contract_name,
		Addr: c.Contract_addr,
	}

	nftIds, err := b.FlowAdapter.GetNFTIds(vote.Addr, contract)
	if err != nil {
		return 0, err
	}

	if len(nftIds) == 0 {
		return 0.00, ERROR
	}
	nftCount := len(nftIds)
	weight = float64(nftCount)
	return weight, nil
}

func (s *FLOATEvent) GetVotes(
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

func (s *FLOATEvent) InitStrategy(
	f *shared.FlowAdapter,
	db *shared.Database,
	sc *s.SnapshotClient,
) {
	s.FlowAdapter = f
	s.DB = db
	s.SC = *sc
}
