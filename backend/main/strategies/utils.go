package strategies

import (
	"github.com/DapperCollectives/CAST/backend/main/models"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
)

func FetchNFTBalance(
	db *s.Database,
	fa *s.FlowAdapter,
	balance *models.Balance,
	p *models.Proposal,
) (*models.Balance, error) {

	vb := &models.VoteWithBalance{
		NFTs: []*models.NFT{},
	}

	var c models.Community
	if err := c.GetCommunityByProposalId(db, balance.Proposal_id); err != nil {
		return nil, err
	}

	strategy, err := models.MatchStrategyByProposal(*c.Strategies, *p.Strategy)
	if err != nil {
		log.Error().Err(err).Msg("Unable to find strategy for contract")
		return nil, err
	}

	nftIds, err := fa.GetNFTIds(balance.Addr, &strategy.Contract)
	if err != nil {
		return nil, err
	}

	for _, nftId := range nftIds {
		nft := &models.NFT{
			ID: nftId,
		}
		vb.NFTs = append(vb.NFTs, nft)
	}

	doesExist, err := models.DoesNFTExist(db, vb)
	if err != nil {
		return nil, err
	}

	//only if the NFT ID is not already in the DB,
	//do we add the balance
	if !doesExist && err == nil {
		err = models.CreateUserNFTRecord(db, vb)
		balance.NFTCount = len(vb.NFTs)
	}

	return balance, nil
}

func FetchFTBalance(
	db *s.Database,
	sc s.SnapshotClient,
	b *models.Balance,
	p *models.Proposal,
) (*models.Balance, error) {

	var c models.Community
	if err := c.GetCommunityByProposalId(db, b.Proposal_id); err != nil {
		return nil, err
	}

	if err := b.GetBalanceByAddressAndBlockHeight(db); err != nil && err.Error() != pgx.ErrNoRows.Error() {
		log.Error().Err(err).Msg("error fetching balance from DB")
		return nil, err
	}

	strategy, err := models.MatchStrategyByProposal(*c.Strategies, *p.Strategy)
	if err != nil {
		log.Error().Err(err).Msg("Unable to find strategy for contract")
		return nil, err
	}

	if err := sc.GetAddressBalanceAtBlockHeight(
		b.Addr,
		b.BlockHeight,
		b,
		&strategy.Contract,
	); err != nil {
		log.Error().Err(err).Msg("error fetching balance")
		return nil, err
	}

	if err := b.CreateBalance(db); err != nil {
		log.Error().Err(err).Msg("error creating balance in the DB")
		return nil, err
	}

	return b, nil
}