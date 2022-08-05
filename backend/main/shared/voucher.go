package shared

import (
	"bytes"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/ethereum/go-ethereum/rlp"
	"github.com/rs/zerolog/log"
)

///////////////////
// Voucher Structs
///////////////////
type ProposalKey struct {
	Address     string `json:"address"`
	KeyId       uint   `json:"keyId"`
	SequenceNum uint   `json:"sequenceNum"`
}
type PayloadSig struct {
	Address string `json:"address"`
	KeyId   uint   `json:"keyId"`
	Sig     string `json:"sig"`
}
type Voucher struct {
	Cadence      string              `json:"cadence"`
	RefBlock     string              `json:"refBlock"`
	ComputeLimit uint                `json:"computeLimit"`
	Arguments    []map[string]string `json:"arguments"`
	Payer        string              `json:"payer"`
	Authorizers  []string            `json:"authorizers"`
	ProposalKey  ProposalKey         `json:"proposalKey"`
	PayloadSigs  []PayloadSig        `json:"payloadSigs"`
	EnvelopeSigs []PayloadSig        `json:"envelopeSigs"`
}

func rightPaddedBuffer(s string, numBytes uint) string {
	format := "%-" + fmt.Sprintf("%d", numBytes*2) + "s"
	_rightPaddedStr := fmt.Sprintf(format, s)
	rightPaddedStr := strings.Replace(_rightPaddedStr, " ", "0", int(numBytes*2))
	return rightPaddedStr
}
func leftPaddedBuffer(s string, numBytes uint) []byte {
	format := "%0" + fmt.Sprintf("%d", numBytes*2) + "s"
	leftPaddedStr := fmt.Sprintf(format, s)
	data, _ := hex.DecodeString(leftPaddedStr)
	return data
}
func blockBuffer(s string) []byte {
	return leftPaddedBuffer(s, 32)
}
func addressBuffer(s string) []byte {
	return leftPaddedBuffer(s, 8)
}
func sansPrefix(addr string) string {
	return strings.TrimPrefix(addr, "0x")
}
func rlpEncode(p interface{}) string {
	b := new(bytes.Buffer)
	_ = rlp.Encode(b, p)
	return hex.EncodeToString(b.Bytes())
}

func EncodeTransactionEnvelope(v Voucher) string {
	//////////////////////////
	// Build Payload Message
	//////////////////////////
	log.Info().Msgf("\nEncoding Voucher into Transaction Payload\n")

	var toEncode []interface{}
	// var serverEncodedFields RlpEncodedFields

	// CADENCE
	toEncode = append(toEncode, v.Cadence)

	// individually rlp encode
	// serverEncodedFields.Cadence = rlpEncode(v.Cadence)
	// log.Info().Msgf("Ser Encoded Cadence: %s\n", serverEncodedFields.Cadence)

	// ARGUMENTS
	// Stringify tx args
	args := make([]string, len(v.Arguments))
	for i, arg := range v.Arguments {
		jsonStrArg, _ := json.Marshal(arg)
		args[i] = string(jsonStrArg)
	}

	toEncode = append(toEncode, args)
	// serverEncodedFields.Arguments = rlpEncode(args)

	// log.Info().Msgf("FCL Encoded Args: %s", encodedFields.Arguments)
	// log.Info().Msgf("Ser Encoded Args: %s\n", serverEncodedFields.Arguments)

	// REF BLOCK
	toEncode = append(toEncode, leftPaddedBuffer(v.RefBlock, 32))
	// serverEncodedFields.RefBlock = rlpEncode(leftPaddedBuffer(v.RefBlock, 32))

	// log.Info().Msgf("FCL Encoded RefBlock: %s", encodedFields.RefBlock)
	// log.Info().Msgf("Ser Encoded RefBlock: %s\n", serverEncodedFields.RefBlock)

	// COMPUTE LIMIT
	toEncode = append(toEncode, v.ComputeLimit)
	// serverEncodedFields.ComputeLimit = rlpEncode(v.ComputeLimit)

	// log.Info().Msgf("FCL Encoded ComputeLimit: %s", encodedFields.ComputeLimit)
	// log.Info().Msgf("Ser Encoded ComputeLimit: %s\n", serverEncodedFields.ComputeLimit)

	// PROPOSAL KEY ADDRESS
	proposalAddrData := addressBuffer(sansPrefix(v.ProposalKey.Address))
	toEncode = append(toEncode, proposalAddrData)
	// serverEncodedFields.ProposalKeyAddr = rlpEncode(proposalAddrData)

	// log.Info().Msgf("FCL Encoded Proposal Addr: %s", encodedFields.ProposalKeyAddr)
	// log.Info().Msgf("Ser Encoded Proposal Addr: %s\n", serverEncodedFields.ProposalKeyAddr)

	// PROPOSAL KEY ID
	toEncode = append(toEncode, v.ProposalKey.KeyId)
	// serverEncodedFields.ProposalKeyId = rlpEncode(v.ProposalKey.KeyId)

	// log.Info().Msgf("FCL Encoded Proposal KeyId: %s", encodedFields.ProposalKeyId)
	// log.Info().Msgf("Ser Encoded Proposal KeyId: %s\n", serverEncodedFields.ProposalKeyId)

	// PROPOSAL KEY SEQ NUM
	toEncode = append(toEncode, v.ProposalKey.SequenceNum)
	// serverEncodedFields.ProposalKeySeqNum = rlpEncode(v.ProposalKey.SequenceNum)

	// log.Info().Msgf("FCL Encoded Proposal SeqNum: %s", encodedFields.ProposalKeySeqNum)
	// log.Info().Msgf("Ser Encoded Proposal SeqNum: %s\n", serverEncodedFields.ProposalKeySeqNum)

	// PAYER
	payerData := leftPaddedBuffer(sansPrefix(v.Payer), 8)
	toEncode = append(toEncode, payerData) // 8 bytes left padded w/ 0s
	// serverEncodedFields.Payer = rlpEncode(payerData)

	// log.Info().Msgf("FCL Encoded Payer: %s", encodedFields.Payer)
	// log.Info().Msgf("Ser Encoded Payer: %s\n", serverEncodedFields.Payer)

	// Stringify/pad authorizers
	authorizers := make([][]byte, len(v.Authorizers))
	for i, addr := range v.Authorizers {
		authorizers[i] = addressBuffer(sansPrefix(addr))
	}
	toEncode = append(toEncode, authorizers)
	// serverEncodedFields.Authorizers = rlpEncode(authorizers)

	// log.Info().Msgf("FCL Encoded Authorizers: %s", encodedFields.Authorizers)
	// log.Info().Msgf("Ser Encoded Authorizers: %s\n", serverEncodedFields.Authorizers)

	// DOMAIN TAG
	// domainTag := "FLOW-V0.0-transaction"
	// TX_DOMAIN_TAG := rightPaddedBuffer(hex.EncodeToString([]byte(domainTag)), 32)
	// serverEncodedFields.DomainTag = TX_DOMAIN_TAG

	// log.Info().Msgf("FCL Encoded Domain Tag: %s", encodedFields.DomainTag)
	// log.Info().Msgf("Ser Encoded Domain Tag: %s\n", serverEncodedFields.DomainTag)

	// Encode
	// transactionPayload := rlpEncode(toEncode)
	// log.Info().Msgf("FCL Tx Payload: %s", transactionPayload)

	// log.Info().Msgf("Transaction Payloads match?????? %v", payload.TransactionPayload == fmt.Sprintf("%s%s", TX_DOMAIN_TAG, transactionPayload))

	// Transaction Envelope:
	// - create new array to rlpEncode using transaction Payload and payload sigs
	var envelopePayloadToEncode []interface{}
	envelopePayloadToEncode = append(envelopePayloadToEncode, toEncode)
	envelopePayloadToEncode = append(envelopePayloadToEncode, v.PayloadSigs)
	envelopePayload := rlpEncode(envelopePayloadToEncode)

	// log.Info().Msgf("FCL Tx Env:\n%s", payload.TransactionEnvelope)
	// log.Info().Msgf("Ser Tx Env:\n%s\n", fmt.Sprintf("%s%s", TX_DOMAIN_TAG, envelopePayload))
	// log.Info().Msgf("Envelope Payloads match?????? %v", payload.TransactionEnvelope == fmt.Sprintf("%s%s", TX_DOMAIN_TAG, envelopePayload))
	return envelopePayload
}
