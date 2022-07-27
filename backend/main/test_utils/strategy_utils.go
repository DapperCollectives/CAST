package test_utils

import (
	"fmt"
	"math"
	"math/rand"
	"strconv"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
)

func (otu *OverflowTestUtils) TallyResultsForTokenWeightedDefault(
	votes []models.VoteWithBalance,
	p *models.ProposalResults,
	maxWeight float64,
) *models.ProposalResults {

	for _, vote := range votes {
		var weight float64

		if vote.PrimaryAccountBalance != nil {
			exceedsMaxWeight := models.CheckForMaxWeight(
				maxWeight,
				*vote.PrimaryAccountBalance,
			)

			if exceedsMaxWeight {
				weight = maxWeight
			} else {
				weight = float64(*vote.PrimaryAccountBalance)
			}

			p.Results[vote.Choice] += int(weight * math.Pow(10, -8))
			p.Results_float[vote.Choice] += weight * math.Pow(10, -8)
		}
	}

	return p
}

func (otu *OverflowTestUtils) TallyResultsForStakedTokenWeightedDefault(
	votes *[]models.VoteWithBalance,
	p *models.ProposalResults,
	maxWeight float64,
) *models.ProposalResults {

	for _, vote := range *votes {
		var weight float64

		if vote.PrimaryAccountBalance != nil {
			exceedsMaxWeight := models.CheckForMaxWeight(
				maxWeight,
				*vote.StakingBalance,
			)

			if exceedsMaxWeight {
				weight = maxWeight
			} else {
				weight = float64(*vote.StakingBalance)
			}

			p.Results[vote.Choice] += int(weight * math.Pow(10, -8))
			p.Results_float[vote.Choice] += weight * math.Pow(10, -8)
		}
	}

	return p
}

func (otu *OverflowTestUtils) TallyResultsForOneAddressOneVote(
	votes *[]models.VoteWithBalance,
	p *models.ProposalResults,
	maxWeight float64,
) *models.ProposalResults {

	for _, v := range *votes {
		p.Results[v.Choice]++
	}

	return p
}

func (otu *OverflowTestUtils) TallyResultsForBalanceOfNfts(
	votes *[]models.VoteWithBalance,
	p *models.ProposalResults,
	maxWeight float64,
) *models.ProposalResults {

	for _, vote := range *votes {
		var weight float64

		if len(vote.NFTs) != 0 {
			nftCount := len(vote.NFTs)
			exceedsMaxWeight := models.CheckForMaxWeight(
				maxWeight,
				uint64(nftCount),
			)

			if exceedsMaxWeight {
				weight = maxWeight
			} else {
				weight = float64(nftCount)
			}

			p.Results[vote.Choice] += int(weight)
			p.Results_float[vote.Choice] += weight
		}
	}

	return p
}

func (otu *OverflowTestUtils) GenerateListOfVotes(proposalId int, count int) []*models.VoteWithBalance {
	votes := make([]*models.VoteWithBalance, count)
	choices := []string{"a", "b"}
	for i := 0; i < count; i++ {
		addr := "0x" + strconv.Itoa(i)
		randomNumber := rand.Intn(2)
		choice := choices[randomNumber]
		v := models.Vote{
			Proposal_id: proposalId, Addr: addr, Choice: choice,
		}

		// Balance is 1 FLOW * index
		balance := 100000000 * (i + 1)
		primary := uint64(balance)
		staking := uint64(balance * 5) // Make this different so staked/reg strats dont have same results
		blockHeight := uint64(0)

		vote := &models.VoteWithBalance{
			Vote:                  v,
			PrimaryAccountBalance: &primary,
			StakingBalance:        &staking,
			BlockHeight:           &blockHeight,
		}

		votes[i] = vote
	}

	return votes
}

func (otu *OverflowTestUtils) GenerateCheatVote(proposalId int, count int) *[]models.VoteWithBalance {
	votes := make([]models.VoteWithBalance, count)
	choices := []string{"a", "b"}
	for i := 0; i < count; i++ {
		addr := "0x" + strconv.Itoa(i)
		randomNumber := rand.Intn(2)
		choice := choices[randomNumber]
		v := models.Vote{
			Proposal_id: proposalId, Addr: addr, Choice: choice,
		}
		// Balance is 1 FLOW * index
		balance := 100000000 * (i + 1)
		primary := uint64(balance)
		staking := uint64(balance * 5) // Make this different so staked/reg strats dont have same results
		blockHeight := uint64(0)

		vote := models.VoteWithBalance{
			Vote:                  v,
			PrimaryAccountBalance: &primary,
			StakingBalance:        &staking,
			BlockHeight:           &blockHeight,
		}

		votes[i] = vote
	}

	return &votes
}

func (otu *OverflowTestUtils) GenerateListOfVotesWithNFTs(
	proposalId int,
	count int,
	contract *shared.Contract,
) ([]*models.VoteWithBalance, error) {

	mintParams := shared.MintParams{
		Recipient:            "user1",
		Description:          "the best NFT",
		Cuts:                 []float64{0.8},
		RoyaltyDescriptions:  []string{"the best NFT"},
		RoyaltyBeneficiaries: []string{"0xf8d6e0586b0a20c7"},
	}

	var votes []*models.VoteWithBalance
	choices := []string{"a", "b"}

	otu.SetupAccountForFlow("account")
	otu.SetupToReceiveRoyalty("account")

	for i := 0; i < count; i++ {
		accountName := "user" + strconv.Itoa(i+1)

		mintParams.Name = accountName
		mintParams.Recipient = accountName

		otu.SetupAccountForNFTs(accountName)
		otu.SetupAccountForFlow(accountName)
		otu.SetupToReceiveRoyalty(accountName)
		otu.MintNFT(mintParams)

		addr := otu.ResolveUser(i + 1)
		randomNumber := rand.Intn(2)
		choice := choices[randomNumber]
		v := models.Vote{
			Proposal_id: proposalId, Addr: addr, Choice: choice,
		}

		nftIds, err := otu.Adapter.GetNFTIds(addr, contract)
		if err != nil {
			return nil, err
		}

		vote := otu.CreateNFTVote(v, nftIds, contract)

		balance := 100000000 * (i + 1)
		primary := uint64(balance)
		staking := uint64(balance * 5)
		blockHeight := uint64(0)

		vote.PrimaryAccountBalance = &primary
		vote.StakingBalance = &staking
		vote.BlockHeight = &blockHeight

		votes = append(votes, &vote)
	}

	return votes, nil
}

func (otu *OverflowTestUtils) GenerateSingleVoteWithNFT(
	proposalId int,
	accountNumber int,
	contract *shared.Contract,
) (*models.VoteWithBalance, error) {
	addr := otu.ResolveUser(1)
	randomNumber := rand.Intn(2)
	choices := []string{"a", "b"}
	choice := choices[randomNumber]
	v := models.Vote{
		Proposal_id: proposalId, Addr: addr, Choice: choice,
	}

	nftIds, err := otu.Adapter.GetNFTIds(addr, contract)
	if err != nil {
		return nil, err
	}

	vote := otu.CreateNFTVote(v, nftIds, contract)
	balance := 100000000 * (accountNumber)
	primary := uint64(balance)
	staking := uint64(balance * 5)
	blockHeight := uint64(0)

	vote.PrimaryAccountBalance = &primary
	vote.StakingBalance = &staking
	vote.BlockHeight = &blockHeight

	return &vote, nil
}

func (otu *OverflowTestUtils) CreateNFTVote(v models.Vote, ids []interface{}, contract *shared.Contract) models.VoteWithBalance {
	nfts := []*models.NFT{}

	for _, id := range ids {
		idUint, err := strconv.ParseUint(id.(string), 10, 64)
		if err != nil {
			fmt.Println(err)
			return models.VoteWithBalance{}
		}

		NFT := models.NFT{
			ID:            idUint,
			Contract_addr: *contract.Addr,
		}
		nfts = append(nfts, &NFT)
	}

	vote := models.VoteWithBalance{
		Vote: v,
		NFTs: nfts,
	}

	return vote
}

func (otu *OverflowTestUtils) SetupAccountForNFTs(account string) {
	otu.O.TransactionFromFile("setup_account_nfts").
		SignProposeAndPayAs(account).
		RunPrintEventsFull()
}

func (otu *OverflowTestUtils) SetupToReceiveRoyalty(account string) {
	otu.O.TransactionFromFile("setup_account_to_receive_royalty").
		SignProposeAndPayAs(account).
		Args(otu.O.Arguments()).
		RunPrintEventsFull()
}

func (otu *OverflowTestUtils) SetupAccountForFlow(account string) {
	otu.O.TransactionFromFile("setup_flow_token_account").
		SignProposeAndPayAs(account).
		RunPrintEventsFull()
}

func (otu *OverflowTestUtils) MintNFT(p shared.MintParams) {
	otu.O.TransactionFromFile("mint_nft").
		SignProposeAndPayAsService().
		Args(otu.O.Arguments().
			Account(p.Recipient).
			String(p.Name).
			String(p.Description).
			String(p.Thumbnail).
			UFix64Array(0.8).
			StringArray("royalties").
			AccountArray(p.Recipient)).
		RunPrintEventsFull()
}

func (otu *OverflowTestUtils) TransferNFT(signer, recipient string, id uint64) {
	otu.O.TransactionFromFile("transfer_nft").
		SignProposeAndPayAs(signer).
		Args(otu.O.Arguments().
			Account(recipient).
			UInt64(id)).
		RunPrintEventsFull()
}
