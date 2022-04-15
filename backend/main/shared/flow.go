package shared

import (
	"context"
	"errors"
	"flag"
	"io/ioutil"
	"os"
	"strings"
	"time"

	"github.com/rs/zerolog/log"

	"github.com/onflow/cadence"
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

	if transactionId != "" {
		// wait on transaction details and verify
		txId := flow.HexToID(transactionId)
		txr, tx, err := WaitForSeal(fa.Context, fa.Client, txId)
		isSealed := txr.Status.String() == "SEALED"
		isVoter := "0x"+tx.ProposalKey.Address.String() == address
		log.Info().Msgf("Process TX Vote TXID %s", transactionId)
		// TODO: 1) Need to get transaction result from grpc endpoint to get BlockId
		// it's not in the flow client api
		block, errBlock := fa.Client.GetLatestBlock(fa.Context, true)
		blockNumber := int(block.Height)

		// TODO: 2) validate transaction is a voting transaction
		validateVotingTransaction(txr.Events)
		log.Info().Msgf("current block height %s", blockNumber)
		if err != nil || txr.Error != nil {
			log.Error().Err(err).Msgf("Tranaction vote has error %s", txr.Error.Error())
			return errors.New("transaction vote invalid")
		} else if !isSealed || errBlock != nil {
			return errors.New("transaction vote not processed")
		} else if !isVoter {
			return errors.New("invalid voter address")
		}
		return nil
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

func validateVotingTransaction(events []flow.Event) bool {
	result := false
	for _, event := range events {
		res := strings.Contains(event.Type, "TokensDeposited")
		if res {
			// verify address tokens sent to corresponds to voting option
			//log.Info().Msgf("Type: %s", event.Type)
			//log.Info().Msgf("Values: %v", event.Value.Fields[0].ToGoValue())
		}
	}
	return result
}
