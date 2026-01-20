package handlers

import (
	"draw-tiles-backend/dto"
	"draw-tiles-backend/ent"
	"draw-tiles-backend/services"
	"draw-tiles-backend/utils"
	"errors"

	"github.com/bwmarrin/snowflake"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type UserHandler struct {
	Database  *ent.Client
	Snowflake *snowflake.Node
	Validator *validator.Validate
	Service   *services.UserService
}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Username string `json:"username" validate:"required,min=3,max=32"`
	Password string `json:"password" validate:"required,min=8"`
}

func (h *UserHandler) Register(c *fiber.Ctx) error {
	body := new(RegisterRequest)

	if err := c.BodyParser(body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid JSON format")
	}

	if err := h.Validator.Struct(body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, utils.FormatFirstError(err))
	}

	u, token, err := h.Service.Register(c.Context(), body.Email, body.Username, body.Password)

	if err != nil {
		if ent.IsConstraintError(err) {
			return fiber.NewError(fiber.StatusConflict, "Username or Email already exists")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Database error")
	}

	response := dto.AuthResponse{
		User:  dto.FilterUserResponse(u),
		Token: token,
	}

	return utils.SendSuccess(c, response, fiber.StatusCreated)
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

func (h *UserHandler) Login(c *fiber.Ctx) error {
	body := new(LoginRequest)

	if err := c.BodyParser(body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid JSON format")
	}

	if err := h.Validator.Struct(body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, utils.FormatFirstError(err))
	}

	u, token, err := h.Service.Login(c.Context(), body.Email, body.Password)

	if err != nil {
		if errors.Is(err, utils.ErrInvalidCredentials) {
			return fiber.NewError(fiber.StatusUnauthorized, err.Error())
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to login. Try again later.")
	}

	response := dto.AuthResponse{
		User:  dto.FilterUserResponse(u),
		Token: token,
	}

	return utils.SendSuccess(c, response, fiber.StatusOK)

}
