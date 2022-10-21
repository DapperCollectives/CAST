package models

///////////////
// Proposals //
///////////////

import (
	"fmt"
	"math"
	"os"
	"strings"
	"time"

	"github.com/DapperCollectives/CAST/backend/main/shared"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"
)

type Proposal struct {
	ID                   int                     `json:"id,omitempty"`
	Name                 string                  `json:"name" validate:"required"`
	Community_id         int                     `json:"communityId"`
	Choices              []s.Choice              `json:"choices" validate:"required"`
	Strategy             *string                 `json:"strategy,omitempty"`
	Max_weight           *float64                `json:"maxWeight,omitempty"`
	Min_balance          *float64                `json:"minBalance,omitempty"`
	Creator_addr         string                  `json:"creatorAddr" validate:"required"`
	Start_time           time.Time               `json:"startTime" validate:"required"`
	Result               *string                 `json:"result,omitempty"`
	End_time             time.Time               `json:"endTime" validate:"required"`
	Created_at           *time.Time              `json:"createdAt,omitempty"`
	Cid                  *string                 `json:"cid,omitempty"`
	Status               *string                 `json:"status,omitempty"`
	Body                 *string                 `json:"body,omitempty" validate:"required"`
	Block_height         *uint64                 `json:"block_height"`
	Total_votes          int                     `json:"total_votes"`
	Timestamp            string                  `json:"timestamp" validate:"required"`
	Composite_signatures *[]s.CompositeSignature `json:"compositeSignatures"`
	Computed_status      *string                 `json:"computedStatus,omitempty"`
	Snapshot_status      *string                 `json:"snapshotStatus,omitempty"`
	Voucher              *shared.Voucher         `json:"voucher,omitempty"`
	Achievements_done    bool                    `json:"achievementsDone"`
	TallyMethod          string                  `json:"tallyMethod"`
}

type UpdateProposalRequestPayload struct {
	Proposal *Proposal  `json:"payload"`
	Voucher  *s.Voucher `json:"voucher"`
	s.TimestampSignaturePayload
}

var computedStatusSQL = `
	CASE
		WHEN status = 'published' AND start_time > (now() at time zone 'utc') THEN 'pending'
		WHEN status = 'published' AND start_time < (now() at time zone 'utc') AND end_time > (now() at time zone 'utc') THEN 'active'
		WHEN status = 'published' AND end_time < (now() at time zone 'utc') THEN 'closed'
		WHEN status = 'cancelled' THEN 'cancelled'
		WHEN status = 'closed' THEN 'closed'
	END as computed_status
	`

func GetProposalsForCommunity(
	db *s.Database,
	communityId int,
	statuses []string,
	params shared.PageParams,
) (
	[]*Proposal,
	int,
	error,
) {
	var proposals []*Proposal
	var err error

	// Get Proposals
	sql := fmt.Sprintf(`SELECT *, %s FROM proposals WHERE community_id = $3`, computedStatusSQL)

	statusesFilterSql := generateStatusesFilterSQL(statuses)
	orderBySql := fmt.Sprintf(` ORDER BY created_at %s`, params.Order)
	limitOffsetSql := ` LIMIT $1 OFFSET $2`
	sql = sql + statusesFilterSql + orderBySql + limitOffsetSql

	err = pgxscan.Select(db.Context, db.Conn, &proposals, sql, params.Count, params.Start, communityId)

	// If we get pgx.ErrNoRows, just return an empty array
	// and obfuscate error
	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		return nil, 0, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return []*Proposal{}, 0, nil
	}

	// Get total number of proposals
	var totalRecords int
	countSql := `SELECT COUNT(*) FROM proposals WHERE community_id = $1` + statusesFilterSql
	_ = db.Conn.QueryRow(db.Context, countSql, communityId).Scan(&totalRecords)

	return proposals, totalRecords, nil
}

func (p *Proposal) GetProposalById(db *s.Database) error {
	sql := `
	SELECT p.*, %s, count(v.id) as total_votes from proposals as p
	left join votes as v on v.proposal_id = p.id
	WHERE p.id = $1
	GROUP BY p.id`
	sql = fmt.Sprintf(sql, computedStatusSQL)
	return pgxscan.Get(db.Context, db.Conn, p, sql, p.ID)
}

func (p *Proposal) CreateProposal(db *s.Database) error {
	// Assign IDs to choices
	for i := range p.Choices {
		choiceID := uint(i)
		p.Choices[i].ID = &choiceID
	}

	err := db.Conn.QueryRow(db.Context,
		`
	INSERT INTO proposals(community_id, 
	name, 
	choices, 
	strategy, 
	min_balance, 
	max_weight, 
	creator_addr, 
	start_time, 
	end_time, 
	status, 
	body, 
	block_height, 
	cid, 
	composite_signatures,
	voucher
	)
	VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	RETURNING id, created_at
	`,
		p.Community_id,
		p.Name,
		p.Choices,
		p.Strategy,
		p.Min_balance,
		p.Max_weight,
		p.Creator_addr,
		p.Start_time,
		p.End_time,
		p.Status,
		p.Body,
		p.Block_height,
		p.Cid,
		p.Composite_signatures,
		p.Voucher,
	).Scan(&p.ID, &p.Created_at)

	return err
}

func (p *Proposal) DeleteProposal(db *s.Database) error {
	_, err := db.Conn.Exec(db.Context, `
	DELETE FROM proposals
	WHERE id = $1
	`, p.ID)
	return err
}

func (p *Proposal) UpdateProposal(db *s.Database) error {
	_, err := db.Conn.Exec(db.Context, `
		UPDATE proposals
		SET status = $1
		WHERE id = $2
	`, p.Status, p.ID)

	if err != nil {
		return err
	}

	if *p.Status == "cancelled" {
		err := handleCancelledProposal(db, p.ID)
		if err != nil {
			return err
		}
	}

	err = p.GetProposalById(db)
	return err
}

func (p *Proposal) UpdateDraftProposal(db *s.Database) error {
	_, err := db.Conn.Exec(db.Context, `
		UPDATE proposals
		SET name = COALESCE($1, name), 
		choices = COALESCE($2, choices),
		strategy = COALESCE($3, strategy),
		min_balance = COALESCE($4, min_balance),
		max_weight = COALESCE($5, max_weight),
		start_time = COALESCE($6, start_time),
		end_time = COALESCE($7, end_time),
		body = COALESCE($8, body),
		block_height = COALESCE($9, block_height),
		cid = COALESCE($10, cid),
		WHERE id = $11
	`, p.Name,
		p.Choices,
		p.Strategy,
		p.Min_balance,
		p.Max_weight,
		p.Start_time,
		p.End_time,
		p.Body,
		p.Block_height,
		p.Cid,
		p.ID,
	)

	if err != nil {
		return err
	}

	return err
}

func (p *Proposal) UpdateSnapshotStatus(db *s.Database) error {
	_, err := db.Conn.Exec(db.Context,
		`
	UPDATE proposals
	SET snapshot_status = $1
	WHERE id = $2
	`, p.Snapshot_status, p.ID)

	if err != nil {
		return err
	}

	err = p.GetProposalById(db)
	return err
}

func (p *Proposal) IsLive() bool {
	now := time.Now().UTC()
	return now.After(p.Start_time) && now.Before(p.End_time)
}

// Validations

// Returns an error if the account's balance is insufficient to cast
// a vote on the proposal.
func (p *Proposal) ValidateBalance(weight float64) error {
	if p.Min_balance == nil {
		return nil
	}

	var Min_balance = *p.Min_balance
	var ERROR error = fmt.Errorf("insufficient balance for strategy: %s\nmin threshold: %f, vote weight: %f", *p.Strategy, *p.Min_balance, weight)

	// TODO: Feature flag
	// Dont validate in DEV or TEST envs!
	if os.Getenv("APP_ENV") == "TEST" || os.Getenv("APP_ENV") == "DEV" {
		return nil
	}

	if weight == 0.00 {
		return ERROR
	}

	if Min_balance != 0.00 && Min_balance > 0.00 && weight < Min_balance {
		return ERROR
	}
	return nil
}

func (p *Proposal) EnforceMaxWeight(balance float64) float64 {
	if p.Max_weight == nil {
		return balance
	}

	var allowedBalance float64
	var maxWeight = *p.Max_weight

	//inversions is used to correctly shift Max_weight x amount of
	//decimal places, depending on how many decimal places it originally is
	var inversions = map[int]int{
		1: 8,
		2: 7,
		3: 6,
		4: 5,
		5: 4,
		6: 3,
		7: 2,
		8: 1,
	}

	//we shift the maxWeight up by x decimal places so that the
	//comparison block works as expected
	//first, get the number of decimal places left side of . for maxWeight
	maxLimitLength := len(strings.Split(fmt.Sprintf("%v", maxWeight), ".")[0])

	minuend := inversions[maxLimitLength]
	powerToShift := minuend - maxLimitLength
	shiftedMaxWeight := maxWeight * math.Pow(10, float64(powerToShift))

	if balance >= shiftedMaxWeight {
		allowedBalance = shiftedMaxWeight
	} else {
		allowedBalance = balance
	}

	return allowedBalance
}

func GetActiveStrategiesForCommunity(db *s.Database, communityId int) ([]string, error) {
	var strategies []string
	var err error

	// Get Strategies from active proposals
	sql := `
		SELECT strategy FROM proposals 
		WHERE community_id = $1
		AND (
			(status = 'published' AND start_time > (now() at time zone 'utc')) OR 
			(status = 'published' AND start_time < (now() at time zone 'utc') AND end_time > (now() at time zone 'utc')) OR 
			(status = 'published' AND end_time > (now() at time zone 'utc'))
		)
		GROUP BY strategy
		`

	err = pgxscan.Select(db.Context, db.Conn, &strategies, sql, communityId)

	// If we get pgx.ErrNoRows, just return an empty array
	// and obfuscate error
	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		return nil, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return nil, nil
	}

	return strategies, nil
}

func handleCancelledProposal(db *s.Database, proposalId int) error {

	// Delete All votes for cancelled proposal
	_, err := db.Conn.Exec(db.Context, `
		UPDATE votes SET is_cancelled = 'true' WHERE proposal_id = $1
	`, proposalId)

	if err != nil {
		return err
	}

	return nil
}

func generateStatusesFilterSQL(statuses []string) string {
	statusesFilter := ""
	statusFilterStrings := []string{}

	// Generate SQL based on computed status
	if len(statuses) > 0 {
		for _, status := range statuses {
			// status: { pending | active | closed | cancelled }
			var statusFilter = ""
			switch status {
			case "pending":
				statusFilter = ` (status = 'published' AND start_time > (now() at time zone 'utc'))`
			case "active":
				statusFilter = ` (status = 'published' AND start_time < (now() at time zone 'utc') AND end_time > (now() at time zone 'utc'))`
			case "closed":
				statusFilter = ` (status = 'published' AND end_time < (now() at time zone 'utc'))`
			case "cancelled":
				statusFilter = ` (status = 'cancelled')`
			case "terminated":
				statusFilter = ` (status = 'cancelled' OR (status = 'published' AND end_time < (now() at time zone 'utc')))`
			case "inprogress":
				statusFilter = ` (status = 'published' AND end_time > (now() at time zone 'utc'))`
			}
			if len(statusFilter) > 0 {
				statusFilterStrings = append(statusFilterStrings, statusFilter)
			}
		}
		if len(statusFilterStrings) > 0 {
			statusesFilter = fmt.Sprintf(" AND (%s)", strings.Join(statusFilterStrings, " OR "))
		}
	}
	return statusesFilter
}
