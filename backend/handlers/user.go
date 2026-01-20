package handlers

import (
	"draw-tiles-backend/dto"
	"draw-tiles-backend/ent"
	"draw-tiles-backend/security"
	"draw-tiles-backend/utils"
	"fmt"

	"github.com/bwmarrin/snowflake"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type UserHandler struct {
	Database  *ent.Client
	Snowflake *snowflake.Node
	Validator *validator.Validate
}

type UserRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Username string `json:"username" validate:"required,min=3,max=32"`
	Password string `json:"password" validate:"required,min=8"`
}

func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
	body := new(UserRequest)

	if err := c.BodyParser(body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid JSON format")
	}

	if err := h.Validator.Struct(body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, utils.FormatFirstError(err))
	}

	id := h.Snowflake.Generate().Int64()

	hash, err := security.HashPassword(body.Password)
	if err != nil {
		fmt.Println("Failed to hash password", err)
		return fiber.NewError(fiber.StatusInternalServerError, "Could not process password")
	}

	u, err := h.Database.User.
		Create().
		SetID(id).
		SetEmail(body.Email).
		SetUsername(body.Username).
		SetPassword(hash).
		Save(c.Context())

	if err != nil {
		if ent.IsConstraintError(err) {
			return fiber.NewError(fiber.StatusConflict, "Username or Email already exists")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Database error")
	}

	response := dto.FilterUserResponse(u)

	return utils.SendSuccess(c, response, fiber.StatusCreated)
}
