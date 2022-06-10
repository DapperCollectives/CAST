package models

import (
	"sort"
	"time"

	s "github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/georgysavva/scany/pgxscan"
)

type List struct {
	ID           int        `json:"id"`
	Community_id int        `json:"communityId"`
	Addresses    []string   `json:"addresses,omitempty" validate:"required"`
	List_type    *string    `json:"listType,omitempty"`
	Cid          *string    `json:"cid,omitempty"`
	Created_at   *time.Time `json:"createdAt,omitempty"`
}

type ListPayload struct {
	List
	s.TimestampSignaturePayload
}

type ListUpdatePayload struct {
	ID        int      `json:"id"`
	Addresses []string `json:"addresses,omitempty" validate:"required"`
	s.TimestampSignaturePayload
}

func GetListsForCommunity(db *s.Database, communityId int) ([]List, error) {
	lists := []List{}
	err := pgxscan.Select(db.Context, db.Conn, &lists,
		`SELECT * FROM lists WHERE community_id = $1`,
		communityId)

	return lists, err
}

func GetListForCommunityByType(db *s.Database, communityId int, listType string) (List, error) {
	var list = List{}
	err := pgxscan.Get(db.Context, db.Conn, &list,
		`SELECT * FROM lists WHERE community_id = $1 AND list_type = $2`,
		communityId, listType)
	return list, err
}

func (l *List) GetListById(db *s.Database) error {
	return pgxscan.Get(db.Context, db.Conn, l, `
		SELECT * FROM lists WHERE id = $1
	`, l.ID)
}

func (l *List) CreateList(db *s.Database) error {
	err := db.Conn.QueryRow(db.Context,
		`
		INSERT INTO lists(community_id, addresses, list_type, cid)
		VALUES($1, $2, $3, $4)
		RETURNING id, created_at
	`, l.Community_id, l.Addresses, l.List_type, l.Cid).Scan(&l.ID, &l.Created_at)

	return err // will be nil unless something went wrong
}

func (l *List) UpdateList(db *s.Database) error {
	_, err := db.Conn.Exec(db.Context,
		`
		UPDATE lists
		SET addresses = $1
		WHERE id = $2
	`, l.Addresses, l.ID)

	return err // will be nil unless something went wrong
}

func (l *List) AddAddresses(addresses []string) {
	// Put addresses into map to speed up lookup time
	addrMap := map[string]bool{}
	for _, addr := range l.Addresses {
		addrMap[addr] = true
	}
	// only add addresses that havent been added
	for _, addr := range addresses {
		if !addrMap[addr] {
			l.Addresses = append(l.Addresses, addr)
		}
	}
}

func (l *List) RemoveAddresses(toRemove []string) {
	// remove specified addresses
	for _, addr := range toRemove {
		// Get the index of element to remove
		i := sort.StringSlice(l.Addresses).Search(addr)
		if i >= 0 {
			// Remove the element at index i from a.
			copy(l.Addresses[i:], l.Addresses[i+1:])       // Shift a[i+1:] left one index.
			l.Addresses[len(l.Addresses)-1] = ""           // Erase last element (write zero value).
			l.Addresses = l.Addresses[:len(l.Addresses)-1] // Truncate slice.
		}
	}
}
