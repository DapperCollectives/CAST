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

type balanceAtBlockheight struct {
	ID              string    `json:"id"`
	FungibleTokenID string    `json:"fungibleTokenId"`
	Addr            string    `json:"address"`
	Balance         uint64    `json:"balance"`
	BlockHeight     uint64    `json:"blockHeight"`
	CreatedAt       time.Time `json:"createdAt"`
}

var (
	DummySnapshot = Snapshot{
		ID:           "1",
		Block_height: 1000000,
		Started:      time.Now(),
		Finished:     time.Now(),
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

func (c *SnapshotClient) TakeSnapshot(contract Contract) error {
	var url string
	var i interface{}
	i = &struct{}{}

	if *contract.Name == "FlowToken" {
		url = fmt.Sprintf(`%s/snapshot-flow-balances`, c.BaseURL)
	} else {
		url = fmt.Sprintf(`%s/take-snapshot/%v/%v`, c.BaseURL, contract.Addr, contract.Name)
	}

	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		log.Debug().Err(err).Msg("SnapshotClient TakeSnapshot request error")
		return err
	}

	fmt.Println("Sending request to take snapshot")

	req.Header.Set("Content-Type", "application/json; charset=UTF-8")
	if err := c.sendRequest(req, i); err != nil {
		log.Debug().Err(err).Msg("SnapshotClient takeSnapshot request error")
		return err
	}

	return nil
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

	if err = json.NewDecoder(res.Body).Decode(pointer); err != nil {
		log.Debug().Err(err).Msgf("snapshot response decode error")
		return err
	}

	return nil
}

func (c *SnapshotClient) GetAddressBalanceAtBlockHeight(
	address string,
	blockheight uint64,
	balancePointer interface{},
	contract Contract) error {
	var url string

	if c.bypass() {
		// TODO: return dummy balance
		return nil
	}

	if *contract.Name == "FlowToken" {
		url = fmt.Sprintf(`%s/balance-at-blockheight/%s/%d`, c.BaseURL, address, blockheight)
	} else {
		url = fmt.Sprintf(
			`%s/balance-at-blockheight/%s/%d/%v/%v`,
			c.BaseURL,
			address,
			blockheight,
			contract.Addr,
			contract.Name,
		)
	}

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Content-Type", "application/json; charset=UTF-8")

	if err := c.sendRequest(req, balancePointer); err != nil {
		log.Debug().Err(err).Msgf("Snapshot GetAddressBalanceAtBlockHeight send request error.")
		return err
	}

	return nil
}

func (c *SnapshotClient) GetLatestSnapshot() (*Snapshot, error) {
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

// Don't hit snapshot service if ENV is TEST or DEV
func (c *SnapshotClient) bypass() bool {
	return c.Env == "TEST" || c.Env == "DEV"
}
