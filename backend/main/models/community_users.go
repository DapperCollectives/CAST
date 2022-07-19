package models

import (
	"fmt"
	"sort"
	"strings"

	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
)

type CommunityUser struct {
	Community_id int    `json:"communityId" validate:"required"`
	Addr         string `json:"addr" validate:"required"`
	User_type    string `json:"userType" validate:"required"`
}

type CommunityUserType struct {
	Community_id int    `json:"communityId" validate:"required"`
	Addr         string `json:"addr" validate:"required"`
	Is_admin     bool   `json:"isAdmin" validate:"required"`
	Is_author    bool   `json:"isAuthor" validate:"required"`
	Is_member    bool   `json:"isMember" validate:"required"`
}

type UserTypes []string

var USER_TYPES = UserTypes{"member", "author", "admin"}

type UserCommunity struct {
	Community
	Roles string `json:"roles" validate:"required"`
}

type CommunityUserPayload struct {
	CommunityUser
	Signing_addr         string                  `json:"signingAddr" validate:"required"`
	Timestamp            string                  `json:"timestamp" validate:"required"`
	Composite_signatures *[]s.CompositeSignature `json:"compositeSignatures" validate:"required"`
}

type UserAchievements = []struct {
	Address     string
	NumVotes    int
	EarlyVote   int
	Streak      int
	WinningVote int
}

type LeaderboardUser struct {
	Addr  string `json:"addr" validate:"required"`
	Score int    `json:"score,omitempty"`
	Index int    `json:"index,omitempty"`
}

type LeaderboardPayload struct {
	Users       []LeaderboardUser `json:"users"`
	CurrentUser LeaderboardUser   `json:"currentUser"`
}

func GetUsersForCommunity(db *s.Database, communityId, start, count int) ([]CommunityUserType, int, error) {
	var users = []CommunityUserType{}
	err := pgxscan.Select(db.Context, db.Conn, &users,
		`
		SELECT
 				(CASE WHEN 
					(EXISTS (SELECT community_users.addr FROM community_users WHERE community_users.addr = temp_user_addrs.addr AND community_users.user_type = 'admin')) 
					THEN '1' else '0' end)::boolean AS is_admin,
 				(CASE WHEN 
					(EXISTS (SELECT community_users.addr FROM community_users WHERE community_users.addr = temp_user_addrs.addr AND community_users.user_type = 'author')) 
				THEN '1' else '0' end)::boolean AS is_author,
 				(CASE WHEN 
					(EXISTS (SELECT community_users.addr FROM community_users WHERE community_users.addr = temp_user_addrs.addr AND community_users.user_type = 'member')) 
				THEN '1' else '0' end)::boolean AS is_member,
				temp_user_addrs.addr AS addr,
				$1 as community_id
		FROM 
				(SELECT addr FROM community_users WHERE community_id = $1 group BY community_users.addr) 
		AS temp_user_addrs 
		LIMIT $2 OFFSET $3
		`, communityId, count, start)

	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		return nil, 0, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return []CommunityUserType{}, 0, nil
	}

	var totalUsers int
	countSql := `SELECT COUNT(*) FROM (SELECT addr FROM community_users WHERE community_id = $1 group BY community_users.addr) as temp_users_addr`
	_ = db.Conn.QueryRow(db.Context, countSql, communityId).Scan(&totalUsers)

	return users, totalUsers, nil
}

func GetUsersForCommunityByType(db *s.Database, communityId, start, count int, user_type string) ([]CommunityUser, int, error) {
	var users = []CommunityUser{}
	err := pgxscan.Select(db.Context, db.Conn, &users,
		`
		SELECT * FROM community_users WHERE community_id = $1 AND user_type = $2
		LIMIT $3 OFFSET $4
		`, communityId, user_type, count, start)

	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		return nil, 0, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return []CommunityUser{}, 0, nil
	}

	var totalUsers int
	countSql := `SELECT COUNT(*) FROM community_users WHERE community_id = $1 AND user_type = $2`
	_ = db.Conn.QueryRow(db.Context, countSql, communityId, user_type).Scan(&totalUsers)

	return users, totalUsers, nil
}

func GetCommunityLeaderboard(db *s.Database, communityId int, addr string, start, count int) (LeaderboardPayload, int, error) {
	var payload = LeaderboardPayload{}

	userAchievements, err := getUserAchievements(db, communityId)

	if err != nil {
		return payload, 0, err
	}

	if len(userAchievements) == 0 {
		return payload, 0, nil
	}

	leaderboardUsers, currentUser := getLeaderboardUsers(userAchievements, addr, start, count)

	totalUsers := getTotalUsersForCommunity(db, communityId)

	payload.Users = leaderboardUsers
	payload.CurrentUser = currentUser

	return payload, totalUsers, nil
}

func GetCommunitiesForUser(db *s.Database, addr string, start, count int) ([]UserCommunity, int, error) {
	var communities = []UserCommunity{}

	err := pgxscan.Select(db.Context, db.Conn, &communities,
		`
		SELECT
	  communities.*,
	  a.roles
		FROM communities
		LEFT JOIN community_users ON community_users.community_id = communities.id
		LEFT JOIN (
				SELECT DISTINCT ON (community_users.community_id) community_users.*,
						ARRAY(
								SELECT community_users.user_type
								FROM community_users
								WHERE addr = $1
								GROUP BY community_users.user_type
						) as roles
						FROM community_users
						WHERE addr = $1
		) a ON community_users.addr = a.addr
		WHERE community_users.addr = $1
		GROUP BY communities.id, a.roles
		LIMIT $2 OFFSET $3
		`, addr, count, start)

	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		return nil, 0, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return []UserCommunity{}, 0, nil
	}

	for i := range communities {
		communities[i].Roles = strings.Trim(communities[i].Roles, "{}")
	}

	var totalCommunities int
	countSql := `
	SELECT
		COUNT(DISTINCT communities.id)
	FROM communities
	LEFT JOIN community_users ON community_users.community_id = communities.id
	LEFT JOIN (
		SELECT DISTINCT ON (community_users.community_id) community_users.*,
				ARRAY(
						SELECT community_users.user_type
						FROM community_users
						WHERE addr = $1
						GROUP BY community_users.user_type
				) as roles
				FROM community_users
				WHERE addr = $1
	) a ON community_users.addr = a.addr
	WHERE community_users.addr = $1
	GROUP BY communities.id, a.roles
	`
	_ = db.Conn.QueryRow(db.Context, countSql, addr).Scan(&totalCommunities)

	return communities, totalCommunities, nil
}

func (u *CommunityUser) GetCommunityUser(db *s.Database) error {
	sql := `
	SELECT * from community_users as u
	WHERE u.community_id = $1 AND u.addr = $2 AND u.user_type = $3
	`
	return pgxscan.Get(db.Context, db.Conn, u, sql, u.Community_id, u.Addr, u.User_type)
}

func GetAllRolesForUserInCommunity(db *s.Database, addr string, communityId int) ([]CommunityUser, error) {
	var users = []CommunityUser{}
	err := pgxscan.Select(db.Context, db.Conn, &users,
		`
		SELECT * FROM community_users WHERE community_id = $1 AND addr = $2
		`, communityId, addr)

	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		return nil, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return []CommunityUser{}, nil
	}
	return users, err
}

func (u *CommunityUser) Remove(db *s.Database) error {
	_, err := db.Conn.Exec(db.Context,
		`
		DELETE FROM community_users
		WHERE community_id = $1 AND addr = $2 AND user_type = $3
	`, u.Community_id, u.Addr, u.User_type)

	return err
}

func GrantAdminRolesToAddress(db *s.Database, communityId int, addr string) error {
	userTypes := UserTypes{"admin", "author", "member"}
	for _, role := range userTypes {
		userRole := CommunityUser{Addr: addr, Community_id: communityId, User_type: role}
		if err := userRole.GetCommunityUser(db); err != nil {
			if err := userRole.CreateCommunityUser(db); err != nil {
				log.Error().Err(err).Msgf("db error creating role %s for addr %s for communityId %d", role, addr, communityId)
				return err
			}
		}
	}
	return nil
}

func GrantAuthorRolesToAddress(db *s.Database, communityId int, addr string) error {
	userTypes := UserTypes{"author", "member"}
	for _, role := range userTypes {
		userRole := CommunityUser{Addr: addr, Community_id: communityId, User_type: role}
		if err := userRole.GetCommunityUser(db); err != nil {
			if err := userRole.CreateCommunityUser(db); err != nil {
				log.Error().Err(err).Msgf("db error creating role %s for addr %s for communityId %d", role, addr, communityId)
				return err
			}
		}
	}
	return nil
}

func (u *CommunityUser) CreateCommunityUser(db *s.Database) error {
	err := db.Conn.QueryRow(db.Context,
		`
		INSERT INTO community_users(community_id, addr, user_type)
		VALUES($1, $2, $3)
		RETURNING community_id, addr, user_type
	`, u.Community_id, u.Addr, u.User_type).Scan(&u.Community_id, &u.Addr, &u.User_type)

	return err
}

func GrantRolesToCommunityCreator(db *s.Database, addr string, communityId int) error {
	for _, userType := range USER_TYPES {
		communityUser := CommunityUser{Addr: addr, Community_id: communityId, User_type: userType}
		if err := communityUser.CreateCommunityUser(db); err != nil {
			return err
		}
		log.Debug().Msgf("granted addr %s role %s for community %d", addr, userType, communityId)
	}
	return nil
}

func EnsureRoleForCommunity(db *s.Database, addr string, communityId int, userType string) error {
	user := CommunityUser{Addr: addr, Community_id: communityId, User_type: userType}
	return user.GetCommunityUser(db)
}

func EnsureValidRole(userType string) bool {
	for _, t := range USER_TYPES {
		if t == userType {
			return true
		}
	}
	return false
}

func getTotalUsersForCommunity(db *s.Database, communityId int) int {
	var totalUsers int
	countSql := `SELECT COUNT(*) FROM community_users WHERE community_id = $1`
	_ = db.Conn.QueryRow(db.Context, countSql, communityId).Scan(&totalUsers)
	return totalUsers
}

func getUserAchievements(db *s.Database, communityId int) (UserAchievements, error) {
	var userAchievements UserAchievements
	// Retrieve each user in the community with totals for
	// their votes and achievements (e.g. early votes, streaks and winning choices)
	// Note 1: crosstab is a postgres extension that creates a pivot table.
	// Achievements are joined as columns for each user.
	// Note 2: crosstab Subselects in community_id not replaced properly by $1, so has been
	// substituted in string first.
	sql := fmt.Sprintf(
		`
		SELECT v.addr as address, count(*) as num_votes,
		COALESCE(a.early_vote, 0) as early_vote,
		COALESCE(b.streak, 0) as streak,
		COALESCE(c.winning_vote, 0) as winning_vote
		FROM votes v
		LEFT OUTER JOIN proposals p ON p.id = v.proposal_id
		LEFT OUTER JOIN (
			SELECT * FROM crosstab(
				$$SELECT addr, achievement_type, count(*) FROM user_achievements
				WHERE community_id = %d and achievement_type = 'earlyVote'
				GROUP BY addr, achievement_type
				ORDER BY 1,2$$
			) AS ct(address varchar(18), early_vote bigint)
		) a ON v.addr = a.address
		LEFT OUTER JOIN (
			SELECT * FROM crosstab(
				$$SELECT addr, achievement_type, count(*) FROM user_achievements
				WHERE community_id = %d and achievement_type = 'streak'
				GROUP BY addr, achievement_type
				ORDER BY 1,2$$
			) AS ct(address varchar(18), streak bigint)
		) b ON v.addr = b.address
		LEFT OUTER JOIN (
			SELECT * FROM crosstab(
				$$SELECT addr, achievement_type, count(*) FROM user_achievements
				WHERE community_id = %d and achievement_type = 'winningVote'
				GROUP BY addr, achievement_type
				ORDER BY 1,2$$
			) AS ct(address varchar(18), winning_vote bigint)
		) c ON v.addr = c.address
			WHERE p.community_id = $1
			GROUP BY v.addr, a.early_vote, b.streak, c.winning_vote
		`, communityId, communityId, communityId)

	err := pgxscan.Select(db.Context, db.Conn, &userAchievements, sql, communityId)

	if err != nil && err.Error() != pgx.ErrNoRows.Error() {
		return nil, err
	} else if err != nil && err.Error() == pgx.ErrNoRows.Error() {
		return UserAchievements{}, nil
	}

	return userAchievements, nil
}

func getLeaderboardUsers(userAchievements UserAchievements, currentUserAddr string, start, count int) ([]LeaderboardUser, LeaderboardUser) {
	var leaderboardUsers = []LeaderboardUser{}
	var currentUser = LeaderboardUser{}
	var defaultEarlyVoteWeight = 1
	var defaultStreakWeight = 1
	var defaultWinningVoteWeight = 1

	for _, user := range userAchievements {
		score := user.NumVotes + (user.EarlyVote * defaultEarlyVoteWeight) + (user.Streak * defaultStreakWeight) + (user.WinningVote * defaultWinningVoteWeight)

		var leaderboardUser = LeaderboardUser{}
		leaderboardUser.Addr = user.Address
		leaderboardUser.Score = score
		leaderboardUsers = append(leaderboardUsers, leaderboardUser)
		if user.Address == currentUserAddr {
			currentUser = LeaderboardUser{}
			currentUser.Addr = user.Address
			currentUser.Score = score
		}
	}

	// Order by score descending
	sort.Slice(leaderboardUsers, func(i, j int) bool {
		return leaderboardUsers[i].Score > leaderboardUsers[j].Score
	})

	// Include indexes for ranking
	for i := range leaderboardUsers {
		leaderboardUsers[i].Index = i + 1
		if leaderboardUsers[i].Addr == currentUser.Addr {
			currentUser.Index = i + 1
		}
	}

	// Top users on leaderboard (e.g 10)
	if start == 0 && len(leaderboardUsers) >= count {
		leaderboardUsers = leaderboardUsers[0:count]
	} else {
		startIndex := start * count
		endIndex := start*count + count

		// If index invalid, set to last page
		if startIndex >= len(leaderboardUsers) {
			if len(leaderboardUsers)-count >= 0 {
				startIndex = len(leaderboardUsers) - count
			} else {
				startIndex = 0
			}
		}

		if endIndex <= len(leaderboardUsers) {
			leaderboardUsers = leaderboardUsers[startIndex:endIndex]
		} else {
			leaderboardUsers = leaderboardUsers[startIndex:]
		}
	}

	return leaderboardUsers, currentUser
}
