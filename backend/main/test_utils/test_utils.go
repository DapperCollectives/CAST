package test_utils

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/bjartek/overflow/overflow"
	"github.com/brudfyi/flow-voting-tool/main/server"
	"github.com/brudfyi/flow-voting-tool/main/shared"
)

type OverflowTestUtils struct {
	O       *overflow.Overflow
	T       *testing.T
	A       *server.App
	Adapter *shared.FlowAdapter
}

func (otu *OverflowTestUtils) SetTest(t *testing.T) *OverflowTestUtils {
	otu.T = t
	return otu
}

func NewOverflowTest(t *testing.T, a *server.App) *OverflowTestUtils {
	return &OverflowTestUtils{T: t, O: overflow.NewOverflowEmulator().Start(), A: a}
}

// func (otu *OverflowTestUtils) GetCommunity(id int) {

// }

// func (otu *OverflowTestUtils) CallGetCommunitiesRoute() *httptest.ResponseRecorder {

// 	return response
// }

func (otu *OverflowTestUtils) ExecuteRequest(req *http.Request) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	otu.A.Router.ServeHTTP(rr, req)

	return rr
}
