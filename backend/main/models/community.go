package models

/////////////////
// Communities //
/////////////////

import (
	"time"

	s "github.com/brudfyi/flow-voting-tool/main/shared"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"
)

type Community struct {
	ID                   int                     `json:"id,omitempty"`
	Name                 string                  `json:"name" validate:"required"`
	Logo                 *string                 `json:"logo,omitempty"`
	Created_at           *time.Time              `json:"createdAt,omitempty"`
	Cid                  *string                 `json:"cid,omitempty"`
	Slug                 *string                 `json:"slug,omitempty" validate:"required"`
	Strategies           *[]string               `json:"strategies,omitempty"`
	Strategy             *string                 `json:"strategy,omitempty"`
	Proposal_validation  *string                 `json:"proposalValidation,omitempty"`
	Proposal_threshold   *string                 `json:"proposalThreshold,omitempty"`
	Body                 *string                 `json:"body,omitempty" validate:"required"`
	Timestamp            string                  `json:"timestamp" validate:"required"`
	Composite_signatures *[]s.CompositeSignature `json:"compositeSignatures" validate:"required"`
	Creator_addr         string                  `json:"creatorAddr" validate:"required"`
}

func (c *Community) GetCommunity(db *s.Database) error {
	return pgxscan.Get(db.Context, db.Conn, c,
		`SELECT * from communities WHERE id = $1`,
		c.ID)
}

func GetCommunities(db *s.Database, start, count int) ([]*Community, int, error) {
	var communities []*Community
	err := pgxscan.Select(db.Context, db.Conn, &communities,
		`
		SELECT * FROM communities
		LIMIT $1 OFFSET $2
		`, count, start)

	// If we get pgx.ErrNoRows, just return an empty array
	// and obfuscate error
	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		return nil, 0, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return []*Community{}, 0, nil
	}

	// Get total number of communities
	var totalRecords int
	countSql := `SELECT COUNT(*) FROM communities`
	_ = db.Conn.QueryRow(db.Context, countSql).Scan(&totalRecords)

	return communities, totalRecords, nil
}

func (c *Community) CreateCommunity(db *s.Database) error {
	err := db.Conn.QueryRow(db.Context,
		`
	INSERT INTO communities(name, logo, slug, strategies, strategy, proposal_validation, proposal_threshold, body, cid, creator_addr)
	VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	RETURNING id, created_at
	`, c.Name, c.Logo, c.Slug, c.Strategies, c.Strategy, c.Proposal_validation, c.Proposal_threshold, c.Body, c.Cid, c.Creator_addr).Scan(&c.ID, &c.Created_at)

	return err // will be nil unless something went wrong
}

func (c *Community) UpdateCommunity(db *s.Database) error {
	_, err := db.Conn.Exec(db.Context,
		`
	UPDATE communities
	SET name = $1, body = $2, logo = $3, slug = $4, strategies = $5, strategy = $6, proposal_validation = $7, proposal_threshold = $8
	WHERE id = $9
	`, c.Name, c.Body, c.Logo, c.Slug, c.Strategies, c.Strategy, c.Proposal_validation, c.Proposal_threshold, c.ID)

	return err // will be nil unless something went wrong
}
