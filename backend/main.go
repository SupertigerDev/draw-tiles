package main

import (
	"errors"
	"fmt"
	"log"
	"reflect"
	"strings"

	"draw-tiles-backend/database"
	"draw-tiles-backend/handlers"
	"draw-tiles-backend/services"
	"draw-tiles-backend/utils"

	"github.com/bwmarrin/snowflake"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			message := "Internal Server Error"

			var e *fiber.Error
			if errors.As(err, &e) {
				code = e.Code
				message = e.Message
			}

			return c.Status(code).JSON(utils.APIError{
				Success: false,
				Message: message,
			})
		},
	})
	node, err := snowflake.NewNode(1)
	if err != nil {
		fmt.Println(err)
		return
	}

	dbClient := database.NewClient()
	defer dbClient.Close()

	validate := validator.New()
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})

	userService := &services.UserService{
		Database:  dbClient,
		Snowflake: node,
	}

	userHandler := &handlers.UserHandler{Database: dbClient, Snowflake: node, Validator: validate, Service: userService}

	api := app.Group("/api")
	auth := api.Group("/auth")

	api.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("DrawTiles API Online.")
	})

	auth.Post("/register", userHandler.Register)
	auth.Post("/login", userHandler.Login)

	if err := app.Listen("127.0.0.1:8080"); err != nil {
		log.Fatal("error starting http server: ", err)
	}
}
