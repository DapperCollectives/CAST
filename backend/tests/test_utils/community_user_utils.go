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
)

var DefaultAuthor = models.CommunityUser{
	Community_id: 1,
	Addr:         "0x01cf0e2f2f715450",
	User_type:    "author",
}

func (otu *OverflowTestUtils) GenerateCommunityUserPayload(signer string, user *models.CommunityUser) *models.CommunityUserPayload {

	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", signer))
	signingAddr := fmt.Sprintf("0x%s", account.Address().String())
	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
	compositeSignatures := otu.GenerateCompositeSignatures(signer, timestamp)

	var signedPayload = models.CommunityUserPayload{
		CommunityUser:        *user,
		Timestamp:            timestamp,
		Composite_signatures: compositeSignatures,
		Signing_addr:         signingAddr,
	}

	return &signedPayload
}

func (otu *OverflowTestUtils) GenerateCommunityUserStruct(accountName string, userType string) *models.CommunityUser {
	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", accountName))

	// this does a deep copy
	communityUser := models.CommunityUser{
		Community_id: 1,
		Addr:         "0x" + account.Address().String(),
		User_type:    userType,
	}

	return &communityUser
}

func (otu *OverflowTestUtils) CreateCommunityUserAPI(id int, payload *models.CommunityUserPayload) *httptest.ResponseRecorder {
	json, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "/communities/"+strconv.Itoa(id)+"/users", bytes.NewBuffer(json))
	req.Header.Set("Content-Type", "application/json")

	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) GetUserCommunitiesAPI(addr string) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/users/"+addr+"/communities", nil)
	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) GetCommunityUserProposalsAPI(addr string) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/users/"+addr+"/proposals", nil)
	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) GetCommunityUserProposalsAPIWithFilter(addr string, filter string) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/users/"+addr+"/proposals?filter="+filter, nil)
	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) DeleteUserFromCommunityAPI(id int, addr string, userType string, payload *models.CommunityUserPayload) *httptest.ResponseRecorder {
	json, _ := json.Marshal(payload)
	req, _ := http.NewRequest("DELETE", "/communities/"+strconv.Itoa(id)+"/users/"+addr+"/"+userType, bytes.NewBuffer(json))
	req.Header.Set("Content-Type", "application/json")
	response := otu.ExecuteRequest(req)
	return response
}

func (otu *OverflowTestUtils) GetCanUserCreateProposalAPI(id int, addr string) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(id)+"/can-user-create-proposal/"+addr, nil)
	response := otu.ExecuteRequest(req)
	return response
}
