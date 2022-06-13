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

type BalanceOfNfts struct {
	FlowAdapter *shared.FlowAdapter
}

func (s *BalanceOfNfts) FetchBalance(db *s.Database, b *models.Balance, sc *s.SnapshotClient) (*models.Balance, error) {

	//swap this function out for the following
	// getVote SQL
	// if no vote exists look up the balance with the script
	// and write to DB

	//create new vote with balance

	vb := &models.VoteWithBalance{
		NFTs: []*models.NFT{},
	}

	var c models.Community
	if err := c.GetCommunityByProposalId(db, b.Proposal_id); err != nil {
		return nil, err
	}

	nftIds, err := models.GetUserNFTs(db, vb)
	if err != nil {
		log.Error().Err(err).Msg("error getting user nfts")
		return nil, err
	}

	// get the communityID
	var contract = &shared.Contract{
		Name: c.Contract_name,
		Addr: c.Contract_addr,
	}

	fmt.Printf("contract name: %v\n", contract.Name)

	if len(nftIds) == 0 {
		//nftIds := shared.GetNFTIds(b.Addr, contract)
		// add create function
	}

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

func (s *BalanceOfNfts) TallyVotes(votes []*models.VoteWithBalance, proposalId int) (models.ProposalResults, error) {
	var r models.ProposalResults
	r.Results_float = map[string]float64{}
	r.Results_float["a"] = 0
	r.Results_float["b"] = 0

	for _, v := range votes {
		//print the length of v.NFTs
		nftCount := len(v.NFTs)
		r.Results_float[v.Choice] += float64(nftCount) * math.Pow(10, -8)
	}

	r.Proposal_id = proposalId

	return r, nil
}

func (s *BalanceOfNfts) GetVoteWeightForBalance(vote *models.VoteWithBalance, proposal *models.Proposal) (float64, error) {
	var weight float64
	var ERROR error = fmt.Errorf("this address has no nfts")

	if len(vote.NFTs) == 0 {
		return 0.00, ERROR
	}
	nftCount := len(vote.NFTs)
	weight = float64(nftCount) * math.Pow(10, -8)
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
