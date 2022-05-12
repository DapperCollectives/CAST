package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"testing"
	"time"

	"github.com/brudfyi/flow-voting-tool/main/models"
	"github.com/stretchr/testify/assert"
)

/*****************/
/*    Lists      */
/*****************/

func TestGetLists(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	clearTable("lists")

	t.Run("API should return an empty set of lists if no lists exists", func(t *testing.T) {
		communityId := otu.AddCommunities(1)[0]
		response := otu.GetListsForCommunityAPI(communityId)
		checkResponseCode(t, http.StatusOK, response.Code)
	})

	t.Run("API should return list of existing lists", func(t *testing.T) {
		communityId := otu.AddCommunities(1)[0]
		otu.AddLists(communityId, 1)

		req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(communityId)+"/lists", nil)
		response := executeRequest(req)

		checkResponseCode(t, http.StatusOK, response.Code)
		var lists []models.List
		json.Unmarshal(response.Body.Bytes(), &lists)
		assert.Equal(t, 1, len(lists))
	})

}

func TestCreateList(t *testing.T) {
	clearTable("communities")
	clearTable("proposals")
	clearTable("community_users")
	clearTable("lists")

	t.Run("Community creator should be able to create a blocklist", func(t *testing.T) {
		communityId := otu.AddCommunitiesWithUsers(1, "user1")[0]
		listStruct := otu.GenerateBlockListStruct(communityId)
		payload := otu.GenerateBlockListPayload("user1", listStruct)
		response := otu.CreateListAPI(payload)
		checkResponseCode(t, http.StatusCreated, response.Code)

		var list models.List
		json.Unmarshal(response.Body.Bytes(), &list)

		assert.NotNil(t, list.Cid)
		addressLength := len(list.Addresses)
		assert.Equal(t, len(listStruct.Addresses), addressLength)
		assert.Equal(t, *listStruct.List_type, *list.List_type)
	})

	t.Run("Should throw an error if signature is invalid", func(t *testing.T) {
		communityId := otu.AddCommunitiesWithUsers(1, "user1")[0]
		listStruct := otu.GenerateBlockListStruct(communityId)
		payload := otu.GenerateBlockListPayload("user1", listStruct)

		// Invalidate the signature by signing a new timestamp
		newTimestamp := fmt.Sprint(time.Now().UnixNano()/int64(time.Millisecond) + 1234)
		compositeSigs := otu.GenerateCompositeSignatures("user1", newTimestamp)
		payload.Composite_signatures = compositeSigs

		response := otu.CreateListAPI(payload)
		checkResponseCode(t, http.StatusForbidden, response.Code)

		var m map[string]interface{}
		json.Unmarshal(response.Body.Bytes(), &m)
		assert.Equal(t, "invalid signature", m["error"])
	})

	t.Run("Should throw an error if timestamp is expired", func(t *testing.T) {
		communityId := otu.AddCommunitiesWithUsers(1, "user1")[0]
		listStruct := otu.GenerateBlockListStruct(communityId)
		payload := otu.GenerateBlockListPayload("user1", listStruct)
		// Invalidate by signing an old timestamp
		newTimestamp := fmt.Sprint(time.Now().Add(-10*time.Minute).UnixNano() / int64(time.Millisecond))
		compositeSigs := otu.GenerateCompositeSignatures("user1", newTimestamp)
		payload.Timestamp = newTimestamp
		payload.Composite_signatures = compositeSigs

		response := otu.CreateListAPI(payload)

		checkResponseCode(t, http.StatusForbidden, response.Code)

		var m map[string]interface{}
		json.Unmarshal(response.Body.Bytes(), &m)
		assert.Equal(t, "timestamp on request has expired", m["error"])
	})
}

func TestUpdateList(t *testing.T) {
	clearTable("communities")
	clearTable("community_users")
	clearTable("proposals")
	clearTable("lists")
	communityId := otu.AddCommunitiesWithUsers(1, "user1")[0]
	listId := otu.AddLists(communityId, 1)[0]

	// ADD ADDRESSES
	t.Run("Community Author should be able to add address to community blocklist", func(t *testing.T) {
		payload := otu.GenerateUpdateListPayload(listId, communityId, "user1")
		response := otu.AddAddressesToListAPI(listId, payload)

		checkResponseCode(t, http.StatusCreated, response.Code)

		// Get List and check addresses were added
		response = otu.GetListByIdAPI(listId)
		checkResponseCode(t, http.StatusOK, response.Code)

		var l1 models.List
		json.Unmarshal(response.Body.Bytes(), &l1)

		assert.Equal(t, 5, len(l1.Addresses))
		assert.Contains(t, l1.Addresses, "0x04")
		assert.Contains(t, l1.Addresses, "0x05")
	})

	// REMOVE ADDRESSES
	t.Run("Community Author should be able to remove addresses from community blocklist", func(t *testing.T) {
		// Reuse same payload to remove the addresses we just added
		payload := otu.GenerateUpdateListPayload(listId, communityId, "user1")
		response := otu.RemoveAddressesFromListAPI(listId, payload)
		checkResponseCode(t, http.StatusOK, response.Code)

		// Get List and check addresses were added
		response = otu.GetListByIdAPI(listId)
		checkResponseCode(t, http.StatusOK, response.Code)

		var l2 models.List
		json.Unmarshal(response.Body.Bytes(), &l2)

		assert.Equal(t, 3, len(l2.Addresses))
		assert.Contains(t, l2.Addresses, "0x01")
		assert.Contains(t, l2.Addresses, "0x02")
		assert.Contains(t, l2.Addresses, "0x03")
	})

}
