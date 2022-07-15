package models

import (
	"time"

	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
)

type Balance struct {
	ID                      string    `json:"id"`
	Addr                    string    `json:"addr"`
	PrimaryAccountBalance   uint64    `json:"primaryAccountBalance"`
	SecondaryAddress        string    `json:"secondaryAddress"`
	SecondaryAccountBalance uint64    `json:"secondaryAccountBalance"`
	StakingBalance          uint64    `json:"stakingBalance"`
	ScriptResult            string    `json:"scriptResult"`
	Stakes                  []string  `json:"stakes"`
	BlockHeight             uint64    `json:"blockHeight"`
	Proposal_id             int       `json:"proposal_id"`
	NFTCount                int       `json:"nftCount"`
	CreatedAt               time.Time `json:"createdAt"`
}

func (b *Balance) GetBalanceByAddressAndBlockHeight(db *s.Database) error {
	sql := `
	SELECT * from balances as b
	WHERE b.addr = $1 and b.block_height = $2
	`
	return pgxscan.Get(db.Context, db.Conn, b, sql, b.Addr, b.BlockHeight)
}

func (b *Balance) CreateBalance(db *s.Database) error {
	// Skip for test/dev.
	if *db.Env == "TEST" || *db.Env == "DEV" {
		return nil
	}

	// Build SQL query to insert balances to DB
	sql := `
	INSERT INTO balances (addr, primary_account_balance, secondary_address,
	    secondary_account_balance, staking_balance, script_result, stakes, block_height, id)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := db.Conn.Exec(db.Context, sql,
		b.Addr, b.PrimaryAccountBalance, b.SecondaryAddress, b.SecondaryAccountBalance,
		b.StakingBalance, b.ScriptResult, b.Stakes, b.BlockHeight, uuid.New(),
	)

	if err != nil {
		log.Debug().Err(err).Msg("error inserting balance into DB")
		return err
	}

	return nil
}
