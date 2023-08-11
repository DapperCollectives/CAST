package test_utils

import (
	"fmt"
	"math/rand"
	"strconv"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/DapperCollectives/CAST/backend/main/shared"
)

type dummyBalance struct {
	Primary     uint64
	Staking     uint64
	BlockHeight uint64
}

func (otu *OverflowTestUtils) GenerateListOfVotes(proposalId int, count int) []*models.VoteWithBalance {
	votes := make([]*models.VoteWithBalance, count)
	choices := []string{"a", "b"}
	for i := 0; i < count; i++ {
		addr := "0x" + strconv.Itoa(i+1)
		randomNumber := rand.Intn(2)
		choice := choices[randomNumber]
		c := make([]string, 1)
		c[0] = choice
		v := models.Vote{
			Proposal_id: proposalId, Addr: addr, Choices: c,
		}

		// Balance is 1 FLOW * index
		balance := 100000000 * (i + 1)
		dummyBal := createDummyBalance(balance)

		vote := &models.VoteWithBalance{
			Vote:                  v,
			PrimaryAccountBalance: &dummyBal.Primary,
			StakingBalance:        &dummyBal.Staking,
			BlockHeight:           &dummyBal.BlockHeight,
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
		c := make([]string, 1)
		c[0] = choice
		v := models.Vote{
			Proposal_id: proposalId, Addr: addr, Choices: c,
		}
		// Balance is 1 FLOW * index
		balance := 100000000 * (i + 1)
		dummyBal := createDummyBalance(balance)

		vote := models.VoteWithBalance{
			Vote:                  v,
			PrimaryAccountBalance: &dummyBal.Primary,
			StakingBalance:        &dummyBal.Staking,
			BlockHeight:           &dummyBal.BlockHeight,
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
		c := make([]string, 1)
		c[0] = choice
		v := models.Vote{
			Proposal_id: proposalId, Addr: addr, Choices: c,
		}

		scriptPath := "./main/cadence/scripts/get_nfts_ids.cdc"
		nftIds, err := otu.Adapter.GetNFTIds(
			addr,
			contract,
			scriptPath,
		)
		if err != nil {
			return nil, err
		}

		vote := otu.CreateNFTVote(v, nftIds, contract)

		balance := 100000000 * (i + 1)
		dummyBal := createDummyBalance(balance)

		vote.PrimaryAccountBalance = &dummyBal.Primary
		vote.StakingBalance = &dummyBal.Staking
		vote.BlockHeight = &dummyBal.BlockHeight

		votes = append(votes, &vote)
	}

	return votes, nil
}

func createDummyBalance(balance int) dummyBalance {
	primary := uint64(balance)
	staking := uint64(balance * 5)
	blockHeight := uint64(0)

	return dummyBalance{
		Primary:     primary,
		Staking:     staking,
		BlockHeight: blockHeight,
	}
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
	c := make([]string, 1)
	c[0] = choice
	v := models.Vote{
		Proposal_id: proposalId, Addr: addr, Choices: c,
	}

	scriptPath := "./main/cadence/scripts/get_nfts_ids.cdc"
	nftIds, err := otu.Adapter.GetNFTIds(
		addr,
		contract,
		scriptPath,
	)
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

func (otu *OverflowTestUtils) TransferFlowTokens(from string, to string, amount float64) {
	otu.O.TransactionFromFile("send_flow").
		SignProposeAndPayAs(from).
		Args(otu.O.Arguments().
			UFix64(amount).
			Account(to)).
		Run()
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
