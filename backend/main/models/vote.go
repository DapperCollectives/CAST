package models

import (
	"encoding/hex"
	"errors"
	"strconv"
	"strings"
	"time"

	s "github.com/brudfyi/flow-voting-tool/main/shared"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"
	"github.com/thoas/go-funk"
)

type Vote struct {
	ID                   int                     `json:"id,omitempty"`
	Proposal_id          int                     `json:"proposalId"`
	Addr                 string                  `json:"addr" validate:"required"`
	Choice               string                  `json:"choice" validate:"required"`
	Composite_signatures *[]s.CompositeSignature `json:"compositeSignatures" validate:"required"`
	Created_at           time.Time               `json:"createdAt,omitempty"`
	Cid                  *string                 `json:"cid"`
	Message              string                  `json:"message"`
}

type VoteWithBalance struct {
	// Extend Vote
	Vote
	// Balance
	BlockHeight uint64  `json:"blockHeight"`
	Balance     *uint64 `json:"balance"`
}

const (
	timestampExpiry = 60
)

///////////
// Votes //
///////////

// TODO: make the proposalIds optional
func GetVotesForAddress(db *s.Database, start, count int, address string, proposalIds *[]int) ([]*Vote, int, error) {
	var votes []*Vote
	var err error
	sql := `
		SELECT * FROM votes
		WHERE addr = $3`
	// Conditionally add proposal_id condition
	if len(*proposalIds) > 0 {
		sql = sql + " AND proposal_id = ANY($4)"
		sql = sql + "LIMIT $1 OFFSET $2 "
		err = pgxscan.Select(db.Context, db.Conn, &votes,
			sql, count, start, address, *proposalIds)
	} else {
		sql = sql + "LIMIT $1 OFFSET $2 "
		err = pgxscan.Select(db.Context, db.Conn, &votes,
			sql, count, start, address)
	}

	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		return nil, 0, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return []*Vote{}, 0, nil
	}

	// Get total number of votes on proposal
	var totalRecords int
	countSql := `
		SELECT COUNT(*) FROM votes WHERE addr = $1 and proposal_id = ANY($2)
	`
	_ = db.Conn.QueryRow(db.Context, countSql, address, *proposalIds).Scan(&totalRecords)
	return votes, totalRecords, nil
}

func GetVotesForProposal(db *s.Database, start, count int, proposalId int) ([]*VoteWithBalance, int, error) {
	var votes []*VoteWithBalance
	err := pgxscan.Select(db.Context, db.Conn, &votes,
		`
		SELECT v.*, p.block_height,
		COALESCE(b.staking_balance,0) as balance 
		FROM votes v
		JOIN proposals p ON p.id = $3
		LEFT JOIN balances b ON b.addr = v.addr and p.block_height = b.block_height
		WHERE proposal_id = $3
		LIMIT $1 OFFSET $2
		`, count, start, proposalId)

	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		return nil, 0, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return []*VoteWithBalance{}, 0, nil
	}

	// Get total number of votes on proposal
	var totalRecords int
	countSql := `SELECT COUNT(*) FROM votes WHERE proposal_id = $1`
	_ = db.Conn.QueryRow(db.Context, countSql, proposalId).Scan(&totalRecords)
	return votes, totalRecords, nil
}

func (v *Vote) GetVote(db *s.Database) error {
	return pgxscan.Get(db.Context, db.Conn, v,
		`SELECT * from votes
		WHERE proposal_id = $1 AND addr = $2`,
		v.Proposal_id, v.Addr)
}

func (v *Vote) GetVoteById(db *s.Database) error {
	return pgxscan.Get(db.Context, db.Conn, v,
		`SELECT * from votes
		WHERE id = $1`,
		v.ID)
}

func (v *Vote) CreateVote(db *s.Database) error {
	err := db.Conn.QueryRow(db.Context,
		`
		INSERT INTO votes(proposal_id, addr, choice, composite_signatures, cid, message)
		VALUES($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at
	`, v.Proposal_id, v.Addr, v.Choice, v.Composite_signatures, v.Cid, v.Message).Scan(&v.ID, &v.Created_at)

	return err // will be nil unless something went wrong
}

func (v *Vote) ValidateMessage(proposal Proposal) error {
	vars := strings.Split(v.Message, ":")

	// check proposal choices to see if choice is valid
	availableChoices := proposal.Choices
	encodedChoice := vars[1]
	choiceBytes, err := hex.DecodeString(encodedChoice)

	if err != nil {
		return errors.New("couldnt decode choice in message from hex string")
	}

	if !funk.Contains(availableChoices, string(choiceBytes)) {
		return errors.New("invalid choice for proposal")
	}

	// check timestamp and ensure no longer than 60 seconds has passed
	timestamp, _ := strconv.ParseInt(vars[2], 10, 64)
	uxTime := time.Unix(timestamp/1000, (timestamp%1000)*1000*1000)
	diff := time.Now().UTC().Sub(uxTime).Seconds()
	if diff > timestampExpiry {
		return errors.New("timestamp on request has expired")
	}

	return nil
}

func (v *Vote) ValidateChoice(proposal Proposal) error {
	if !funk.Contains(proposal.Choices, v.Choice) {
		return errors.New("invalid choice")
	}
	return nil
}
