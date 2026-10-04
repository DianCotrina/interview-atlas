package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/DianCotrina/interview-atlas/api/internal/postgres"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		log.Fatal("DATABASE_URL is required")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		log.Fatal("Invalid database configuration")
	}
	defer pool.Close()
	if err := postgres.ApplySchema(ctx, pool); err != nil {
		log.Fatal("Could not apply initial schema; check database availability")
	}
	log.Print("Initial review-attempt schema applied")
}
