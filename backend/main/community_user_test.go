package main

////////////////////
// CommunityUsers //
////////////////////

// func TestCommunityUsersCreateCommunity(t *testing.T) {
// 	clearTable("communities")
// 	clearTable("community_users")
// 	communityId := addCommunities(1)[0]

// 	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(communityId)+"/users", nil)
// 	response := executeRequest(req)

// 	checkResponseCode(t, http.StatusOK, response.Code)

// 	var payload shared.PaginatedResponse
// 	json.Unmarshal(response.Body.Bytes(), &payload)

// 	assert.Equal(t, 3, payload.Count)
// }

// func TestAddAuthorAdmin(t *testing.T) {
// 	clearTable("communities")
// 	clearTable("community_users")
// 	otu := utils.NewOverflowTest(t, &A)
// 	communityId := addCommunities(1)[0]

// 	// emulator-account is the community admin by default
// 	payload := otu.GenerateValidCommunityUserPayload(communityId, "user1", "account", "author")
// 	response := otu.CreateCommunityUser(1, payload)
// 	checkResponseCode(t, http.StatusCreated, response.Code)

// 	var m map[string]interface{}
// 	json.Unmarshal(response.Body.Bytes(), &m)

// 	if m["error"] != nil {
// 		t.Errorf("Error msg: %v\n", m["error"])
// 	}
// 	if m["communityId"] == nil {
// 		t.Errorf("Expected community_user communityId to exist. Got '%v'", m["communityId"])
// 	}
// 	if m["addr"] != utils.DefaultCommunityUserStruct.Addr {
// 		t.Errorf("Expected community_user addr to be '%s'. Got '%v'", utils.DefaultCommunityUserStruct.Addr, m["addr"])
// 	}
// 	if m["userType"] != utils.DefaultUserType {
// 		t.Errorf("Expected community_user userType to be '%s'. Got '%v'", *&utils.DefaultUserType, m["userType"])
// 	}

// 	// the id is compared to 1.0 because JSON unmarshaling converts numbers to
// 	// floats, when the target is a map[string]interface{}
// 	if m["communityId"] != 1.0 {
// 		t.Errorf("Expected communityId to be '1'. Got '%v'", m["communityId"])
// 	}
// }

// func TestGetCommunityUsers(t *testing.T) {
// 	clearTable("communities")
// 	clearTable("community_users")
// 	communityId := addCommunities(1)[0]
// 	addCommunityUsers(communityId, 1)

// 	req, _ := http.NewRequest("GET", "/communities/"+strconv.Itoa(communityId)+"/users", nil)
// 	response := executeRequest(req)

// 	checkResponseCode(t, http.StatusOK, response.Code)

// 	var m shared.PaginatedResponse
// 	json.Unmarshal(response.Body.Bytes(), &m)

// 	if m.Count != 1 {
// 		t.Errorf("Expected count to be '1'. Got '%v'", m.Count)
// 	}
// 	if m.TotalRecords != 1 {
// 		t.Errorf("Expected totalRecords to be '1'. Got '%v'", m.TotalRecords)
// 	}
// 	if len(m.Data.([]interface{})) != 1 {
// 		actual := len(m.Data.([]interface{}))
// 		t.Errorf("Expected len of Data to be '1'. Got '%v'", actual)
// 	}
// }

// func TestGetUserCommunities(t *testing.T) {
// 	clearTable("communities")
// 	clearTable("community_users")
// 	communityId := addCommunities(1)[0]
// 	addCommunityUsers(communityId, 1)

// 	req, _ := http.NewRequest("GET", "/users/"+utils.ServiceAccountAddress+"/communities", nil)
// 	response := executeRequest(req)

// 	checkResponseCode(t, http.StatusOK, response.Code)

// 	var m shared.PaginatedResponse
// 	json.Unmarshal(response.Body.Bytes(), &m)

// 	if m.Count != 1 {
// 		t.Errorf("Expected count to be '1'. Got '%v'", m.Count)
// 	}
// 	if m.TotalRecords != 1 {
// 		t.Errorf("Expected totalRecords to be '1'. Got '%v'", m.TotalRecords)
// 	}
// 	if len(m.Data.([]interface{})) != 1 {
// 		actual := len(m.Data.([]interface{}))
// 		t.Errorf("Expected len of Data to be '1'. Got '%v'", actual)
// 	}
// }

// func TestDeleteUserFromCommunity(t *testing.T) {
// 	clearTable("communities")
// 	clearTable("community_users")
// 	communityId := addCommunities(1)[0]
// 	addCommunityUsers(communityId, 1)

// 	payload := utils.GenerateValidDeleteCommunityUserPayload(communityId)
// 	req, _ := http.NewRequest("DELETE", "/communities/"+strconv.Itoa(communityId)+"/users/"+utils.ServiceAccountAddress, bytes.NewBuffer(payload))
// 	response := executeRequest(req)

// 	checkResponseCode(t, http.StatusOK, response.Code)

// 	var m map[string]interface{}
// 	json.Unmarshal(response.Body.Bytes(), &m)

// 	if m["status"] != "ok" {
// 		t.Errorf("Expected status to be 'ok'. Got '%v'", m["status"])
// 	}
// }
