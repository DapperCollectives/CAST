package test_utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"time"

	"github.com/brudfyi/flow-voting-tool/main/models"
)

type PaginatedResponseWithUser struct {
	Data         []models.CommunityUser `json:"data"`
	Start        int                    `json:"start"`
	Count        int                    `json:"count"`
	TotalRecords int                    `json:"totalRecords"`
	Next         int                    `json:"next"`
}

var AdminAddr = "0xf8d6e0586b0a20c7"
var UserOneAddr = "0x01cf0e2f2f715450"

var nameUpdated = "TestDAO - updated"
var category = "dao"
var logo = "toad.jpeg"
var logoUpdated = "toad-updated.jpeg"
var slug = "test-slug"
var body = "<html>test body</html>"

var banner = "banner"
var website = "website"
var twitter = "twitter"
var github = "github"
var discord = "discord"
var instagram = "instagram"
var termsAndConditions = "termsAndConditions"

var DefaultCommunity = models.Community{
	Name: "TestDAO", Category: &category, Body: &body, Creator_addr: "<replace>", Logo: &logo, Slug: &slug,
}

var UpdatedCommunity = models.Community{
	Name: nameUpdated, Logo: &logoUpdated, Banner_img_url: &banner,
	Website_url: &website, Twitter_url: &twitter, Github_url: &github, Discord_url: &discord,
	Instagram_url: &instagram, Terms_and_conditions_url: &termsAndConditions,
}

func (otu *OverflowTestUtils) GenerateCommunityPayload(signer string, payload *models.Community) *models.Community {

	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", signer))
	signingAddr := fmt.Sprintf("0x%s", account.Address().String())
	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
	compositeSignatures := otu.GenerateCompositeSignatures(signer, timestamp)

	payload.Timestamp = timestamp
	payload.Composite_signatures = compositeSignatures
	payload.Signing_addr = &signingAddr

	return payload
}

func (otu *OverflowTestUtils) GenerateCommunityStruct(accountName string) *models.Community {
	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", accountName))

	// this does a deep copy
	community := DefaultCommunity
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

func (otu *OverflowTestUtils) GetCommunityUsersAPI(id int) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(id)+"/users", nil)
	response := otu.ExecuteRequest(req)
	return response
}

// func GenerateValidUpdateCommunityPayload(addr string) []byte {
// 	// this does a deep copy
// 	community := ValidUpdateCommunityStruct

// 	community.Signing_addr = addr
// 	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
// 	community.Timestamp = timestamp
// 	compositeSignatures := SignMessage(ServiceAccountAddress, ValidServiceAccountKey, timestamp)

// 	community.Composite_signatures = compositeSignatures

// 	jsonStr, _ := json.Marshal(community)
// 	fmt.Printf("payload: %v\n", string(jsonStr))
// 	return []byte(jsonStr)
