package test_utils

import (
	"fmt"
	"strconv"
	"time"

	"github.com/brudfyi/flow-voting-tool/main/models"
	"github.com/brudfyi/flow-voting-tool/main/shared"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
)

// Valid/Invalid service account key is based on the flow.json file in this repo,
// and assumes you are running the emulator from this repo
var ServiceAccountAddress = "0xf8d6e0586b0a20c7"
var ValidServiceAccountKey = "63bff10bd6186b7d97c8e2898941c93d5d33a830b0ac9b758e216024b7bf7957"
var InvalidServiceAccountKey = "5687d75f957bf64591b55eb19227706e3c8712c1387225b87aff072585ea8e51"

//////////
// VOTES
//////////

// func GenerateValidVotePayload(proposalId int, choice string) []byte {
// 	timestamp := time.Now().UnixNano() / int64(time.Millisecond)
// 	hexChoice := hex.EncodeToString([]byte(choice))
// 	message := "1:" + hexChoice + ":" + fmt.Sprint(timestamp)
// 	compositeSignatures := SignMessage(ServiceAccountAddress, ValidServiceAccountKey, message)

// 	vote := models.Vote{Proposal_id: proposalId, Addr: ServiceAccountAddress, Choice: choice,
// 		Composite_signatures: compositeSignatures, Message: message}

// 	jsonStr, _ := json.Marshal(vote)
// 	return []byte(jsonStr)
// }

func (otu *OverflowTestUtils) AddDummyVotesAndBalances(votes *[]VoteWithBalance) {
	for _, vote := range *votes {
		// Insert Vote
		_, err := otu.A.DB.Conn.Exec(otu.A.DB.Context, `
			INSERT INTO votes(proposal_id, addr, choice, composite_signatures, message)
			VALUES($1, $2, $3, $4, $5)
		`, vote.Vote.Proposal_id, vote.Vote.Addr, vote.Vote.Choice, "[]", "__msg__")
		if err != nil {
			log.Error().Err(err).Msg("AddDummyVotesAndBalances DB err - votes")
		}

		// Insert Balance
		_, err = otu.A.DB.Conn.Exec(otu.A.DB.Context, `
			INSERT INTO balances(id, addr, primary_account_balance, secondary_address, secondary_account_balance, staking_balance, script_result, stakes, block_height)
			VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`, uuid.New(), vote.Addr, vote.Primary_account_balance, "0x0", 0, vote.Staking_balance, "SUCCESS", []string{}, vote.Block_height)
		if err != nil {
			log.Error().Err(err).Msg("AddDummyVotesAndBalances DB err - balances")
		}
	}
}

func (otu *OverflowTestUtils) AddVotes(pId int, count int) {
	if count < 1 {
		count = 1
	}
	var addr string
	for i := 1; i < count+1; i++ {
		accountName := "emulator-user" + strconv.Itoa(i)
		account, _ := otu.O.State.Accounts().ByName(accountName)
		addr = "0x" + account.Address().String()

		_, err := otu.A.DB.Conn.Exec(otu.A.DB.Context, `
			INSERT INTO votes(proposal_id, addr, choice, composite_signatures, message)
			VALUES($1, $2, $3, $4, $5)
			`, pId, addr, "yes", "[]", "__msg__")
		if err != nil {
			log.Error().Err(err).Msg("addVotes DB err")
		}
	}
}

//////////////
// COMMUNITIES
//////////////

func (otu *OverflowTestUtils) AddCommunities(count int) []int {
	if count < 1 {
		count = 1
	}
	retIds := []int{}
	for i := 0; i < count; i++ {
		community := otu.GenerateCommunityStruct("account")
		if err := community.CreateCommunity(otu.A.DB); err != nil {
			fmt.Printf("error in otu.AddCommunities")
		}

		id := community.ID
		retIds = append(retIds, id)
	}
	return retIds
}

func (otu *OverflowTestUtils) AddCommunitiesWithUsers(count int, signer string) []int {
	if count < 1 {
		count = 1
	}
	retIds := []int{}
	for i := 0; i < count; i++ {
		community := otu.GenerateCommunityStruct(signer)
		if err := community.CreateCommunity(otu.A.DB); err != nil {
			fmt.Printf("error in otu.AddCommunities")
		}
		// Add community_user roles for the creator
		models.GrantRolesToCommunityCreator(otu.A.DB, community.Creator_addr, community.ID)

		id := community.ID
		retIds = append(retIds, id)
	}
	return retIds
}

func (otu *OverflowTestUtils) AddCommunitiesWithUsersAndThreshold(count int, signer string) []int {
	if count < 1 {
		count = 1
	}
	retIds := []int{}
	for i := 0; i < count; i++ {
		community := otu.GenerateCommunityWithThresholdStruct(signer)
		if err := community.CreateCommunityWithContract(otu.A.DB); err != nil {
			fmt.Printf("error in otu.CreateCommunityWithContract: %v", err)
		}
		// Add community_user roles for the creator
		models.GrantRolesToCommunityCreator(otu.A.DB, community.Creator_addr, community.ID)

		id := community.ID
		retIds = append(retIds, id)
	}
	return retIds
}

func (otu *OverflowTestUtils) AddProposals(cId int, count int) []int {
	if count < 1 {
		count = 1
	}
	retIds := []int{}
	for i := 0; i < count; i++ {
		proposal := otu.GenerateProposalStruct("account", cId)
		if err := proposal.CreateProposal(otu.A.DB); err != nil {
			fmt.Printf("error in otu.AddProposals")
			fmt.Printf("err: %v\n", err.Error())
		}

		retIds = append(retIds, proposal.ID)
	}
	return retIds
}

func (otu *OverflowTestUtils) AddProposalsForStrategy(cId int, strategy string, count int) []int {
	if count < 1 {
		count = 1
	}
	retIds := []int{}
	for i := 0; i < count; i++ {
		proposal := otu.GenerateProposalStruct("account", cId)
		proposal.Strategy = &strategy
		if err := proposal.CreateProposal(otu.A.DB); err != nil {
			fmt.Printf("error in otu.AddProposals")
			fmt.Printf("err: %v\n", err.Error())
		}

		retIds = append(retIds, proposal.ID)
	}
	return retIds
}

func (otu *OverflowTestUtils) AddActiveProposals(cId int, count int) []int {
	if count < 1 {
		count = 1
	}
	retIds := []int{}
	for i := 0; i < count; i++ {
		proposal := otu.GenerateProposalStruct("account", cId)
		proposal.Start_time = time.Now().AddDate(0, -1, 0)
		if err := proposal.CreateProposal(otu.A.DB); err != nil {
			fmt.Printf("error in otu.AddActiveProposals")
		}

		retIds = append(retIds, proposal.ID)
	}
	return retIds
}

func (otu *OverflowTestUtils) AddLists(cId int, count int) []int {
	if count < 1 {
		count = 1
	}
	retIds := []int{}
	for i := 0; i < count; i++ {
		list := otu.GenerateBlockListStruct(cId)
		if err := list.CreateList(otu.A.DB); err != nil {
			fmt.Printf("error in otu.AddLists: %v\n", err.Error())
		}
		retIds = append(retIds, list.ID)
	}
	return retIds
}

/////////////////////
// COMMUNITY_USERS //
/////////////////////

// var DefaultUserType = "member"
// var DefaultCommunityUserStruct = models.CommunityUser{
// 	Addr:      ServiceAccountAddress,
// 	User_type: DefaultUserType,
// }

// func (otu *OverflowTestUtils) GenerateValidCommunityUserPayload(communityId int, userAccount string, signerAccount string, userType string) []byte {

// 	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))

// 	compositeSignatures := otu.GenerateCompositeSignatures(signerAccount, timestamp)

// 	communityUser := DefaultCommunityUserStruct
// 	communityUser.Community_id = communityId

// 	payload := models.CommunityUserPayload{
// 		CommunityUser:        communityUser,
// 		Signing_addr:         DefaultCommunityUserStruct.Addr,
// 		Timestamp:            timestamp,
// 		Composite_signatures: compositeSignatures,
// 	}
// 	jsonStr, _ := json.Marshal(payload)
// 	return []byte(jsonStr)
// }

// func (otu *OverflowTestUtils) CreateCommunityUser(communityId int, payload []byte) *httptest.ResponseRecorder {
// 	req, _ := http.NewRequest("POST", "/communities/"+strconv.Itoa(communityId)+"/users", bytes.NewBuffer(payload))
// 	req.Header.Set("Content-Type", "application/json")
// 	response := executeRequest(req)
// }

// func GenerateValidDeleteCommunityUserPayload(communityId int) []byte {
// 	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
// 	compositeSignatures := SignMessage(ServiceAccountAddress, ValidServiceAccountKey, timestamp)

// 	communityUser := DefaultCommunityUserStruct
// 	communityUser.Community_id = communityId

// 	payload := models.CommunityUserPayload{
// 		CommunityUser:        communityUser,
// 		Signing_addr:         DefaultCommunityUserStruct.Addr,
// 		Timestamp:            timestamp,
// 		Composite_signatures: compositeSignatures,
// 	}
// 	jsonStr, _ := json.Marshal(payload)
// 	return []byte(jsonStr)
// }

//////////
// UTILS
//////////

func (otu *OverflowTestUtils) GenerateCompositeSignatures(account string, message string) *[]shared.CompositeSignature {
	sigString, _ := otu.O.SignUserMessage(account, message)
	flowAcct, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", account))
	compositeSignature := shared.CompositeSignature{
		Addr:      flowAcct.Address().String(),
		Key_id:    0,
		Signature: sigString,
	}

	compositeSignatures := make([]shared.CompositeSignature, 1)
	compositeSignatures[0] = compositeSignature

	return &compositeSignatures
}
