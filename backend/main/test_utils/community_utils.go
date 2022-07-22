package test_utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"time"

	"github.com/DapperCollectives/CAST/backend/main/models"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
)

type PaginatedResponseWithUser struct {
	Data         []models.CommunityUser `json:"data"`
	Start        int                    `json:"start"`
	Count        int                    `json:"count"`
	TotalRecords int                    `json:"totalRecords"`
	Next         int                    `json:"next"`
}

type PaginatedResponseWithCommunity struct {
	Data         []models.Community `json:"data"`
	Start        int                    `json:"start"`
	Count        int                    `json:"count"`
	TotalRecords int                    `json:"totalRecords"`
	Next         int                    `json:"next"`
}

type PaginatedResponseWithUserCommunity struct {
	Data         []models.UserCommunity `json:"data"`
	Start        int                    `json:"start"`
	Count        int                    `json:"count"`
	TotalRecords int                    `json:"totalRecords"`
	Next         int                    `json:"next"`
}

type PaginatedResponseWithUserType struct {
	Data         []models.CommunityUserType `json:"data"`
	Start        int                        `json:"start"`
	Count        int                        `json:"count"`
	TotalRecords int                        `json:"totalRecords"`
	Next         int                        `json:"next"`
}

type PaginatedResponseWithLeaderboardUser struct {
	Data         models.LeaderboardPayload `json:"data"`
	Start        int                       `json:"start"`
	Count        int                       `json:"count"`
	TotalRecords int                       `json:"totalRecords"`
	Next         int                       `json:"next"`
}

var (
	AdminAddr   = "0xf8d6e0586b0a20c7"
	UserOneAddr = "0x01cf0e2f2f715450"

	nameUpdated    = "TestDAO - updated"
	category       = "dao"
	logo           = "toad.jpeg"
	logoUpdated    = "0xf8d6e0586b0a20c7"
	slug           = "test-slug"
	body           = "<html>test body</html>"
	onlyAuthors    = true
	notOnlyAuthors = false

	banner             = "banner"
	website            = "website"
	twitter            = "twitter"
	github             = "github"
	discord            = "discord"
	instagram          = "instagram"
	termsAndConditions = "termsAndConditions"

	flowContractName = "FlowToken"
	flowContractAddr = "0x0ae53cb6e3f42a79"
	flowPublicPath   = "flowTokenBalance"
	threshold        = 0.0000069

	exampleNFTName       = "ExampleNFT"
	exampleNFTAddr       = "0xf8d6e0586b0a20c7"
	exampleNFTPublicPath = "exampleNFTCollection"
	tokenWeighted        = "token-weighted-default"
	stakedWeighted       = "staked-token-weighted-default"

	defaultStrategy = models.Strategy{
		Name: &tokenWeighted,
		Contract: s.Contract{
			Name:        &flowContractName,
			Addr:        &flowContractAddr,
			Public_path: &flowPublicPath,
		},
	}

	stakedStrategy = models.Strategy{
		Name: &stakedWeighted,
		Contract: s.Contract{
			Name:        &flowContractName,
			Addr:        &flowContractAddr,
			Public_path: &flowPublicPath,
		},
	}
	strategies = []models.Strategy{defaultStrategy}

	updatedStrategies = []models.Strategy{
		defaultStrategy,
		stakedStrategy,
	}

	DefaultCommunity = models.Community{
		Name:                   "TestDAO",
		Category:               &category,
		Body:                   &body,
		Creator_addr:           "<replace>",
		Logo:                   &logo,
		Slug:                   &slug,
		Strategies:             &strategies,
		Only_authors_to_submit: &onlyAuthors,
	}

	CommunityWithThreshold = models.Community{
		Name:                   "With Threshold",
		Category:               &category,
		Body:                   &body,
		Creator_addr:           "<replace>",
		Logo:                   &logo,
		Slug:                   &slug,
		Contract_name:          &flowContractName,
		Contract_addr:          &flowContractAddr,
		Public_path:            &flowPublicPath,
		Threshold:              &threshold,
		Only_authors_to_submit: &notOnlyAuthors,
	}

	CommunityWithNFT = models.Community{
		Name:                   "With NFT Contract",
		Category:               &category,
		Body:                   &body,
		Creator_addr:           "<replace>",
		Logo:                   &logo,
		Slug:                   &slug,
		Contract_name:          &exampleNFTName,
		Contract_addr:          &exampleNFTAddr,
		Public_path:            &exampleNFTPublicPath,
		Only_authors_to_submit: &notOnlyAuthors,
	}

	UpdatedCommunity = models.Community{
		Name:                     nameUpdated,
		Logo:                     &logoUpdated,
		Banner_img_url:           &banner,
		Website_url:              &website,
		Twitter_url:              &twitter,
		Github_url:               &github,
		Discord_url:              &discord,
		Instagram_url:            &instagram,
		Strategies:               &updatedStrategies,
		Terms_and_conditions_url: &termsAndConditions,
	}
)

func (otu *OverflowTestUtils) GenerateCommunityPayload(signer string, payload *models.Community) *models.Community {

	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", signer))
	signingAddr := fmt.Sprintf("0x%s", account.Address().String())
	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
	compositeSignatures := otu.GenerateCompositeSignatures(signer, timestamp)

	payload.Timestamp = timestamp
	payload.Composite_signatures = compositeSignatures
	payload.Signing_addr = &signingAddr
	if payload.Strategies == nil {
		payload.Strategies = &strategies
	}

	return payload
}

func (otu *OverflowTestUtils) GenerateCommunityStruct(accountName string) *models.Community {
	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", accountName))

	// this does a deep copy
	community := DefaultCommunity
	community.Creator_addr = "0x" + account.Address().String()
	return &community
}

func (otu *OverflowTestUtils) GenerateCommunityWithThresholdStruct(accountName string) *models.Community {
	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", accountName))

	// this does a deep copy
	community := CommunityWithThreshold
	community.Creator_addr = "0x" + account.Address().String()
	return &community
}

func (otu *OverflowTestUtils) GenerateCommunityWithNFTContractStruct(accountName string) *models.Community {
	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", accountName))

	// this does a deep copy
	community := CommunityWithNFT
	community.Creator_addr = "0x" + account.Address().String()
	return &community
}

func (otu *OverflowTestUtils) CreateCommunityAPI(community *models.Community) *httptest.ResponseRecorder {
	json, _ := json.Marshal(community)
	req, _ := http.NewRequest("POST", "/communities", bytes.NewBuffer(json))
	req.Header.Set("Content-Type", "application/json")

	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) CreateCommunityDB(community *models.Community) error {
	return community.CreateCommunity(otu.A.DB)
}

func (otu *OverflowTestUtils) UpdateCommunityAPI(id int, payload *models.Community) *httptest.ResponseRecorder {
	json, _ := json.Marshal(payload)
	req, _ := http.NewRequest("PATCH", "/communities/"+strconv.Itoa(id), bytes.NewBuffer(json))
	req.Header.Set("Content-Type", "application/json")

	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) GetCommunityAPI(id int) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(id), nil)
	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) GetCommunitiesForHomepageAPI() *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/communities-for-homepage", nil)
	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) GetCommunityLeaderboardAPI(id int) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(id)+"/leaderboard", nil)
	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) GetCommunityLeaderboardAPIWithCurrentUser(id int, addr string) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(id)+"/leaderboard?addr="+addr, nil)
	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) GetCommunityLeaderboardAPIWithPaging(id, start, count int) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(id)+"/leaderboard?start="+strconv.Itoa(start)+"&count="+strconv.Itoa(count), nil)
	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) GetCommunityUsersAPI(id int) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(id)+"/users", nil)
	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) GetCommunityUsersAPIByType(id int, userType string) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(id)+"/users/type/"+userType, nil)
	response := otu.ExecuteRequest(req)
	return response
}
