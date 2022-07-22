package shared

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/rs/zerolog/log"
)

type SnapshotClient struct {
	BaseURL    string
	HTTPClient *http.Client
	Env        string
}

type Snapshot struct {
	ID           string    `json:"id"`
	Block_height uint64    `json:"blockHeight"`
	Started      time.Time `json:"started"`
	Finished     time.Time `json:"finished"`
}

type LatestBlockHeight struct {
	ID              string    `json:"id"`
	FungibleTokenID string    `json:"fungibleTokenId"`
	BlockHeight     uint64    `json:"blockHeight"`
	Started         time.Time `json:"started"`
	Finished        time.Time `json:"finished"`
	Status          string    `json:"status"`
	Attempts        int       `json:"attempts"`
}

type balanceAtBlockheight struct {
	ID              string    `json:"id"`
	FungibleTokenID string    `json:"fungibleTokenId"`
	Addr            string    `json:"address"`
	Balance         uint64    `json:"balance"`
	BlockHeight     uint64    `json:"blockHeight"`
	CreatedAt       time.Time `json:"createdAt"`
}

type SnapshotResponse struct {
	Data SnapshotData `json:"data"`
}

type SnapshotData struct {
	Message     string `json:"message"`
	Status      string `json:"status"`
	BlockHeight uint64 `json:"blockHeight"`
}

// copied this quick and dirty from models to get around circular dependency
// move to shared?
type Balance struct {
	ID                      string    `json:"id"`
	Addr                    string    `json:"addr"`
	PrimaryAccountBalance   uint64    `json:"primaryAccountBalance"`
	SecondaryAddress        string    `json:"secondaryAddress"`
	SecondaryAccountBalance uint64    `json:"secondaryAccountBalance"`
	StakingBalance          uint64    `json:"stakingBalance"`
	ScriptResult            string    `json:"scriptResult"`
	Stakes                  []string  `json:"stakes"`
	BlockHeight             uint64    `json:"blockHeight"`
	Proposal_id             int       `json:"proposal_id"`
	NFTCount                int       `json:"nftCount"`
	CreatedAt               time.Time `json:"createdAt"`
}

var (
	DummySnapshot = Snapshot{
		ID:           "1",
		Block_height: 1000000,
		Started:      time.Now(),
		Finished:     time.Now(),
	}

	DummyBalance = Balance{
		PrimaryAccountBalance:   100,
		SecondaryAccountBalance: 100,
		StakingBalance:          100,
		BlockHeight:             1000000,
	}
)

func NewSnapshotClient(baseUrl string) *SnapshotClient {
	return &SnapshotClient{
		BaseURL: baseUrl,
		HTTPClient: &http.Client{
			Timeout: time.Second * 10,
		},
		Env: os.Getenv("APP_ENV"),
	}
}

func (c *SnapshotClient) TakeSnapshot(contract Contract) (*SnapshotResponse, error) {
	if c.bypass() {
		return &SnapshotResponse{
			Data: SnapshotData{
				Message:     "",
				Status:      "success",
				BlockHeight: 1000000,
			},
		}, nil
	}

	var r *SnapshotResponse = &SnapshotResponse{}

	url := c.setSnapshotUrl(contract, "take-snapshot")
	log.Info().Msgf("Taking token snapshot. Url: %s", url)
	req, err := c.setRequestMethod("POST", url)
	if err != nil {
		log.Debug().Err(err).Msg("SnapshotClient TakeSnapshot request error")
		return r, err
	}

	if err := c.sendRequest(req, r); err != nil {
		log.Debug().Err(err).Msg("SnapshotClient takeSnapshot request error")
		return r, err
	}
	return r, nil
}

func (c *SnapshotClient) GetSnapshotStatusAtBlockHeight(
	contract Contract,
	blockHeight uint64,
) (*SnapshotResponse, error) {
	if c.bypass() {
		return &SnapshotResponse{
			Data: SnapshotData{
				Message:     "",
				Status:      "success",
				BlockHeight: 1000000,
			},
		}, nil
	}

	var r *SnapshotResponse = &SnapshotResponse{}

	url := c.setSnapshotUrl(contract, "status-at-blockheight"+fmt.Sprintf("%d", blockHeight))
	req, err := c.setRequestMethod("GET", url)
	if err != nil {
		log.Debug().Err(err).Msg("SnapshotClient GetSnapshotStatus request error")
		return r, err
	}

	if err := c.sendRequest(req, &r); err != nil {
		log.Debug().Err(err).Msg("SnapshotClient GetSnapshotStatus send request error")
		return r, err
	}

	return r, nil
}

func (c *SnapshotClient) GetAddressBalanceAtBlockHeight(
	address string,
	blockheight uint64,
	balanceResponse interface{},
	contract *Contract,
) error {
	if c.bypass() {
		return nil
	}
	var url string

	if *contract.Name == "FlowToken" {
		url = fmt.Sprintf(`%s/balance-at-blockheight/%s/%d`, c.BaseURL, address, blockheight)
	} else {
		url = fmt.Sprintf(
			`%s/balance-at-blockheight/%s/%d/%v/%v`,
			c.BaseURL,
			address,
			blockheight,
			*contract.Addr,
			*contract.Name,
		)
	}

	req, err := c.setRequestMethod("GET", url)
	if err != nil {
		log.Debug().Err(err).Msg("SnapshotClient GetAddressBalanceAtBlockHeight request error")
		return err
	}

	if err := c.sendRequest(req, balanceResponse); err != nil {
		log.Debug().Err(err).Msgf("Snapshot GetAddressBalanceAtBlockHeight send request error.")
		return err
	}
	log.Info().Msgf("got balance from snapshotter: %v", balanceResponse)

	return nil
}

func (c *SnapshotClient) GetLatestSnapshot(contract Contract) (*Snapshot, error) {
	var snapshot Snapshot
	var url string

	if c.bypass() {
		return &DummySnapshot, nil
	}

	//@TODO repeating logic here, refactor
	if *contract.Name == "FlowToken" {
		url = fmt.Sprintf(`%s/latest-snapshot`, c.BaseURL)
	} else {
		url = fmt.Sprintf(`%s/latest-snapshot/%s, %s`, c.BaseURL, *contract.Addr, *contract.Name)
	}

	req, err := c.setRequestMethod("GET", url)
	if err != nil {
		log.Debug().Err(err).Msg("SnapshotClient GetAddressBalanceAtBlockHeight request error")
		return &snapshot, err
	}

	if err := c.sendRequest(req, snapshot); err != nil {
		log.Debug().Err(err).Msgf("Snapshot GetAddressBalanceAtBlockHeight send request error.")
		return &snapshot, err
	}

	return &snapshot, nil
}

func (c *SnapshotClient) GetLatestFlowSnapshot() (*Snapshot, error) {
	var snapshot Snapshot

	// Send dummy data for tests
	if c.bypass() {
		return &DummySnapshot, nil
	}

	url := c.BaseURL + "/latest-blockheight"
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Content-Type", "application/json; charset=UTF-8")

	if err := c.sendRequest(req, &snapshot); err != nil {
		log.Debug().Err(err).Msg("SnapshotClient GetLatestBlockHeightSnapshot request error")
		return nil, err
	}

	return &snapshot, nil
}

func (c *SnapshotClient) setSnapshotUrl(contract Contract, route string) string {
	var url string
	if *contract.Name == "FlowToken" {
		url = fmt.Sprintf(`%s/%s`, c.BaseURL, route)
	} else {
		url = fmt.Sprintf(`%s/%s/%v/%v`, c.BaseURL, route, *contract.Addr, *contract.Name)
	}

	return url
}

func (c *SnapshotClient) setRequestMethod(method, url string) (*http.Request, error) {
	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		log.Debug().Err(err).Msg("SnapshotClient TakeSnapshot request error")
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json; charset=UTF-8")

	return req, nil
}

func (c *SnapshotClient) sendRequest(req *http.Request, pointer interface{}) error {
	res, err := c.HTTPClient.Do(req)
	if err != nil {
		log.Debug().Err(err).Msg("snapshot http client error")
		return err
	}

	defer res.Body.Close()

	if res.StatusCode < http.StatusOK || res.StatusCode >= http.StatusBadRequest {
		log.Debug().Msgf("snapshot error in sendRequest")
		return fmt.Errorf("unknown snapshot error, status code: %d", res.StatusCode)
	}

	log.Info().Msgf("body: %v", res.Body)
	if err = json.NewDecoder(res.Body).Decode(pointer); err != nil {
		log.Debug().Err(err).Msgf("snapshot response decode error")
		return err
	}

	return nil
}

// Don't hit snapshot service if ENV is TEST or DEV
func (c *SnapshotClient) bypass() bool {
	return c.Env == "TEST" || c.Env == "DEV" || c.Env == "STAGING"
}
