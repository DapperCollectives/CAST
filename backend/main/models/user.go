package models

import (
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/google/uuid"
)

type User struct {
	Uuid          *string `json:"uuid,omitempty"`
	Addr          *string `json:"address"`
	Profile_image *string `json:"profileImage,omitempty"`
	Name          *string `json:"name,omitempty"`
	Website       *string `json:"website,omitempty"`
	Bio           *string `json:"bio,omitempty"`
	Twitter       *string `json:"twitter,omitempty"`
	Discord       *string `json:"discord,omitempty"`
	Instagram     *string `json:"instagram,omitempty"`
}

func (u *User) CreateUser(db *shared.Database, payload *User) error {
	err := db.Conn.QueryRow(db.Context,
		`INSERT INTO users (uuid, addr, profile_image, name, website, bio, 
		twitter, discord, instagram)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	RETURNING *`,
		uuid.New(),
		payload.Addr,
		payload.Profile_image,
		payload.Name,
		payload.Website,
		payload.Bio,
		payload.Twitter,
		payload.Discord,
		payload.Instagram).
		Scan(
			&u.Uuid,
			&u.Addr,
			&u.Profile_image,
			&u.Name,
			&u.Website,
			&u.Bio,
			&u.Twitter,
			&u.Discord,
			&u.Instagram,
		)

	if err != nil {
		return err
	}
	return nil
}

func (u *User) GetUser(db *shared.Database, address string) error {
	err := pgxscan.Get(db.Context, db.Conn, u,
		"SELECT * FROM users WHERE address = $1",
		address)
	if err != nil {
		return err
	}
	return nil
}
