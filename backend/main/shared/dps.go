package shared

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"strings"

	"github.com/onflow/cadence"
	dpsApi "github.com/onflow/flow-dps/api/dps"
	"github.com/onflow/flow-dps/codec/zbor"
	"github.com/onflow/flow-dps/service/invoker"
	"github.com/onflow/flow-go-sdk"
	_flow "github.com/onflow/flow-go/model/flow"
	"github.com/rs/zerolog/log"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var (
	DummyBalance = FTBalanceResponse{
		PrimaryAccountBalance:   100,
		SecondaryAccountBalance: 100,
		StakingBalance:          100,
		BlockHeight:             0,
	}
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

	conn, err := grpc.DialContext(
		adapter.Context,
		adapter.URL,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.FailOnNonTempDialError(true), // DialContext will fail immediately if passed bad connection string
		grpc.WithBlock(),                  // connection should be blocking
	)

	if err != nil {
		log.Error().Str("dps", adapter.URL).Err(err).Msg("could not dial API host")
		panic("error initializing DPS gRPC connection")
	}

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
func (dps *DpsAdapter) GetFlowBalanceAtBlockheightScript(addr string, blockheight uint64) (cadence.Value, error) {
	var args []cadence.Value

	// Prepare Args
	flowAddress := flow.HexToAddress(addr)
	cadenceAddress := cadence.NewAddress(flowAddress)

	args = append(args, cadenceAddress)

	_script, err := ioutil.ReadFile("./main/cadence/scripts/get_flow_token_balances.cdc")

	if err != nil {
		log.Error().Err(err).Msgf("Error reading cadence script file.")
		return nil, err
	}

	// Replace script args
	script := dps.Config.InsertCoreContractAddresses(string(_script))

	result, err := dps.Invoker.Script(blockheight, []byte(script), args)
	if err != nil {
		log.Error().Err(err).Msg("invoker.Script failed")
		return nil, err
	}
	return result, nil
}

func (dps *DpsAdapter) GetBalanceAtBlockheight(addr string, blockheight uint64, c *Contract) (*FTBalanceResponse, error) {
	if dps.bypass() {
		log.Info().Msgf("overriding dps service for emulator")
		return &DummyBalance, nil
	}

	var err error
	var result cadence.Value

	tokenBalanceResponse := FTBalanceResponse{}
	tokenBalanceResponse.NewFTBalance()
	tokenBalanceResponse.Addr = addr
	tokenBalanceResponse.BlockHeight = blockheight

	if *c.Name == "FlowToken" {
		result, err = dps.GetFlowBalanceAtBlockheightScript(addr, blockheight)
		if err != nil {
			return nil, err
		}
		fields := result.(cadence.Struct).Fields
		tokenBalanceResponse.PrimaryAccountBalance = fields[0].ToGoValue().(uint64)
		tokenBalanceResponse.StakingBalance = fields[3].ToGoValue().(uint64)
		tokenBalanceResponse.Stakes = strings.Split(fields[5].ToGoValue().(string), ", ")

		return &tokenBalanceResponse, nil
	} else {
		result, err = dps.GetTokenBalanceAtBlockheightScript(addr, blockheight, c)
		if err != nil {
			return nil, err
		}
		fields := result.(cadence.Struct).Fields
		tokenBalanceResponse.Balance = uint64(fields[1].ToGoValue().(uint64))

		return &tokenBalanceResponse, nil
	}
}

func (dps *DpsAdapter) GetTokenBalanceAtBlockheightScript(addr string, blockheight uint64, c *Contract) (cadence.Value, error) {
	var args []cadence.Value

	// Prepare Args
	flowAddress := flow.HexToAddress(addr)
	cadenceAddress := cadence.NewAddress(flowAddress)

	args = append(args, cadenceAddress)

	log.Debug().Msgf("getting %s balance for %s at blockheight %d", *c.Name, addr, blockheight)

	_script, err := ioutil.ReadFile("./main/cadence/scripts/get_fungible_token_balance.cdc")
	if err != nil {
		log.Error().Err(err).Msgf("Error reading cadence script file.")
		return nil, err
	}

	// Set Contract Addresses based on Flow env
	script := dps.Config.InsertCoreContractAddresses(string(_script))
	// Set Token name/address
	script = dps.Config.InsertTokenContract(script, c)

	result, err := dps.Invoker.Script(blockheight, []byte(script), args)
	if err != nil {
		log.Error().Err(err)
		return nil, err
	}
	return result, nil
}

func (dps *DpsAdapter) GetAccountAtBlockHeight(addr string, blockheight uint64) (*_flow.Account, error) {
	var _account *_flow.Account
	flowAddress := _flow.HexToAddress(addr)
	_account, err := dps.Invoker.Account(blockheight, flowAddress)
	if err != nil {
		log.Error().Err(err).Msgf("invoker.Account failed")
		return nil, err
	}
	account := *_account

	log.Info().Msgf("account addr: %s", account.Address)
	log.Info().Msgf("account balance: %d", account.Balance)
	log.Info().Msgf("account keys: %v", account.Keys)
	log.Info().Msgf("account contracts: %v", account.Contracts)

	return &account, nil
}

// Don't hit DPS service if using emulator
func (dps *DpsAdapter) bypass() bool {
	return dps.Env == "emulator"
}
