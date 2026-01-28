package main

import (
	"errors"
	"fmt"
	"log"
	"reflect"
	"strings"

	"draw-tiles-backend/config"
	"draw-tiles-backend/database"
	"draw-tiles-backend/handlers"
	"draw-tiles-backend/security"
	"draw-tiles-backend/services"
	"draw-tiles-backend/utils"

	"github.com/bwmarrin/snowflake"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	cfg := config.LoadConfig()
	jwtService := security.NewJWTService(cfg.JWTSecret)
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

	dbClient := database.NewClient(cfg.DBURL)
	defer dbClient.Close()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.Origin,
		AllowCredentials: true,
	}))

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
		JWT:       jwtService,
	}

	tileService := services.NewTileService(dbClient)

	userHandler := &handlers.UserHandler{Database: dbClient, Snowflake: node, Validator: validate, Service: userService}
	tileHandler := &handlers.TileHandler{Database: dbClient, Snowflake: node, Validator: validate, UserService: userService, TileService: tileService}

	api := app.Group("/api")
	auth := api.Group("/auth")
	tiles := api.Group("/tiles")

	api.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("DrawTiles API Online.")
	})

	auth.Post("/register", userHandler.Register)
	auth.Post("/login", userHandler.Login)

	tiles.Post("/:coords", tileHandler.Update)

	tiles.Get("/:coords/png", tileHandler.GetPNG)

	if err := app.Listen("127.0.0.1:" + cfg.Port); err != nil {
		log.Fatal("error starting http server: ", err)
	}
}
