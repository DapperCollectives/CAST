package shared

import (
	"context"
	"errors"
	"flag"
	"io/ioutil"
	"os"
	"strings"

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

func (fa *FlowAdapter) UserSignatureValidate(address string, message string, sigs *[]CompositeSignature) error {
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
		return errors.New("Flow access node error, please cast your vote again")
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
