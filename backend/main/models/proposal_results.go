package models

import (
	"time"

	s "github.com/brudfyi/flow-voting-tool/main/shared"
	"github.com/georgysavva/scany/pgxscan"
)

type ProposalResults struct {
	Proposal_id   int                `json:"proposalId" validate:"required"`
	Results       map[string]int     `json:"results" validate:"required"`
	Results_float map[string]float64 `json:"resultsFloat" validate:"required"`
	Updated_at    time.Time          `json:"updatedAt" validate:"required"`
	Cid           *string            `json:"cid,omitempty"`
}

func NewProposalResults(id int) *ProposalResults {
	p := new(ProposalResults)
	p.Results = map[string]int{
		"a": 0,
		"b": 0,
	}
	p.Results_float = map[string]float64{
		"a": 0.00,
		"b": 0.00,
	}
	p.Proposal_id = id
	return p
}

func (r *ProposalResults) GetLatestProposalResultsById(db *s.Database) error {
	return pgxscan.Get(db.Context, db.Conn, r,
		`
		SELECT * FROM proposal_results
		WHERE proposal_id = $1
		ORDER BY updated_at DESC
		LIMIT 1
		`, r.Proposal_id)
}
