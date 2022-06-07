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

func NewProposalResults(id int, choices []s.Choice) *ProposalResults {

	p := new(ProposalResults)
	p.Results = make(map[string]int)
	p.Results_float = make(map[string]float64)

	for _, choice := range choices {
		if choice.Choice_img_url == nil {
			p.Results[choice.Choice_text] = 0
			p.Results_float[choice.Choice_text] = 0.0
		} else {
			p.Results[*choice.Choice_img_url] = 0
			p.Results_float[*choice.Choice_img_url] = 0.0
		}
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
