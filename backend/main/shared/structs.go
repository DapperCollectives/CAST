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

type PageParams struct {
	Start        int
	Count        int
	Order        string
	TotalRecords int
}

type SearchFilter struct {
	Text   string `json:"text"`
	Amount int    `json:"amount"`
}

type CompositeSignature struct {
	Addr      string  `json:"addr"`
	Key_id    uint    `json:"keyId"`
	Signature string  `json:"signature"`
	F_type    *string `json:"f_type,omitempty"`
	F_vsn     *string `json:"f_vsn,omitempty"`
}

type TimestampSignaturePayload struct {
	Composite_signatures *[]CompositeSignature `json:"compositeSignatures"`
	Signing_addr         string                `json:"signingAddr"`
	Timestamp            string                `json:"timestamp"`
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

type CustomScript struct {
	Key         string `json:"key" validate:"required"`
	Name        string `json:"name" validate:"required"`
	Description string `json:"description" validate:"required"`
	Src         string `json:"src" validate:"required"`
}

func (b *FTBalanceResponse) NewFTBalance() {
	if os.Getenv("APP_ENV") == "TEST" || os.Getenv("APP_ENV") == "DEV" {
		b.PrimaryAccountBalance = 11100000
		b.SecondaryAccountBalance = 12300000
		b.StakingBalance = 13500000
	} else {
		b.PrimaryAccountBalance = 0
		b.SecondaryAccountBalance = 0
		b.StakingBalance = 0
	}
}

// Underlying value of payload needs to be a slice
func GetPaginatedResponseWithPayload(payload interface{}, p PageParams) *PaginatedResponse {
	// Tricky way of getting the length of a slice
	// that is typed as interface{}

	_count := reflect.ValueOf(payload).Len()
	_count = _count + 1
	var next int
	// print p.Start + _count to the console
	if p.Start+_count >= p.TotalRecords {
		next = -1
	} else {
		next = p.Start + _count
	}
	response := PaginatedResponse{
		Data:         payload,
		Start:        p.Start,
		Count:        _count,
		TotalRecords: p.TotalRecords,
		Next:         next,
	}

	return &response
}
