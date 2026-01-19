package database

import (
	"context"
	"log"

	"draw-tiles-backend/ent"

	_ "github.com/lib/pq"
)

func NewClient() *ent.Client {
	client, err := ent.Open("postgres", "host=localhost port=5432 user=postgres dbname=draw-tiles password=123 sslmode=disable")
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}

	if err := client.Schema.Create(context.Background()); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}

	return client
}
