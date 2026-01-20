package database

import (
	"context"
	"log"

	"draw-tiles-backend/ent"

	_ "github.com/lib/pq"
)

func NewClient(databaseURL string) *ent.Client {
	client, err := ent.Open("postgres", databaseURL)
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}

	if err := client.Schema.Create(context.Background()); err != nil {
		log.Fatalf("failed creating schema resources: %v", err)
	}

	return client
}
