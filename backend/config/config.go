package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	JWTSecret string
	Port      string
	DBURL     string
}

func LoadConfig() *Config {
	_ = godotenv.Load()

	return &Config{
		JWTSecret: getEnv("JWT_SECRET", "default_secret_fallback"),
		Port:      getEnv("PORT", "8080"),
		DBURL:     getEnv("DATABASE_URL", ""),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
