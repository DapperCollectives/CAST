package test_utils

import (
	"fmt"
	"math"
	"math/rand"
	"strconv"

	"github.com/brudfyi/flow-voting-tool/main/models"
)

type VoteWithBalance struct {
	models.Vote

	Primary_account_balance uint64 `json:"primaryAccountBalance"`
	Staking_balance         uint64 `json:"stakingBalance"`
	Block_height            uint64 `json:"blockHeight"`
}

func (otu *OverflowTestUtils) TallyResultsForTokenWeightedDefault(proposalId int, votes *[]VoteWithBalance) *models.ProposalResults {
	r := models.ProposalResults{Proposal_id: proposalId}

	r.Results_float = map[string]float64{}
	r.Results_float["a"] = 0
	r.Results_float["b"] = 0

	for _, v := range *votes {
		r.Results_float[v.Choice] += float64(v.Primary_account_balance) * math.Pow(10, -8)
	}

	return &r
}

func (otu *OverflowTestUtils) TallyResultsForStakedTokenWeightedDefault(proposalId int, votes *[]VoteWithBalance) *models.ProposalResults {
	r := models.ProposalResults{Proposal_id: proposalId}

	r.Results_float = map[string]float64{}
	r.Results_float["a"] = 0
	r.Results_float["b"] = 0

	for _, v := range *votes {
		r.Results_float[v.Choice] += float64(v.Staking_balance) * math.Pow(10, -8)
	}

	return &r
}

func (otu *OverflowTestUtils) TallyResultsForOneAddressOneVote(proposalId int, votes *[]VoteWithBalance) *models.ProposalResults {
	r := models.ProposalResults{Proposal_id: proposalId}

	r.Results = map[string]int{}
	r.Results["a"] = 0
	r.Results["b"] = 0

	for _, v := range *votes {
		r.Results[v.Choice]++
	}

	return &r
}

func (otu *OverflowTestUtils) TallyResultsForBalanceOfNfts(proposalId int, votes *[]VoteWithBalance) *models.ProposalResults {
	r := models.ProposalResults{Proposal_id: proposalId}

	r.Results = map[string]int{}
	r.Results["a"] = 0
	r.Results["b"] = 0

	return &r
}

func (otu *OverflowTestUtils) GenerateListOfVotes(proposalId int, count int) *[]VoteWithBalance {
	votes := make([]VoteWithBalance, count)
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

		vote := VoteWithBalance{
			Vote:                    v,
			Primary_account_balance: uint64(balance),
			Staking_balance:         uint64(balance * 5), // Make this different so staked/reg strats dont have same results
			Block_height:            uint64(0),
		}

		votes[i] = vote
	}

	return &votes
}

func (otu *OverflowTestUtils) CreateNFTCollection(account string) *OverflowTestUtils {
	otu.O.TransactionFromFile("create_collection").
		SignProposeAndPayAs(account).
		RunPrintEventsFull()

	return otu
}

func (otu *OverflowTestUtils) MintNFT(account string) *OverflowTestUtils {
	otu.O.TransactionFromFile("mint_nft").
		SignProposeAndPayAsService().
		Args(otu.O.Arguments().
			Account(account).
			String("name").
			String("description").
			String("thumbnail")).
		RunPrintEventsFull()

	return otu
}

func (otu *OverflowTestUtils) GetNFTs(account string) {
	result := otu.O.ScriptFromFile("get_nfts").
		Args(otu.O.Arguments().Account(account)).
		RunFailOnError()

	fmt.Printf("get NFTs result :  %+v\n", result)

	return
}
