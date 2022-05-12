package shared

import (
	"context"
	"encoding/hex"
	"errors"
	"flag"
	"io/ioutil"
	"os"
	"strings"
	"time"

	"github.com/rs/zerolog/log"

	"github.com/onflow/cadence"
	jsoncdc "github.com/onflow/cadence/encoding/json"
	"github.com/onflow/flow-go-sdk"
	"github.com/onflow/flow-go-sdk/client"
	"google.golang.org/grpc"
)

type FlowAdapter struct {
	Client  *client.Client
	Context context.Context
	URL     string
}

func NewFlowClient() *FlowAdapter {
	adapter := FlowAdapter{}
	adapter.Context = context.Background()
	// any reason to pass this as an arg instead?
	if flag.Lookup("test.v") == nil {
		adapter.URL = os.Getenv("FLOW_URL")
	} else {
		adapter.URL = os.Getenv("FLOW_EMULATOR_URL")
	}

	// create flow client
	FlowClient, err := client.New(strings.TrimSpace(adapter.URL), grpc.WithInsecure())
	if err != nil {
		log.Panic().Msgf("failed to connect to %s", adapter.URL)
	}
	adapter.Client = FlowClient
	return &adapter
}

func (fa *FlowAdapter) GetAccountAtBlockHeight(addr string, blockheight uint64) (*flow.Account, error) {
	hexAddr := flow.HexToAddress(addr)
	return fa.Client.GetAccountAtBlockHeight(fa.Context, hexAddr, blockheight)
}

func (fa *FlowAdapter) GetCurrentBlockHeight() (int, error) {
	block, err := fa.Client.GetLatestBlock(fa.Context, true)
	if err != nil {
		return 0, err
	}
	return int(block.Height), nil
}

func (fa *FlowAdapter) UserSignatureValidate(address string, message string, sigs *[]CompositeSignature, transactionId string) error {
	if transactionId != "" {
		// need transaction validation
		return nil
	}

	log.Debug().Msgf("UserSignature validate: %s [%s] %v", address, message, *sigs)

	flowAddress := flow.HexToAddress(address)
	cadenceAddress := cadence.NewAddress(flowAddress)

	// Pull out signature strings + keyIds for script
	var cadenceSigs []cadence.Value = make([]cadence.Value, len(*sigs))
	var cadenceKeyIds []cadence.Value = make([]cadence.Value, len(*sigs))
	for i, cSig := range *sigs {
		cadenceKeyIds[i] = cadence.NewInt(int(cSig.Key_id))
		cadenceSigs[i] = cadence.String(cSig.Signature)
	}

	// Load script
	script, err := ioutil.ReadFile("./main/cadence/validate_signature_v2.cdc")
	if err != nil {
		log.Error().Err(err).Msgf("error reading cadence script file")
		return err
	}

	// call the script to verify the signature on chain
	value, err := fa.Client.ExecuteScriptAtLatestBlock(
		fa.Context,
		script,
		[]cadence.Value{
			cadenceAddress,
			cadence.NewArray(cadenceKeyIds),
			cadence.NewArray(cadenceSigs),
			cadence.String(message),
		},
	)

	if err != nil && strings.Contains(err.Error(), "ledger returns unsuccessful") {
		log.Error().Err(err).Msg("signature validation error")
		return errors.New("flow access node error, please cast your vote again")
	} else if err != nil {
		log.Error().Err(err).Msg("signature validation error")
		return err
	}

	if err != nil {
		return err
	}

	if value != cadence.NewBool(true) {
		return errors.New("invalid signature")
	}

	return nil
}

func (fa *FlowAdapter) UserTransactionValidate(address string, message string, sigs *[]CompositeSignature, transactionId string, txOptaddrs []string, choices []Choice) error {
	if transactionId == "" {
		// need user signature validation
		return nil
	}
	log.Info().Msgf("Process Vote TXID %s", transactionId)

	// wait on transaction details and verify
	txId := flow.HexToID(transactionId)
	txr, tx, err := WaitForSeal(fa.Context, fa.Client, txId)
	if err != nil || txr.Error != nil {
		log.Error().Err(err).Msgf("Tranaction vote has error %s", txr.Error.Error())
		return errors.New("transaction vote invalid")
	}

	isSealed := txr.Status.String() == "SEALED"
	isVoter := "0x"+tx.ProposalKey.Address.String() == address
	if !isSealed {
		return errors.New("transaction vote not processed")
	} else if !isVoter {
		return errors.New("invalid voter address")
	}

	txBlockByID, errBlockHeader := fa.Client.GetBlockHeaderByID(fa.Context, tx.ReferenceBlockID)
	if errBlockHeader != nil {
		log.Error().Err(err).Msgf("Get block header has error %s", errBlockHeader.Error())
		return errors.New("can not verify tx is recent")
	}

	if txBlockByID.Timestamp.Before(time.Now().Add(-15 * time.Minute)) {
		log.Error().Err(err).Msgf("Tx timestamp too old, now: %s block: %s, blockId %s", time.Now(), txBlockByID.Timestamp, txBlockByID.ID)
		return errors.New("voting transaction is invalid")
	}

	// validate transaction arguments
	toAddressDecoded, errAddress := jsoncdc.Decode(tx.Arguments[1])
	if errAddress != nil {
		log.Error().Err(err).Msgf("toAddress in tx invalid %s", errAddress.Error())
		return errors.New("transaction vote is invalid, option not found")
	}

	toAddress := toAddressDecoded.(cadence.Address)
	vars := strings.Split(message, ":")
	encodedChoice := vars[1]
	choiceBytes, errChoice := hex.DecodeString(encodedChoice)

	if errChoice != nil {
		return errors.New("couldnt decode choice in message from hex string")
	}

	isToAddressValid := false
	for index, element := range txOptaddrs {
		addr := toAddress.String()
		if element == addr {
			isToAddressValid = true
			if choices[index].Choice_text != string(choiceBytes) {
				return errors.New("vote choice does not match tx to address")
			}
		}
	}

	if !isToAddressValid {
		return errors.New("transaction to address not recognized")
	}
	return nil
}

func WaitForSeal(ctx context.Context, c *client.Client, id flow.Identifier) (*flow.TransactionResult, *flow.Transaction, error) {
	result, err := c.GetTransactionResult(ctx, id)
	if err != nil {
		return nil, nil, err
	}

	for result.Status != flow.TransactionStatusSealed {
		time.Sleep(time.Second)
		result, err = c.GetTransactionResult(ctx, id)
		if err != nil {
			return nil, nil, err
		}
	}

	tx, errTx := c.GetTransaction(ctx, id)
	return result, tx, errTx
}
