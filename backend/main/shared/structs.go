package shared

import (
	"context"
	"reflect"

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
	Signing_addr         string                `json:"signingAddr" validate:"required"`
	Timestamp            string                `json:"timestamp" validate:"required"`
}

// used in models/proposal.go
type Choice struct {
	Choice_text    string  `json:"choiceText"`
	Choice_img_url *string `json:"choiceImgUrl"`
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
