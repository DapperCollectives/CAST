package strategies

import (
	"fmt"
	"math"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/rs/zerolog/log"
)

type BalanceOfNfts struct {
	shared.StrategyStruct
}

func (b *BalanceOfNfts) FetchBalance(
	db *s.Database,
	balance *models.Balance,
	sc *s.SnapshotClient,
) (*models.Balance, error) {

	vb := &models.VoteWithBalance{
		NFTs: []*models.NFT{},
	}

	var c models.Community
	if err := c.GetCommunityByProposalId(db, balance.Proposal_id); err != nil {
		return nil, err
	}

	nftIds, err := models.GetUserNFTs(db, vb)
	if err != nil {
		log.Error().Err(err).Msg("error getting user nfts")
		return nil, err
	}

	var contract = &shared.Contract{
		Name: c.Contract_name,
		Addr: c.Contract_addr,
	}

	if len(nftIds) == 0 {
		nftIds, err := b.FlowAdapter.GetNFTIds(balance.Addr, contract)
		if err != nil {
			return nil, err
		}

		for _, nftId := range nftIds {
			nft := &models.NFT{
				ID: nftId.(uint64),
			}
			vb.NFTs = append(vb.NFTs, nft)
		}

		doesExist, err := models.DoesNFTExist(db, vb)
		if err != nil {
			return nil, err
		}

		if !doesExist && err == nil {
			err = models.CreateUserNFTRecord(db, vb)
			balance.NFTCount = len(vb.NFTs)
		}
	}

	return balance, nil
}

func (b *BalanceOfNfts) TallyVotes(
	votes []*models.VoteWithBalance,
	r *models.ProposalResults,
) (models.ProposalResults, error) {

	for _, v := range votes {
		//print the length of v.NFTs
		nftCount := len(v.NFTs)
		r.Results_float[v.Choice] += float64(nftCount) * math.Pow(10, -8)
	}

	return *r, nil
}

func (b *BalanceOfNfts) GetVoteWeightForBalance(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error) {
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

func (s *BalanceOfNfts) GetVotes(
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

func (b *BalanceOfNfts) InitStrategy(f *shared.FlowAdapter, db *shared.Database) {
	b.FlowAdapter = f
	b.DB = db
}
