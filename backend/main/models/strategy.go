package models

import (
	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/georgysavva/scany/pgxscan"
)

type VotingStrategy struct {
	Key         string `json:"key" validate:"required"`
	Name        string `json:"name" validate:"required"`
	Description string `json:"description,omitempty"`
}

func GetVotingStrategies(db *s.Database) ([]*VotingStrategy, error) {
	var votingStrategies []*VotingStrategy
	err := pgxscan.Select(db.Context, db.Conn, &votingStrategies,
		`
		SELECT * FROM voting_strategies
		`)

	if err != nil {
		return nil, err
	}
	return votingStrategies, nil
}

func IsNFTStrategy(name string) bool {
	return name == "balance-of-nfts" || name == "float-nfts"
}
