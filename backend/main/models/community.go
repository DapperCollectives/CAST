package models

/////////////////
// Communities //
/////////////////

import (
	"encoding/json"
	"fmt"
	"time"

	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"
)

type Community struct {
	ID                       int       `json:"id,omitempty"`
	Name                     string    `json:"name"                            validate:"required"`
	Category                 *string   `json:"category,omitempty"              validate:"required"`
	Logo                     *string   `json:"logo,omitempty"`
	Body                     *string   `json:"body,omitempty"                  validate:"required"`
	Strategies               *[]string `json:"strategies,omitempty"`
	Strategy                 *string   `json:"strategy,omitempty"`
	Banner_img_url           *string   `json:"bannerImgUrl,omitempty"`
	Website_url              *string   `json:"websiteUrl,omitempty"`
	Twitter_url              *string   `json:"twitterUrl,omitempty"`
	Github_url               *string   `json:"githubUrl,omitempty"`
	Discord_url              *string   `json:"discordUrl,omitempty"`
	Instagram_url            *string   `json:"instagramUrl,omitempty"`
	Terms_and_conditions_url *string   `json:"termsAndConditionsUrl,omitempty"`
	Only_authors_to_submit   *bool     `json:"onlyAuthorsToSubmit,omitempty"`
	Proposal_validation      *string   `json:"proposalValidation,omitempty"`
	Proposal_threshold       *string   `json:"proposalThreshold,omitempty"`
	Slug                     *string   `json:"slug,omitempty"                  validate:"required"`

	Contract_name *string  `json:"contractName,omitempty"`
	Contract_addr *string  `json:"contractAddr,omitempty"`
	Public_path   *string  `json:"publicPath,omitempty"`
	Threshold     *float64 `json:"threshold,omitempty"`

	Timestamp            string                  `json:"timestamp"             validate:"required"`
	Composite_signatures *[]s.CompositeSignature `json:"compositeSignatures"   validate:"required"`
	Creator_addr         string                  `json:"creatorAddr"           validate:"required"`
	Signing_addr         *string                 `json:"signingAddr,omitempty"`
	Created_at           *time.Time              `json:"createdAt,omitempty"`
	Cid                  *string                 `json:"cid,omitempty"`
}

type CreateCommunityRequestPayload struct {
	Community

	Additional_authors *[]string `json:"additionalAuthors,omitempty"`
	Additional_admins  *[]string `json:"additionalAdmins,omitempty"`
}

type UpdateCommunityRequestPayload struct {
	Name                     *string   `json:"name,omitempty"`
	Category                 *string   `json:"category,omitempty"`
	Body                     *string   `json:"body,omitempty"`
	Logo                     *string   `json:"logo,omitempty"`
	Strategies               *[]string `json:"strategies,omitempty"`
	Strategy                 *string   `json:"strategy,omitempty"`
	Banner_img_url           *string   `json:"bannerImgUrl,omitempty"`
	Website_url              *string   `json:"websiteUrl,omitempty"`
	Twitter_url              *string   `json:"twitterUrl,omitempty"`
	Github_url               *string   `json:"githubUrl,omitempty"`
	Discord_url              *string   `json:"discordUrl,omitempty"`
	Instagram_url            *string   `json:"instagramUrl,omitempty"`
	Terms_and_conditions_url *string   `json:"termsAndConditionsUrl,omitempty"`
	Proposal_validation      *string   `json:"proposalValidation,omitempty"`
	Proposal_threshold       *string   `json:"proposalThreshold,omitempty"`

	s.TimestampSignaturePayload
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

func GetCommunitiesForHomePage(db *s.Database, start, count int) ([]*Community, int, error) {
	var communities []*Community

	err := pgxscan.Select(db.Context, db.Conn, &communities,
		`
		SELECT
  	*
		FROM communities WHERE discord_url IS NOT NULL
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
  	)
		LIMIT $1 OFFSET $2
		`, count, start)

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
		name, category, logo, slug, strategies, strategy, banner_img_url, website_url, twitter_url, github_url, discord_url, instagram_url, terms_and_conditions_url, proposal_validation, proposal_threshold, body, cid, creator_addr, contract_name, contract_addr, public_path, threshold, only_authors_to_submit)
	VALUES(
		$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
	)
	RETURNING id, created_at
	`, c.Name, c.Category, c.Logo, c.Slug, c.Strategies, c.Strategy, c.Banner_img_url, c.Website_url, c.Twitter_url, c.Github_url, c.Discord_url, c.Instagram_url, c.Terms_and_conditions_url, c.Proposal_validation, c.Proposal_threshold, c.Body, c.Cid, c.Creator_addr, c.Contract_name, c.Contract_addr, c.Public_path, c.Threshold, c.Only_authors_to_submit).Scan(&c.ID, &c.Created_at)
	return err // will be nil unless something went wrong
}

func (c *Community) UpdateCommunity(db *s.Database, payload *UpdateCommunityRequestPayload) error {
	// First, merge the CommunityRequst
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	json.Unmarshal(data, c)

	_, err = db.Conn.Exec(
		db.Context,
		`
	UPDATE communities
	SET name = $1, body = $2, logo = $3, strategies = $4, strategy = $5, 
		banner_img_url = $6, website_url = $7, twitter_url = $8, github_url = $9,
		discord_url = $10, instagram_url = $11, proposal_validation = $12, proposal_threshold = $13, category = $14, terms_and_conditions_url = $15
	WHERE id = $16
	`,
		c.Name,
		c.Body,
		c.Logo,
		c.Strategies,
		c.Strategy,
		c.Banner_img_url,
		c.Website_url,
		c.Twitter_url,
		c.Github_url,
		c.Discord_url,
		c.Instagram_url,
		c.Proposal_validation,
		c.Proposal_threshold,
		c.Category,
		c.Terms_and_conditions_url,
		c.ID,
	)

	return err // will be nil unless something went wrong
}

func (c *Community) CanUpdateCommunity(db *s.Database, addr string) error {
	// Check if address has admin role
	admin := CommunityUser{Addr: addr, Community_id: c.ID, User_type: "admin"}
	if err := admin.GetCommunityUser(db); err != nil {
		return fmt.Errorf("address %s does not have permission to update community with ID %d", addr, c.ID)
	}
	return nil
}
