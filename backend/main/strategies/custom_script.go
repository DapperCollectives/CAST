package strategies

import (
	"fmt"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/rs/zerolog/log"
)

type CustomScript struct {
	shared.StrategyStruct
	DB *shared.Database
}

func (cs *CustomScript) FetchBalance(
	balance *models.Balance,
	p *models.Proposal,
) (*models.Balance, error) {

	v := models.Vote{Proposal_id: balance.Proposal_id, Addr: balance.Addr}
	vb := &models.VoteWithBalance{
		NFTs: []*models.NFT{},
		Vote: v,
	}

	var c models.Community
	if err := c.GetCommunityByProposalId(cs.DB, balance.Proposal_id); err != nil {
		return nil, err
	}

	strategy, err := models.MatchStrategyByProposal(*c.Strategies, *p.Strategy)
	if err != nil {
		log.Error().Err(err).Msg("Unable to find strategy for contract.")
		return nil, err
	}

	if strategy.Contract.Script == nil {
		log.Error().Msg("No custom script name field was found for contract.")
	}

	if err := cs.queryNFTs(*vb, strategy, balance); err != nil {
		return nil, err
	}

	return balance, nil
}

func (cs *CustomScript) queryNFTs(
	vb models.VoteWithBalance,
	strategy models.Strategy,
	balance *models.Balance,
) error {
	scriptName := cs.FlowAdapter.CustomScriptsMap[*strategy.Contract.Script].Src
	scriptPath := fmt.Sprintf("./main/cadence/scripts/custom/%s", scriptName)

	nftIds, err := cs.FlowAdapter.GetNFTIds(
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

	doesExist, err := models.DoesNFTExist(cs.DB, &vb)
	if err != nil {
		return err
	}

	//only if the NFT ID is not already in the DB,
	//do we add the balance
	if !doesExist && err == nil {
		err = models.CreateUserNFTRecord(cs.DB, &vb)
		balance.NFTCount = len(vb.NFTs)
	}

	return err
}

func (cs *CustomScript) TallyVotes(
	votes []*models.VoteWithBalance,
	r *models.ProposalResults,
	proposal *models.Proposal,
) (models.ProposalResults, error) {

	for _, vote := range votes {
		if len(vote.NFTs) != 0 {
			var voteWeight float64

			voteWeight, err := cs.GetVoteWeightForBalance(vote, proposal)
			if err != nil {
				return models.ProposalResults{}, err
			}

			r.Results[vote.Choice] += int(voteWeight)
			r.Results_float[vote.Choice] += voteWeight
		}
	}

	return *r, nil
}

func (cs *CustomScript) GetVoteWeightForBalance(
	vote *models.VoteWithBalance,
	proposal *models.Proposal,
) (float64, error) {
	nftIds, err := models.GetUserNFTs(cs.DB, vote)
	if err != nil {
		log.Error().Err(err).Msg("error in GetVoteWeightForBalance for Custom Script strategy")
		return 0.00, err
	}

	if proposal.Max_weight != nil && float64(len(nftIds)) > *proposal.Max_weight {
		return *proposal.Max_weight, nil
	}

	return float64(len(nftIds)), nil
}

func (cs *CustomScript) GetVotes(
	votes []*models.VoteWithBalance,
	proposal *models.Proposal,
) ([]*models.VoteWithBalance, error) {
	for _, vote := range votes {
		weight, err := cs.GetVoteWeightForBalance(vote, proposal)
		if err != nil {
			return nil, err
		}
		vote.Weight = &weight
	}

	return votes, nil
}

func (cs *CustomScript) RequiresSnapshot() bool {
	return false
}

func (cs *CustomScript) InitStrategy(
	f *shared.FlowAdapter,
	db *shared.Database,
) {
	cs.FlowAdapter = f
	cs.DB = db
}
