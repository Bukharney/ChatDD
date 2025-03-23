package main

import (
	"context"
	"log"

	"github.com/bukharney/ChatDD/configs"
	"github.com/bukharney/ChatDD/server"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load(".env")
	cfg := configs.NewConfigs()
	config, err := pgxpool.ParseConfig(cfg.Supabase.URL)
	if err != nil {
		log.Fatalf("Unable to parse connection string: %v", err)
	}
	config.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeCacheDescribe

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}

	srv := server.NewServer(pool, cfg)
	err = srv.Run()
	if err != nil {
		log.Fatal(err)
	}
}
