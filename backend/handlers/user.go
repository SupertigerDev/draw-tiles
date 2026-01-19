package handlers

import (
	"draw-tiles-backend/dto"
	"draw-tiles-backend/ent"
	"fmt"
	"reflect"
	"strings"

	"github.com/bwmarrin/snowflake"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type UserHandler struct {
	DB *ent.Client
	SF *snowflake.Node
}

type UserRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Username string `json:"username" validate:"required,min=3,max=32"`
	Password string `json:"password" validate:"required,min=8"`
}

func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
	body := new(UserRequest)

	if err := c.BodyParser(body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	validate := validator.New()
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})
	err := validate.Struct(body)
	if err := validate.Struct(body); err != nil {
		errors := make(map[string]string)

		for _, err := range err.(validator.ValidationErrors) {
			errors[err.Field()] = fmt.Sprintf("failed validation on %s", err.Tag())
		}

		return c.Status(400).JSON(fiber.Map{
			"errors": errors,
		})
	}

	id := h.SF.Generate().Int64()

	u, err := h.DB.User.
		Create().
		SetID(id).
		SetEmail(body.Email).
		SetUsername(body.Username).
		SetPassword(body.Password).
		Save(c.Context())

	if err != nil {
		fmt.Println("Failed to create user", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create user",
		})
	}

	response := dto.FilterUserResponse(u)

	return c.Status(201).JSON(response)
}
