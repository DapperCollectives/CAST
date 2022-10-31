package test_utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"time"

	"net/http"
	"net/http/httptest"

	"github.com/DapperCollectives/CAST/backend/main/models"
)

var (
	dummyProfileImage = "https://pbs.twimg.com/profile_images/1277734310/IMG_0001_400x400.JPG"
	dummyName         = "Test User"
	dummyBio          = "This is a test bio"
	dummyTwitter      = "https://twitter.com/testuser"
	dummyDiscord      = "https://discord.com/testuser"
	dummyInstagram    = "https://instagram.com/testuser"
)

func (otu *OverflowTestUtils) CreateUserAPI(user *models.User) *httptest.ResponseRecorder {
	json, _ := json.Marshal(user)
	req, _ := http.NewRequest("POST", "/user", bytes.NewBuffer(json))
	req.Header.Set("Content-Type", "application/json")
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) GetUserAPI(user *models.User) *httptest.ResponseRecorder {
	req, _ := http.NewRequest("GET", fmt.Sprintf("/user/%s", *user.Addr), nil)
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) UpdateUserAPI(user *models.User) *httptest.ResponseRecorder {
	json, _ := json.Marshal(user)
	req, _ := http.NewRequest("PUT", "/user", bytes.NewBuffer(json))
	req.Header.Set("Content-Type", "application/json")
	return otu.ExecuteRequest(req)
}

func (otu *OverflowTestUtils) GenerateUserStruct(signer string) *models.User {
	account, _ := otu.O.State.Accounts().ByName(fmt.Sprintf("emulator-%s", signer))
	address := fmt.Sprintf("0x%s", account.Address().String())

	return &models.User{
		Addr:          &address,
		Profile_image: &dummyProfileImage,
		Name:          &dummyName,
		Bio:           &dummyBio,
		Twitter:       &dummyTwitter,
		Discord:       &dummyDiscord,
		Instagram:     &dummyInstagram,
	}
}

func (otu *OverflowTestUtils) GenerateUserPayload(signer string, user models.User) *models.User {
	payload := user
	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
	compositeSignatures := otu.GenerateCompositeSignatures(signer, timestamp)
	payload.Timestamp = &timestamp
	payload.Composite_signatures = compositeSignatures
	return &payload
}

func (otu *OverflowTestUtils) GenerateFailUserStruct() *models.User {
	nonExistentAccount := "0x696969"

	return &models.User{
		Addr:          &nonExistentAccount,
		Profile_image: &dummyProfileImage,
		Name:          &dummyName,
		Bio:           &dummyBio,
		Twitter:       &dummyTwitter,
		Discord:       &dummyDiscord,
		Instagram:     &dummyInstagram,
	}
}
