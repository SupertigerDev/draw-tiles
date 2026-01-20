package services

import (
	"context"
	"draw-tiles-backend/ent"
	"draw-tiles-backend/ent/user"
	"draw-tiles-backend/security"
	"draw-tiles-backend/utils"

	"github.com/bwmarrin/snowflake"
	"github.com/go-playground/validator/v10"
)

type UserService struct {
	Database  *ent.Client
	Snowflake *snowflake.Node
	Validator *validator.Validate
	JWT       *security.JWTService
}

func (h *UserService) Register(ctx context.Context, email, username, password string) (*ent.User, string, error) {

	id := h.Snowflake.Generate().Int64()

	hash, err := security.HashPassword(password)
	if err != nil {
		return nil, "", err
	}

	u, err := h.Database.User.
		Create().
		SetID(id).
		SetEmail(email).
		SetUsername(username).
		SetPassword(hash).
		Save(ctx)

	if err != nil {
		return nil, "", err
	}

	token, err := h.JWT.GenerateToken(u.ID)

	if err != nil {
		return nil, "", err
	}

	return u, token, nil
}

func (h *UserService) Login(ctx context.Context, email, password string) (*ent.User, string, error) {

	u, err := h.Database.User.
		Query().
		Where(user.Email(email)).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return nil, "", utils.ErrInvalidCredentials
		}
		return nil, "", err
	}

	if !security.CheckPasswordHash(password, u.Password) {
		return nil, "", utils.ErrInvalidCredentials
	}

	token, err := h.JWT.GenerateToken(u.ID)

	if err != nil {
		return nil, "", err
	}

	return u, token, nil
}
