package shared

import (
	"context"
	"reflect"

	"github.com/jackc/pgx/v4/pgxpool"
)

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
