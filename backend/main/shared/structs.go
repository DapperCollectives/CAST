package shared

import (
	"context"
	"os"
	"reflect"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"
)

type Config struct {
	Features map[string]bool `default:"useCorsMiddleware:false,validateTimestamps:true,validateAllowlist:true,validateBlocklist:true,validateSigs:true"`
}

type Database struct {
	Conn    *pgxpool.Pool
	Context context.Context
	Name    string
	Env     *string
}

type StrategyStruct struct {
	FlowAdapter *FlowAdapter
	DB          *Database
}

type Allowlist struct {
	Addresses []string `json:"addresses"`
}

type PaginatedResponse struct {
	Data         interface{} `json:"data"`
	Start        int         `json:"start"`
	Count        int         `json:"count"`
	TotalRecords int         `json:"totalRecords"`
	Next         int         `json:"next"`
}

type CompositeSignature struct {
	Addr      string  `json:"addr"`
	Key_id    uint    `json:"keyId"`
	Signature string  `json:"signature"`
	F_type    *string `json:"f_type,omitempty"`
	F_vsn     *string `json:"f_vsn,omitempty"`
}

type TimestampSignaturePayload struct {
	Composite_signatures *[]CompositeSignature `json:"compositeSignatures" validate:"required"`
	Signing_addr         string                `json:"signingAddr"         validate:"required"`
	Timestamp            string                `json:"timestamp"           validate:"required"`
}

// used in models/proposal.go
type Choice struct {
	Choice_text    string  `json:"choiceText"`
	Choice_img_url *string `json:"choiceImgUrl"`
}

type MintParams struct {
	Recipient            string
	Name                 string
	Description          string
	Thumbnail            string
	Cuts                 []float64
	RoyaltyDescriptions  []string
	RoyaltyBeneficiaries []string
}

type FTBalanceResponse struct {
	ID                      string    `json:"id,omitempty"`
	FungibleTokenID         string    `json:"fungibleTokenId"`
	Addr                    string    `json:"addr"`
	PrimaryAccountBalance   uint64    `json:"primaryAccountBalance"`
	SecondaryAddress        string    `json:"secondaryAddress"`
	SecondaryAccountBalance uint64    `json:"secondaryAccountBalance"`
	Balance                 uint64    `json:"balance"`
	StakingBalance          uint64    `json:"stakingBalance"`
	ScriptResult            string    `json:"scriptResult"`
	Stakes                  []string  `json:"stakes"`
	BlockHeight             uint64    `json:"blockHeight"`
	Proposal_id             int       `json:"proposal_id"`
	NFTCount                int       `json:"nftCount"`
	CreatedAt               time.Time `json:"createdAt"`
}

func (b *FTBalanceResponse) NewFTBalance() {
	if os.Getenv("APP_ENV") == "TEST" || os.Getenv("APP_ENV") == "DEV" {
		b.PrimaryAccountBalance = 100
		b.SecondaryAccountBalance = 100
		b.StakingBalance = 100
	}
}

// Underlying value of payload needs to be a slice
func GetPaginatedResponseWithPayload(payload interface{}, start, count, totalRecords int) *PaginatedResponse {
	// Tricky way of getting the length of a slice
	// that is typed as interface{}
	_count := reflect.ValueOf(payload).Len()
	var next int
	if start+_count >= totalRecords {
		next = -1
	} else {
		next = start + _count
	}
	response := PaginatedResponse{
		Data:         payload,
		Start:        start,
		Count:        _count,
		TotalRecords: totalRecords,
		Next:         next,
	}

	return &response
}
