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

	// Create VoteWithBalance struct to call CreateUserNFTRecord
	v := &models.Vote{
		Proposal_id: p.ID,
		Addr:        balance.Addr,
	}
	vb := &models.VoteWithBalance{
		NFTs: []*models.NFT{},
		Vote: *v,
	}

	var c models.Community
	if err := c.GetCommunityByProposalId(b.DB, balance.Proposal_id); err != nil {
		return nil, err
	}

	floatIds, err := b.FlowAdapter.GetFLOATsForEventId(balance.Addr, *p.Float_event_id)
	if err != nil {
		return nil, err
	}

	// Check if each FLOAT ID exists already.  If it doesnt, append to list of NFTs
	for _, floatId := range floatIds {
		doesExist, err := p.DoesNFTExistForProposal(b.DB, floatId)
		if err != nil {
			log.Error().Err(err).Msgf("error calling p.DoesNFTExistForProposal")
			return nil, err
		}

		// Append if ID doesnt exist
		if !doesExist {
			nft := &models.NFT{
				ID: floatId,
			}
			vb.NFTs = append(vb.NFTs, nft)
		}
	}

	if len(vb.NFTs) > 0 {
		err = models.CreateUserNFTRecord(b.DB, vb)
	}
	if err != nil {
		log.Error().Err(err).Msgf("error calling CreateUserNFTRecord")
		return nil, err
	}
	balance.NFTCount = len(vb.NFTs)

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
