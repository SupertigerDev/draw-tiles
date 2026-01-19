package main

import (
	"fmt"
	"log"

	"draw-tiles-backend/database"
	"draw-tiles-backend/handlers"

	"github.com/bwmarrin/snowflake"
	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	node, err := snowflake.NewNode(1)
	if err != nil {
		fmt.Println(err)
		return
	}

	dbClient := database.NewClient()
	defer dbClient.Close()

	userHandler := &handlers.UserHandler{DB: dbClient, SF: node}

	api := app.Group("/api")

	api.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("DrawTiles API Online.")
	})

	api.Post("/users", userHandler.CreateUser)

	if err := app.Listen("127.0.0.1:8080"); err != nil {
		log.Fatal("error starting http server: ", err)
	}
}
