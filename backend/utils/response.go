package utils

import "github.com/gofiber/fiber/v2"

type APIError struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type APISuccess[T any] struct {
	Success bool `json:"success"`
	Data    T    `json:"data"`
}

func SendSuccess(c *fiber.Ctx, data any, status ...int) error {
	code := 200
	if len(status) > 0 {
		code = status[0]
	}

	return c.Status(code).JSON(APISuccess[any]{
		Success: true,
		Data:    data,
	})
}
