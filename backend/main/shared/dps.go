package shared

import (
	"context"
	"encoding/json"
	"io/ioutil"

	"github.com/onflow/cadence"
	"github.com/onflow/flow-go-sdk"
	dpsApi "github.com/optakt/flow-dps/api/dps"
	"github.com/optakt/flow-dps/codec/zbor"
	"github.com/optakt/flow-dps/service/invoker"
	"github.com/rs/zerolog/log"
	"google.golang.org/grpc"
)

type DpsAdapter struct {
	Config  FlowConfig
	Invoker *invoker.Invoker
	Context context.Context
	URL     string
	Env     string
}

func NewDpsClient(flowEnv string) *DpsAdapter {
	// Initialize adapter
	adapter := DpsAdapter{}
	adapter.Context = context.Background()
	adapter.Env = flowEnv

	// parse flow.json
	path := "./flow.json"

	content, err := ioutil.ReadFile(path)

	if err != nil {
		log.Fatal().Msgf("Error when opening file: %+v.", err)
	}

	var config FlowConfig
	err = json.Unmarshal(content, &config)
	if err != nil {
		log.Fatal().Msgf("Error parsing flow.json: %+v.", err)
	}

	adapter.Config = config
	adapter.URL = config.DpsNetworks[adapter.Env]

	// For emulator, skip invoker instantiation
	if adapter.URL == "" {
		return &adapter
	}

	// Initialize the DPS API client.
	codec := zbor.NewCodec()

	conn, err := grpc.DialContext(adapter.Context, adapter.URL, grpc.WithInsecure())
	if err != nil {
		log.Error().Str("dps", adapter.URL).Err(err).Msg("could not dial API host")
		panic("error initializing DPS gRPC connection")
	}
	defer conn.Close()

	client := dpsApi.NewAPIClient(conn)
	index := dpsApi.IndexFromAPI(client, codec)

	cacheSize := uint64(100_000_000)
	_invoker, err := invoker.New(index, invoker.WithCacheSize(cacheSize))
	adapter.Invoker = _invoker

	if err != nil {
		log.Error().Str("dps", adapter.URL).Err(err)
		panic("error initializing DPS Invoker")
	}

	return &adapter
}

// FLOW token has its own function for fetching balance because
// it has its own script to account for locked/staked tokens.
func (dps *DpsAdapter) GetFlowBalanceAtBlockheight(addr string, blockheight uint64) cadence.Value {
	var args []cadence.Value

	// Prepare Args
	flowAddress := flow.HexToAddress(addr)
	cadenceAddress := cadence.NewAddress(flowAddress)

	args = append(args, cadenceAddress)

	_script, err := ioutil.ReadFile("./main/cadence/scripts/get_flow_token_balances.cdc")

	if err != nil {
		log.Error().Err(err).Msgf("Error reading cadence script file.")
	}

	// Replace script args
	script := dps.Config.InsertCoreContractAddresses(string(_script))

	result, err := dps.Invoker.Script(blockheight, []byte(script), args)
	if err != nil {
		log.Error().Err(err)
	}
	return result
}

func (dps *DpsAdapter) GetTokenBalanceAtBlockheight(addr string, blockheight uint64, c *Contract) cadence.Value {
	var args []cadence.Value

	// Prepare Args
	flowAddress := flow.HexToAddress(addr)
	cadenceAddress := cadence.NewAddress(flowAddress)

	args = append(args, cadenceAddress)

	_script, err := ioutil.ReadFile("./main/cadence/scripts/get_fungible_token_balance.cdc")
	if err != nil {
		log.Error().Err(err).Msgf("Error reading cadence script file.")
	}

	// Replace script args
	script := dps.Config.InsertCoreContractAddresses(string(_script))

	result, err := dps.Invoker.Script(blockheight, []byte(script), args)
	if err != nil {
		log.Error().Err(err)
	}
	return result
}
