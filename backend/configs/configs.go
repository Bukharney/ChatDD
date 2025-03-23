package configs

import (
	"log"
	"os"
)

type Configs struct {
	App      Gin
	Argon    Argon
	Supabase Supabase
}

type Gin struct {
	Host string
	Port string
}

type Supabase struct {
	URL     string
	AnonKey string
}

type Argon struct {
	Memory      uint32
	Iterations  uint32
	Parallelism uint8
	SaltLength  uint32
	KeyLength   uint32
}

func NewConfigs() *Configs {
	return &Configs{
		Supabase: Supabase{
			URL: MustGetenv("DATABASE_URL"),
		},
		App: Gin{
			Host: "localhost",
			Port: "8080",
		},
		Argon: Argon{
			Memory:      64 * 1024,
			Iterations:  3,
			Parallelism: 2,
			SaltLength:  16,
			KeyLength:   32,
		},
	}
}

func MustGetenv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("missing env var %s", key)
	}
	return v
}
