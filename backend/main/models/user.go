package models

import (
	"github.com/DapperCollectives/CAST/backend/main/shared"
	"github.com/google/uuid"
)

type User struct {
	Uuid                 *string                      `json:"uuid,omitempty"`
	Addr                 *string                      `json:"address,validate:required"`
	Composite_signatures *[]shared.CompositeSignature `json:"compositeSignatures,validate:required"`
	Timestamp            *string                      `json:"timestamp,validate:required"`
	Profile_image        *string                      `json:"profileImage,omitempty"`
	Name                 *string                      `json:"name,omitempty"`
	Website              *string                      `json:"website,omitempty"`
	Bio                  *string                      `json:"bio,omitempty"`
	Twitter              *string                      `json:"twitter,omitempty"`
	Discord              *string                      `json:"discord,omitempty"`
	Instagram            *string                      `json:"instagram,omitempty"`
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

func (u *User) GetUser(db *shared.Database, addr string) error {
	err := db.Conn.QueryRow(
		db.Context,
		"SELECT * FROM users WHERE addr = $1",
		addr).Scan(
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

func (u *User) UpdateUser(db *shared.Database, payload *User) error {
	err := db.Conn.QueryRow(
		db.Context,
		`UPDATE users 
		SET profile_image = COALESCE($1,profile_image),
		name = COALESCE($2, name), 
		website = COALESCE($3, website), 
		bio = COALESCE($4, bio), 
		twitter = COALESCE($5, twitter), 
		discord = COALESCE($6, discord), 
		instagram = COALESCE($7, instagram)
		WHERE addr = $8		
		RETURNING *`,
		payload.Profile_image,
		payload.Name,
		payload.Website,
		payload.Bio,
		payload.Twitter,
		payload.Discord,
		payload.Instagram,
		payload.Addr,
	).Scan(
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
