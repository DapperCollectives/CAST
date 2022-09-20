package models

import (
	"encoding/hex"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/DapperCollectives/CAST/backend/main/shared"
	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
)

type Vote struct {
	ID                   int                     `json:"id,omitempty"`
	Proposal_id          int                     `json:"proposalId"`
	Addr                 string                  `json:"addr"                validate:"required"`
	Choice               string                  `json:"choice"              validate:"required"`
	Composite_signatures *[]s.CompositeSignature `json:"compositeSignatures" validate:"required"`
	Created_at           time.Time               `json:"createdAt,omitempty"`
	Cid                  *string                 `json:"cid"`
	Message              string                  `json:"message"`
	Voucher              *shared.Voucher         `json:"voucher,omitempty"`
	IsCancelled          bool                    `json:"isCancelled"`
	IsEarly              bool                    `json:"isEarly"`
	IsWinning            bool                    `json:"isWinning"`
}

type VoteWithBalance struct {
	// Extend Vote
	Vote
	// Balance
	BlockHeight             *uint64  `json:"blockHeight" pg:"block_height"`
	Balance                 *uint64  `json:"balance"`
	PrimaryAccountBalance   *uint64  `json:"primaryAccountBalance"`
	SecondaryAccountBalance *uint64  `json:"secondaryAccountBalance"`
	StakingBalance          *uint64  `json:"stakingBalance"`
	Weight                  *float64 `json:"weight"`

	NFTs []*NFT
}

type NFT struct {
	ID             interface{} `json:"id"`
	Contract_addr  string      `json:"contract_addr"`
	Created_at     time.Time   `json:"created_at"`
	Float_event_id uint64      `json:"event_id,omitempty"`
}

type VotingStreak struct {
	Proposal_id  uint64
	Addr         string
	Is_cancelled bool
}

const (
	timestampExpiry     = 60
	defaultStreakLength = 3
)

const (
	EarlyVote   string = "earlyVote"
	Streak             = "streak"
	WinningVote        = "winningVote"
)

///////////
// Votes //
///////////

func GetVotesForAddress(
	db *s.Database,
	address string,
	proposalIds *[]int,
	pageParams shared.PageParams,
) ([]*VoteWithBalance, int, error) {
	var votes []*VoteWithBalance
	var err error

	sql := `select v.*, 
		b.primary_account_balance,
		b.secondary_account_balance,
		b.staking_balance
		from votes v
		left join balances b on b.addr = v.addr
		WHERE v.addr = $3`

	// Conditionally add proposal_id condition
	if len(*proposalIds) > 0 {
		sql = sql + " AND proposal_id = ANY($4)"
		sql = sql + "LIMIT $1 OFFSET $2 "
		err = pgxscan.Select(db.Context, db.Conn, &votes,
			sql, pageParams.Count, pageParams.Start, address, *proposalIds)
	} else {
		sql = sql + "LIMIT $1 OFFSET $2 "
		err = pgxscan.Select(db.Context, db.Conn, &votes,
			sql, pageParams.Count, pageParams.Start, address)
	}

	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		return nil, 0, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return []*VoteWithBalance{}, 0, nil
	}

	// Get total number of votes on proposal
	var totalRecords int
	countSql := `
		SELECT COUNT(*) FROM votes WHERE addr = $1 and proposal_id = ANY($2)
	`
	_ = db.Conn.QueryRow(db.Context, countSql, address, *proposalIds).Scan(&totalRecords)
	return votes, totalRecords, nil
}

func GetAllVotesForProposal(db *s.Database, proposalId int, strategy string) ([]*VoteWithBalance, error) {
	var votes []*VoteWithBalance

	//return all balances, strategy will do rest of the work
	sql := `select v.*, 
		b.primary_account_balance,
		b.secondary_account_balance,
		b.staking_balance,
		COALESCE(p.block_height, 0) as block_height
    from votes v
    join proposals p on p.id = $1
  	left join balances b on b.addr = v.addr 
		and p.block_height = b.block_height
    where proposal_id = $1
`
	err := pgxscan.Select(db.Context, db.Conn, &votes, sql, proposalId)
	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		return nil, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return []*VoteWithBalance{}, nil
	}

	if IsNFTStrategy(strategy) {
		votesWithNFTs, err := getUsersNFTs(db, votes)
		if err != nil {
			return nil, err
		}
		return votesWithNFTs, nil
	}

	return votes, nil
}

func GetVotesForProposal(
	db *s.Database,
	proposalId int,
	strategy string,
	pageParams shared.PageParams,
) ([]*VoteWithBalance, int, error) {
	var votes []*VoteWithBalance
	var orderBySql string

	if pageParams.Order == "desc" {
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
    join proposals p on p.id = v.proposal_id
  	left join balances b on b.addr = v.addr 
		and p.block_height = b.block_height
    where v.proposal_id = $3`

	sql = sql + " " + orderBySql
	sql = sql + " LIMIT $1 OFFSET $2"

	err := pgxscan.Select(
		db.Context,
		db.Conn,
		&votes,
		sql,
		pageParams.Count,
		pageParams.Start,
		proposalId,
	)

	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		log.Error().Err(err).Msg("Error querying votes for proposal")
		return nil, 0, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return []*VoteWithBalance{}, 0, nil
	}

	if IsNFTStrategy(strategy) {
		votes, err = getUsersNFTs(db, votes)
		if err != nil {
			log.Error().Err(err).Msg("Error getting user NFTs")
			return nil, 0, err
		}
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

func (vb *VoteWithBalance) GetVote(db *s.Database) error {
	err := pgxscan.Get(db.Context, db.Conn, vb,
		`select v.*, 
		b.primary_account_balance,
		b.secondary_account_balance,
		b.staking_balance
		from votes v
		left join balances b on b.addr = v.addr
		WHERE proposal_id = $1 AND v.addr = $2`,
		vb.Proposal_id, vb.Addr)

	if err != nil {
		return err
	}

	nftIds, err := GetUserNFTs(db, vb)
	vb.NFTs = nftIds
	return err
}

func (v *Vote) GetVoteById(db *s.Database) error {
	return pgxscan.Get(db.Context, db.Conn, v,
		`SELECT * from votes
		WHERE id = $1`,
		v.ID)
}

func (v *Vote) CreateVote(db *s.Database) error {
	var defaultEarlyVoteLength = 2 // in hours

	err := createVote(db, v)
	if err != nil {
		return err
	}

	proposal, err := getProposal(db, v.Proposal_id)
	if err != nil {
		return err
	}

	isEarlyVote := v.Created_at.Before(proposal.Start_time.Add(time.Hour * time.Duration(defaultEarlyVoteLength)))

	if isEarlyVote {
		err = AddEarlyVoteAchievement(db, v)
		if err != nil {
			return err
		}
	}

	return nil
}

func ValidateVoteMessage(message string, proposal Proposal) error {
	log.Info().Msgf("validating message: %s", message)
	vars := strings.Split(message, ":")

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

func getUsersNFTs(db *s.Database, votes []*VoteWithBalance) ([]*VoteWithBalance, error) {
	for _, vote := range votes {
		nftIds, err := GetUserNFTs(db, vote)
		if err != nil {
			return nil, err
		}
		vote.NFTs = nftIds
	}

	return votes, nil
}

func GetUserNFTs(db *s.Database, vote *VoteWithBalance) ([]*NFT, error) {
	var ids []*NFT
	sql := `select id from nfts
	where proposal_id = $1 and owner_addr = $2
	`

	err := pgxscan.Select(db.Context, db.Conn, &ids, sql, vote.Proposal_id, vote.Addr)
	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		return nil, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return []*NFT{}, nil
	}

	return ids, nil
}

func CreateUserNFTRecord(db *s.Database, v *VoteWithBalance) error {
	for _, nft := range v.NFTs {
		_, err := db.Conn.Exec(db.Context,
			`
		INSERT INTO nfts(uuid, proposal_id, owner_addr, id)
		VALUES($1, $2, $3, $4)
	`, uuid.New(), v.Proposal_id, v.Addr, nft.ID)
		if err != nil {
			return err
		}
	}

	return nil
}

func DoesNFTExist(db *s.Database, v *VoteWithBalance) (bool, error) {
	for _, nft := range v.NFTs {
		var nftId int
		sql := `select id from nfts
		where proposal_id = $1 and id = $2
		`
		err := pgxscan.Get(db.Context, db.Conn, &nftId, sql, v.Proposal_id, nft.ID)
		if err != nil && err.Error() != pgx.ErrNoRows.Error() {
			return false, err
		} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
			return false, nil
		}
	}

	return true, nil
}

func createVote(db *s.Database, v *Vote) error {
	// Create Vote
	err := db.Conn.QueryRow(db.Context,
		`
			INSERT INTO votes(proposal_id, addr, choice, composite_signatures, cid, message)
			VALUES($1, $2, $3, $4, $5, $6)
			RETURNING id, created_at
		`, v.Proposal_id, v.Addr, v.Choice, v.Composite_signatures, v.Cid, v.Message).Scan(&v.ID, &v.Created_at)

	return err
}

func getProposal(db *s.Database, proposalId int) (Proposal, error) {
	var proposal Proposal
	err := pgxscan.Get(db.Context, db.Conn, &proposal,
		`SELECT start_time, community_id from proposals
		WHERE id = $1`,
		proposalId)

	return proposal, err
}

func AddEarlyVoteAchievement(db *s.Database, v *Vote) error {
	_, err := db.Conn.Exec(db.Context, `UPDATE votes SET is_early = 'true' WHERE id = $1`, v.ID)

	if err != nil {
		return err
	}

	return nil
}

func AddWinningVoteAchievement(db *s.Database, votes []*VoteWithBalance, p ProposalResults) error {
	maxVotes := 0
	winningChoice := ""
	for k, v := range p.Results {
		if v > maxVotes {
			maxVotes = v
			winningChoice = k
		}
	}
	for _, v := range votes {
		if v.Choice == winningChoice {
			_, err := db.Conn.Exec(db.Context, `UPDATE votes SET is_winning = 'true' WHERE id = $1`, v.ID)
			if err != nil {
				return err
			}
		}
	}

	_, err := db.Conn.Exec(db.Context, `UPDATE proposals SET achievements_done = 'true' WHERE id = $1`, p.Proposal_id)
	if err != nil {
		return err
	}

	return nil
}

func getStreakAchievement(db *s.Database, addr string, communityId int) (int, error) {
	streaks := 0
	votes, err := getUserVotes(db, addr, communityId)
	if err != nil {
		return 0, err
	}

	if len(votes) >= defaultStreakLength {
		var proposals []uint64
		for i, vote := range votes {
			// check if user voted on non-cancelled proposal
			if vote.Addr != "" && !vote.Is_cancelled {
				proposals = append(proposals, vote.Proposal_id)
				// check if vote is last in a streak
				if len(proposals) >= defaultStreakLength && (i == len(votes)-1 || (i < len(votes)-1 && votes[i+1].Addr == "")) {
					streaks = streaks + 1

					// reset proposals to check for other streaks
					proposals = nil
				}
			} else {
				// user did not vote on proposal, reset to look for new streak
				proposals = nil
			}
		}
	}

	return streaks, nil
}

func getUserVotes(db *s.Database, addr string, communityId int) ([]VotingStreak, error) {
	// Determine if this vote is part of a streak
	// Proposals with the user address count as a vote for that proposal
	// NULL means the user did not vote
	sql := fmt.Sprintf(`
		SELECT 
			p.id as proposal_id, 
			COALESCE(v.is_cancelled, 'false') as is_cancelled,
			COALESCE(v.addr, '') as addr
		FROM proposals p 
		LEFT OUTER JOIN (
			SELECT * FROM votes where addr = '%s'
		) v ON v.proposal_id = p.id 
		where p.community_id = $1
		ORDER BY start_time ASC
	`, addr)
	var votingStreak []VotingStreak
	err := pgxscan.Select(db.Context, db.Conn, &votingStreak, sql, communityId)
	return votingStreak, err
}
