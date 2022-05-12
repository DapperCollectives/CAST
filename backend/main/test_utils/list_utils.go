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

/////////
// Lists
/////////

var DefaultListType = "block"
var DefaultListAddresses = []string{"0x01", "0x02", "0x03"}
var DefaultListStruct = models.List{
	Addresses: DefaultListAddresses,
	List_type: &DefaultListType,
}
var DefaultListPayload = models.ListPayload{
	List: DefaultListStruct,
}

func (otu *OverflowTestUtils) GetListsForCommunityAPI(communityId int) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(communityId)+"/lists", nil)
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) GetListByIdAPI(listId int) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", "/lists/"+strconv.Itoa(listId), nil)
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) CreateListAPI(payload *models.ListPayload) *httptest.ResponseRecorder {
	json, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "/communities/"+strconv.Itoa(payload.Community_id)+"/lists", bytes.NewBuffer(json))
	req.Header.Set("Content-Type", "application/json")
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) AddAddressesToListAPI(listId int, payload *models.ListPayload) *httptest.ResponseRecorder {
	json, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "/lists/"+strconv.Itoa(listId)+"/add", bytes.NewBuffer(json))
	req.Header.Set("Content-Type", "application/json")
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) RemoveAddressesFromListAPI(listId int, payload *models.ListPayload) *httptest.ResponseRecorder {
	json, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "/lists/"+strconv.Itoa(listId)+"/remove", bytes.NewBuffer(json))
	req.Header.Set("Content-Type", "application/json")
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) GenerateBlockListStruct(communityId int) *models.List {
	list := DefaultListStruct
	list.Community_id = communityId
	return &list
}

func (otu *OverflowTestUtils) GenerateBlockListPayload(signer string, list *models.List) *models.ListPayload {
	var timestamp = fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
	compositeSigs := otu.GenerateCompositeSignatures(signer, timestamp)

	payload := models.ListPayload{
		List: *list,
	}
	payload.Composite_signatures = compositeSigs
	payload.Timestamp = timestamp
	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", signer))
	payload.Signing_addr = fmt.Sprintf("0x%s", account.Address().String())

	return &payload
}

func (otu *OverflowTestUtils) GenerateUpdateListPayload(listId, communityId int, signer string) *models.ListPayload {
	var timestamp = fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
	signature := otu.GenerateCompositeSignatures(signer, timestamp)

	payload := DefaultListPayload
	payload.ID = listId
	payload.Addresses = []string{"0x04", "0x05"}
	payload.Community_id = communityId
	payload.Composite_signatures = signature
	payload.Timestamp = timestamp
	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", signer))
	payload.Signing_addr = fmt.Sprintf("0x%s", account.Address().String())

	return &payload
}
