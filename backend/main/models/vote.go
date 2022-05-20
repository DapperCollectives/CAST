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
	TransactionId        string                  `json:"transactionId"`
}

type VoteWithBalance struct {
	// Extend Vote
	Vote
	// Balance
	BlockHeight             uint64   `json:"blockHeight"`
	Balance                 *uint64  `json:"balance"`
	PrimaryAccountBalance   *uint64  `json:"primaryAccountBalance"`
	SecondaryAccountBalance *uint64  `json:"secondaryAccountBalance"`
	StakingBalance          *uint64  `json:"stakingBalance"`
	Weight                  *float64 `json:"weight"`
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

func GetVotesForProposal(db *s.Database, start, count int, order string, proposalId int) ([]*VoteWithBalance, int, error) {
	var votes []*VoteWithBalance
	var orderBySql string
	if order == "desc" {
		orderBySql = "ORDER BY b.created_at DESC"
	} else {
		orderBySql = "ORDER BY b.created_at ASC"
	}

	//return all balances, strategy will do rest of the work
	sql := `select v.*, p.block_height, 
		b.primary_account_balance,
		b.secondary_account_balance,
		b.staking_balance
    from votes v
    join proposals p on p.id = $3
  	left join balances b on b.addr = v.addr 
		and p.block_height = b.block_height
    where proposal_id = $3`

	sql = sql + orderBySql
	sql = sql + " LIMIT $1 OFFSET $2"

	err := pgxscan.Select(db.Context, db.Conn, &votes, sql, count, start, proposalId)

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
	encodedChoice := vars[1]
	choiceBytes, err := hex.DecodeString(encodedChoice)

	if err != nil {
		return errors.New("couldnt decode choice in message from hex string")
	}

	validChoice := false
	for _, choice := range proposal.Choices {
		if choice.Choice_text == string(choiceBytes) {
			validChoice = true
			break
		}
	}
	if !validChoice {
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
	validChoice := false
	for _, choice := range proposal.Choices {
		if choice.Choice_text == v.Choice {
			validChoice = true
			break
		}
	}
	if !validChoice {
		return errors.New("invalid choice for proposal")
	}
	return nil
}
