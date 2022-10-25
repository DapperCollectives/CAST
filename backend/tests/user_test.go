package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/DapperCollectives/CAST/backend/main/models"
	"github.com/stretchr/testify/assert"
)

func TestUser(t *testing.T) {
	clearTable("users")

	t.Run("should be able to create a user", func(t *testing.T) {
		userStruct := otu.GenerateUserStruct("account")
		response := otu.CreateUserAPI(userStruct)
		checkResponseCode(t, http.StatusCreated, response.Code)

		var created models.User
		json.Unmarshal(response.Body.Bytes(), &created)

		assert.Equal(t, *userStruct.Addr, *created.Addr)
	})

	t.Run("should be able to get a user", func(t *testing.T) {
		userStruct := otu.GenerateUserStruct("account")
		response := otu.CreateUserAPI(userStruct)
		checkResponseCode(t, http.StatusCreated, response.Code)

		var created models.User
		json.Unmarshal(response.Body.Bytes(), &created)

		req, _ := http.NewRequest("GET", fmt.Sprintf("/user/%s", *created.Addr), nil)
		response = otu.ExecuteRequest(req)

		var user models.User
		json.Unmarshal(response.Body.Bytes(), &user)

		assert.Equal(t, *created.Addr, *user.Addr)
	})

	t.Run("should be able to update a user", func(t *testing.T) {
		userStruct := otu.GenerateUserStruct("account")
		response := otu.CreateUserAPI(userStruct)
		checkResponseCode(t, http.StatusCreated, response.Code)

		var toUpdate models.User
		json.Unmarshal(response.Body.Bytes(), &toUpdate)

		updatedName := "Updated Name"

		toUpdate.Name = &updatedName
		payload, _ := json.Marshal(toUpdate)
		req, _ := http.NewRequest("PUT", fmt.Sprintf("/user"), bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		response = otu.ExecuteRequest(req)

		var updated models.User
		json.Unmarshal(response.Body.Bytes(), &updated)

		assert.Equal(t, *toUpdate.Name, *updated.Name)
	})

	t.Run("should throw an error when getting a user that doesn't exist", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/user/0x69", nil)
		response := otu.ExecuteRequest(req)

		checkResponseCode(t, http.StatusNotFound, response.Code)

		var m map[string]string
		json.Unmarshal(response.Body.Bytes(), &m)

		assert.Equal(t, "User not found", m["message"])
	})

	t.Run("should throw an error when updating a user that doesn't exist", func(t *testing.T) {
		userStruct := otu.GenerateFailUserStruct()
		payload, _ := json.Marshal(userStruct)
		req, _ := http.NewRequest("PUT", "/user", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		response := otu.ExecuteRequest(req)

		checkResponseCode(t, http.StatusNotFound, response.Code)

		var m map[string]string
		json.Unmarshal(response.Body.Bytes(), &m)

		assert.Equal(t, "User not found", m["message"])
	})
}
