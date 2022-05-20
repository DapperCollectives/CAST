package models

import (
	"math"
	"time"

	s "github.com/brudfyi/flow-voting-tool/main/shared"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
)

type ProposalResults struct {
	Proposal_id   int                `json:"proposalId" validate:"required"`
	Results       map[string]int     `json:"results" validate:"required"`
	Results_float map[string]float64 `json:"resultsFloat" validate:"required"`
	Updated_at    time.Time          `json:"updatedAt" validate:"required"`
	Cid           *string            `json:"cid,omitempty"`
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

func (r *ProposalResults) Tally(db *s.Database, p *Proposal) error {
	// Create results map from proposal choices
	r.Results = map[string]int{}
	for i := 0; i < len(p.Choices); i++ {
		r.Results[p.Choices[i].Choice_text] = 0
	}
	// Fetch vote tallys & iterate through them, saving on results.

	var rows pgx.Rows
	var sql string

	// TODO: break these cases out into seperate functions
	switch *p.Strategy {

	// Includes staking + non-staking balances
	case "token-weighted-default":
		log.Debug().Msgf("Proposal Results: %s", "token-weighted-default")
		sql = `
			SELECT v.choice, SUM(b.primary_account_balance) as tally FROM votes v
			JOIN proposals p ON p.id = $1
			JOIN balances b ON b.addr = v.addr AND b.block_height = p.block_height
			WHERE v.proposal_id = $1
			GROUP BY choice
		`
		rows, _ = db.Conn.Query(db.Context, sql, r.Proposal_id)
	case "staked-token-weighted-default":
		log.Debug().Msgf("Proposal Results: %s", "staked-token-weighted-default")
		sql = `
			SELECT v.choice, SUM(b.staking_balance) as tally FROM votes v
			JOIN proposals p ON p.id = $1
			JOIN balances b ON b.addr = v.addr AND b.block_height = p.block_height
			WHERE v.proposal_id = $1
			GROUP BY choice
		`
		rows, _ = db.Conn.Query(db.Context, sql, r.Proposal_id)
	case "token-weighted-capped":
		log.Debug().Msgf("Proposal Results: %s", "token-weighted-capped")
		// THIS NEEDS TO BE UPDATED, DOESNT WORK AS IS
		sql = `
			SELECT t1.choice, COALESCE(SUM(weight), 0) as tally from
			(
				SELECT v.choice,
					CASE WHEN (b.primary_account_balance + b.staking_balance) > $1 THEN $1
					ELSE COALESCE(b.primary_account_balance + b.staking_balance, 0)
					END as weight
				FROM votes v
				JOIN balances b ON b.proposal_id = v.proposal_id
				WHERE v.proposal_id = $2
			) as t1
			GROUP BY t1.choice
		`
		rows, _ = db.Conn.Query(db.Context, sql, p.Max_weight, r.Proposal_id)
	default: // one account, one vote
		log.Warn().Msgf("Warning: using default strategy, one-account one-vote")
		sql = `
			SELECT choice, COUNT(choice) as tally FROM votes v
			WHERE v.proposal_id = $1
			GROUP BY choice
		`
		rows, _ = db.Conn.Query(db.Context, sql, r.Proposal_id)
	}

	for rows.Next() {
		var choice string
		var tally uint64
		err := rows.Scan(&choice, &tally)
		if err != nil {
			return err
		}
		log.Debug().Msgf("choice: %s, tally: %d\n", choice, tally)
		r.Results[choice] = int(float64(tally) * math.Pow(10, -8))
	}
	return nil
}

// Currently this isn't being used, we are just calculating
// results on every API call and not caching.
func (r *ProposalResults) Save(db *s.Database) error {
	// TODO: Commit to IPFS?

	// Save new proposal_result row
	err := db.Conn.QueryRow(db.Context,
		`
		INSERT INTO proposal_results(proposal_id, results)
		VALUES($1, $2)
		RETURNING updated_at
		`, r.Proposal_id, r.Results).Scan(&r.Updated_at)

	return err
}
