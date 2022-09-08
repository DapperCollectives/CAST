package models

/////////////////
// Communities //
/////////////////

import (
	"fmt"
	"time"

	"github.com/DapperCollectives/CAST/backend/main/shared"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"
)

type Community struct {
	ID                       int         `json:"id,omitempty"`
	Name                     string      `json:"name,omitempty"`
	Category                 *string     `json:"category,omitempty"              validate:"required"`
	Logo                     *string     `json:"logo,omitempty"`
	Body                     *string     `json:"body,omitempty"`
	Strategies               *[]Strategy `json:"strategies,omitempty"`
	Strategy                 *string     `json:"strategy,omitempty"`
	Banner_img_url           *string     `json:"bannerImgUrl,omitempty"`
	Website_url              *string     `json:"websiteUrl,omitempty"`
	Twitter_url              *string     `json:"twitterUrl,omitempty"`
	Github_url               *string     `json:"githubUrl,omitempty"`
	Discord_url              *string     `json:"discordUrl,omitempty"`
	Instagram_url            *string     `json:"instagramUrl,omitempty"`
	Terms_and_conditions_url *string     `json:"termsAndConditionsUrl,omitempty"`
	Only_authors_to_submit   *bool       `json:"onlyAuthorsToSubmit,omitempty"`
	Proposal_validation      *string     `json:"proposalValidation,omitempty"`
	Proposal_threshold       *string     `json:"proposalThreshold,omitempty"`
	Slug                     *string     `json:"slug,omitempty"                  validate:"required"`
	Is_featured              *bool       `json:"isFeatured,omitempty"`

	Contract_name *string `json:"contractName,omitempty"`
	Contract_addr *string `json:"contractAddr,omitempty"`
	Contract_type *string `json:"contractType,omitempty"`
	Public_path   *string `json:"publicPath,omitempty"`

	Timestamp            string                  `json:"timestamp"             validate:"required"`
	Composite_signatures *[]s.CompositeSignature `json:"compositeSignatures"`
	Creator_addr         string                  `json:"creatorAddr"           validate:"required"`
	Signing_addr         *string                 `json:"signingAddr,omitempty"`
	Voucher              *shared.Voucher         `json:"voucher,omitempty"`
	Created_at           *time.Time              `json:"createdAt,omitempty"`
	Cid                  *string                 `json:"cid,omitempty"`
}

type CreateCommunityRequestPayload struct {
	Community

	Additional_authors *[]string `json:"additionalAuthors,omitempty"`
	Additional_admins  *[]string `json:"additionalAdmins,omitempty"`
}

type UpdateCommunityRequestPayload struct {
	Name                     *string         `json:"name,omitempty"`
	Category                 *string         `json:"category,omitempty"`
	Body                     *string         `json:"body,omitempty"`
	Logo                     *string         `json:"logo,omitempty"`
	Strategies               *[]Strategy     `json:"strategies,omitempty"`
	Strategy                 *string         `json:"strategy,omitempty"`
	Banner_img_url           *string         `json:"bannerImgUrl,omitempty"`
	Website_url              *string         `json:"websiteUrl,omitempty"`
	Twitter_url              *string         `json:"twitterUrl,omitempty"`
	Github_url               *string         `json:"githubUrl,omitempty"`
	Discord_url              *string         `json:"discordUrl,omitempty"`
	Instagram_url            *string         `json:"instagramUrl,omitempty"`
	Terms_and_conditions_url *string         `json:"termsAndConditionsUrl,omitempty"`
	Proposal_validation      *string         `json:"proposalValidation,omitempty"`
	Proposal_threshold       *string         `json:"proposalThreshold,omitempty"`
	Only_authors_to_submit   *bool           `json:"onlyAuthorsToSubmit,omitempty"`
	Voucher                  *shared.Voucher `json:"voucher,omitempty"`

	//TODO dup fields in Community struct, make sub struct for both to use
	Contract_name *string  `json:"contractName,omitempty"`
	Contract_addr *string  `json:"contractAddr,omitempty"`
	Contract_type *string  `json:"contractType,omitempty"`
	Public_path   *string  `json:"publicPath,omitempty"`
	Threshold     *float64 `json:"threshold,omitempty"`

	s.TimestampSignaturePayload
}

type Strategy struct {
	Name            *string `json:"name,omitempty"`
	shared.Contract `json:"contract,omitempty"`
}

type CommunityType struct {
	Key         string `json:"key"                   validate:"required"`
	Name        string `json:"name"                  validate:"required"`
	Description string `json:"description,omitempty"`
}

func GetCommunityTypes(db *s.Database) ([]*CommunityType, error) {
	var communityTypes []*CommunityType
	err := pgxscan.Select(db.Context, db.Conn, &communityTypes,
		`
		SELECT * FROM community_types
		`)

	if err != nil {
		return nil, err
	}
	return communityTypes, nil
}

func (c *Community) GetCommunity(db *s.Database) error {
	return pgxscan.Get(db.Context, db.Conn, c,
		`SELECT * from communities WHERE id = $1`,
		c.ID)
}

func GetCommunities(db *s.Database, pageParams shared.PageParams) ([]*Community, int, error) {
	var communities []*Community
	err := pgxscan.Select(db.Context, db.Conn, &communities,
		`
		SELECT * FROM communities
		LIMIT $1 OFFSET $2
		`, pageParams.Count, pageParams.Start)

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

func (c *Community) GetCommunityByProposalId(db *s.Database, proposalId int) error {
	return pgxscan.Get(db.Context, db.Conn, c,
		`SELECT * from communities WHERE id = (SELECT community_id FROM proposals WHERE id = $1)`,
		proposalId)
}

func GetCommunitiesForHomePage(db *s.Database, params shared.PageParams) ([]*Community, int, error) {
	var communities []*Community

	err := pgxscan.Select(db.Context, db.Conn, &communities,
		`
		SELECT
  	*
		FROM communities WHERE (discord_url IS NOT NULL
		AND twitter_url IS NOT NULL
  	AND id IN (
    	SELECT community_id
    	FROM community_users
    	GROUP BY community_id
    	HAVING COUNT(*) > 500
  	)
  	AND id IN (
    	SELECT community_id
    	FROM proposals
    	WHERE status = 'published' AND end_time < (NOW() AT TIME ZONE 'UTC')
    	GROUP BY community_id
    	HAVING COUNT(*) >= 2
  	))
	OR is_featured = 'true'
		LIMIT $1 OFFSET $2
		`, params.Count, params.Start)

	// If we get pgx.ErrNoRows, just return an empty array
	// and obfuscate error
	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		return nil, 0, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return []*Community{}, 0, nil
	}

	var totalRecords int
	countSql := `SELECT COUNT(*) FROM communities`
	db.Conn.QueryRow(db.Context, countSql).Scan(&totalRecords)
	return communities, totalRecords, nil
}

func (c *Community) CreateCommunity(db *s.Database) error {
	err := db.Conn.QueryRow(db.Context,
		`
	INSERT INTO communities(
		name, 
		category, 
		logo, 
		slug, 
		strategies, 
		strategy, 
		banner_img_url, 
		website_url, 
		twitter_url, 
		github_url, 
		discord_url, 
		instagram_url, 
		terms_and_conditions_url, 
		proposal_validation, 
		proposal_threshold, 
		body, 
		cid, 
		creator_addr, 
		contract_name, 
		contract_addr, 
		contract_type, 
		public_path, 
		only_authors_to_submit, 
		voucher)
	VALUES(
		$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 
		$14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
	)
	RETURNING id, created_at
	`, c.Name,
		c.Category,
		c.Logo,
		c.Slug,
		c.Strategies,
		c.Strategy,
		c.Banner_img_url,
		c.Website_url,
		c.Twitter_url,
		c.Github_url,
		c.Discord_url,
		c.Instagram_url,
		c.Terms_and_conditions_url,
		c.Proposal_validation,
		c.Proposal_threshold,
		c.Body,
		c.Cid,
		c.Creator_addr,
		c.Contract_name,
		c.Contract_addr,
		c.Contract_type,
		c.Public_path,
		c.Only_authors_to_submit,
		c.Voucher).
		Scan(&c.ID, &c.Created_at)
	return err
}

func (c *Community) UpdateCommunity(db *s.Database, p *UpdateCommunityRequestPayload) error {
	_, err := db.Conn.Exec(
		db.Context,
		`UPDATE communities
	SET name = COALESCE($1, name), 
	body = COALESCE($2, body), 
	logo = COALESCE($3, logo), 
	strategies = COALESCE($4, strategies), 
	strategy = COALESCE($5, strategy),
	banner_img_url = COALESCE($6, banner_img_url),
	website_url = COALESCE($7, website_url),
	twitter_url = COALESCE($8, twitter_url),
	github_url = COALESCE($9, github_url),
	discord_url = COALESCE($10, discord_url),
	instagram_url = COALESCE($11, instagram_url),
	proposal_validation = COALESCE($12, proposal_validation),
	proposal_threshold = COALESCE($13, proposal_threshold),
	category = COALESCE($14, category),
	terms_and_conditions_url = COALESCE($15, terms_and_conditions_url),
	contract_name = COALESCE($16, contract_name),
	contract_addr = COALESCE($17, contract_addr),
	contract_type = COALESCE($18, contract_type),
	public_path = COALESCE($19, public_path),
	only_authors_to_submit = COALESCE($20, only_authors_to_submit)
	WHERE id = $21
	`,
		p.Name,
		p.Body,
		p.Logo,
		p.Strategies,
		p.Strategy,
		p.Banner_img_url,
		p.Website_url,
		p.Twitter_url,
		p.Github_url,
		p.Discord_url,
		p.Instagram_url,
		p.Proposal_validation,
		p.Proposal_threshold,
		p.Category,
		p.Terms_and_conditions_url,
		p.Contract_name,
		p.Contract_addr,
		p.Contract_type,
		p.Public_path,
		p.Only_authors_to_submit,
		c.ID,
	)

	return err
}

func (c *Community) CanUpdateCommunity(db *s.Database, addr string) error {
	// Check if address has admin role
	admin := CommunityUser{Addr: addr, Community_id: c.ID, User_type: "admin"}
	if err := admin.GetCommunityUser(db); err != nil {
		return fmt.Errorf("address %s does not have permission to update community with ID %d", addr, c.ID)
	}
	return nil
}

func SearchForCommunity(db *s.Database, query string) ([]Community, error) {
	var results []Community

	rows, err := db.Conn.Query(
		db.Context,
		`SELECT DISTINCT(event_type) FROM storm_events WHERE DIFFERENCE(event_type, 'test') > 2`,
		query,
	)
	if err != nil {
		return results, fmt.Errorf("error searching for a community with the the param %s", query)
	}

	if err := rows.Scan(results); err != nil {
		return []Community{}, fmt.Errorf("could not scan the query results into the community struct, type mismatch")
	}
	return results, nil
}

func MatchStrategyByProposal(s []Strategy, strategyToMatch string) (Strategy, error) {
	var match Strategy
	for _, strategy := range s {
		if *strategy.Name == strategyToMatch {
			match = strategy
			return match, nil
		}
	}
	return match, fmt.Errorf("Community does not have strategy avaliable")
}
