package test_utils

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/brudfyi/flow-voting-tool/main/models"
	"github.com/brudfyi/flow-voting-tool/main/shared"
	"github.com/onflow/flow-go-sdk"
	"github.com/onflow/flow-go-sdk/crypto"
)

// Valid/Invalid service account key is based on the flow.json file in this repo,
// and assumes you are running the emulator from this repo
var ServiceAccountAddress = "0xf8d6e0586b0a20c7"
var ValidServiceAccountKey = "63bff10bd6186b7d97c8e2898941c93d5d33a830b0ac9b758e216024b7bf7957"
var InvalidServiceAccountKey = "5687d75f957bf64591b55eb19227706e3c8712c1387225b87aff072585ea8e51"

//////////
// VOTES
//////////

func GenerateValidVotePayload(proposalId int, choice string) []byte {
	timestamp := time.Now().UnixNano() / int64(time.Millisecond)
	hexChoice := hex.EncodeToString([]byte(choice))
	message := "1:" + hexChoice + ":" + fmt.Sprint(timestamp)
	compositeSignatures := SignMessage(ServiceAccountAddress, ValidServiceAccountKey, message)

	vote := models.Vote{Proposal_id: proposalId, Addr: ServiceAccountAddress, Choice: choice,
		Composite_signatures: compositeSignatures, Message: message}

	jsonStr, _ := json.Marshal(vote)
	return []byte(jsonStr)
}

//////////////
// COMMUNITIES
//////////////

var logo = "toad.jpeg"
var slug = "test-slug"
var body = "<html>test body</html>"
var ValidCommunityStruct = models.Community{
	Name: "TestDAO", Body: &body, Creator_addr: "", Logo: &logo, Slug: &slug,
}

func GenerateValidCommunityPayload(addr string) []byte {
	// this does a deep copy
	community := ValidCommunityStruct
	community.Creator_addr = addr
	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
	community.Timestamp = timestamp
	compositeSignatures := SignMessage(ServiceAccountAddress, ValidServiceAccountKey, timestamp)

	community.Composite_signatures = compositeSignatures

	jsonStr, _ := json.Marshal(community)
	return []byte(jsonStr)
}

//////////////
// PROPOSALS
//////////////

var strategy = "token-weighted-default"
var proposalBody = "<html>something</html>"

var DefaultProposalStruct = models.Proposal{
	Name:         "Test Proposal",
	Body:         &proposalBody,
	Choices:      []string{"a", "b", "c"},
	Creator_addr: ServiceAccountAddress,
	Strategy:     &strategy,
	// Start_time:   time.Now(),
	// End_time:     time.Now().Add(30 * 24 * time.Hour),
	// Timestamp:    timestamp,
	// Sig:          signature,
}

func GenerateValidProposalPayload(communityId int) []byte {
	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
	compositeSignatures := SignMessage(ServiceAccountAddress, ValidServiceAccountKey, timestamp)

	// deep copy
	proposal := DefaultProposalStruct
	proposal.Community_id = communityId
	proposal.Start_time = time.Now()
	proposal.End_time = time.Now().Add(30 * 24 * time.Hour)
	proposal.Timestamp = timestamp
	proposal.Composite_signatures = compositeSignatures

	jsonStr, _ := json.Marshal(proposal)
	return []byte(jsonStr)
}

func GenerateInvalidSignatureProposalPayload(communityId int) []byte {
	timestamp := fmt.Sprint(time.Now().UnixNano() / int64(time.Millisecond))
	compositeSignatures := SignMessage(ServiceAccountAddress, InvalidServiceAccountKey, timestamp)

	proposal := models.Proposal{
		Name:                 "Test Proposal",
		Body:                 &proposalBody,
		Choices:              []string{"one", "two", "three"},
		Creator_addr:         ServiceAccountAddress,
		Strategy:             &strategy,
		Start_time:           time.Now(),
		End_time:             time.Now().Add(30 * 24 * time.Hour),
		Timestamp:            timestamp,
		Composite_signatures: compositeSignatures,
		Community_id:         communityId,
	}

	jsonStr, _ := json.Marshal(proposal)
	return []byte(jsonStr)
}

func GenerateExpiredTimestampProposalPayload(communityId int) []byte {
	timestamp := fmt.Sprint(time.Now().Add(-10*time.Minute).UnixNano() / int64(time.Millisecond))
	compositeSignatures := SignMessage(ServiceAccountAddress, ValidServiceAccountKey, timestamp)

	proposal := models.Proposal{
		Name:                 "Test Proposal",
		Body:                 &proposalBody,
		Choices:              []string{"one", "two", "three"},
		Creator_addr:         ValidServiceAccountKey,
		Strategy:             &strategy,
		Start_time:           time.Now(),
		End_time:             time.Now().Add(30 * 24 * time.Hour),
		Timestamp:            timestamp,
		Composite_signatures: compositeSignatures,
		Community_id:         communityId,
	}

	jsonStr, _ := json.Marshal(proposal)
	return []byte(jsonStr)
}

//////////
// UTILS
//////////

func SignMessage(addr string, privateKey string, message string) *[]shared.CompositeSignature {
	// everyone has this anyway
	decodedPrivateKey, err := crypto.DecodePrivateKeyHex(crypto.ECDSA_P256, privateKey)
	if err != nil {
		log.Fatal(err)
	}
	byteMessage := []byte(message)
	signer := crypto.NewInMemorySigner(decodedPrivateKey, crypto.SHA3_256)
	signature, _ := flow.SignUserMessage(signer, byteMessage)
	sigString := hex.EncodeToString(signature)

	compositeSignature := shared.CompositeSignature{
		Addr:      ServiceAccountAddress,
		Key_id:    0,
		Signature: sigString,
	}

	compositeSignatures := make([]shared.CompositeSignature, 1)
	compositeSignatures[0] = compositeSignature

	return &compositeSignatures
}
