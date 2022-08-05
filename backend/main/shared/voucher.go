package shared

import (
	"bytes"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/ethereum/go-ethereum/rlp"
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
	var toEncode []interface{}

	// CADENCE
	toEncode = append(toEncode, v.Cadence)

	// ARGUMENTS
	// Stringify tx args
	args := make([]string, len(v.Arguments))
	for i, arg := range v.Arguments {
		jsonStrArg, _ := json.Marshal(arg)
		args[i] = string(jsonStrArg)
	}
	toEncode = append(toEncode, args)

	// REF BLOCK
	toEncode = append(toEncode, blockBuffer(v.RefBlock))

	// COMPUTE LIMIT
	toEncode = append(toEncode, v.ComputeLimit)

	// PROPOSAL KEY ADDRESS
	proposalAddrData := addressBuffer(sansPrefix(v.ProposalKey.Address))
	toEncode = append(toEncode, proposalAddrData)

	// PROPOSAL KEY ID
	toEncode = append(toEncode, v.ProposalKey.KeyId)

	// PROPOSAL KEY SEQ NUM
	toEncode = append(toEncode, v.ProposalKey.SequenceNum)

	// PAYER
	payerData := leftPaddedBuffer(sansPrefix(v.Payer), 8)
	toEncode = append(toEncode, payerData) // 8 bytes left padded w/ 0s

	// AUTHORIZERS
	authorizers := make([][]byte, len(v.Authorizers))
	// pad authorizer addresses
	for i, addr := range v.Authorizers {
		authorizers[i] = addressBuffer(sansPrefix(addr))
	}
	toEncode = append(toEncode, authorizers)

	// Encode Transaction Envelope:
	// - create new array to rlpEncode using transaction Payload and payload sigs
	var envelopePayloadToEncode []interface{}
	envelopePayloadToEncode = append(envelopePayloadToEncode, toEncode)
	envelopePayloadToEncode = append(envelopePayloadToEncode, v.PayloadSigs)
	envelopePayload := rlpEncode(envelopePayloadToEncode)

	return envelopePayload
}
