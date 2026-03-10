package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port              string
	Dsn               string
	MidtransServerKey string
	MidtransClientKey string
	MidtransEnv       string
	JWTSecret         string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, use default env")
	}
	return &Config{
		Port:              getEnv("PORT", "8080"),
		Dsn:               getEnv("DB_DSN", "root:password@tcp(127.0.0.1:3306)/klinikos?parseTime=true"),
		MidtransServerKey: getEnv("MIDTRANS_SERVER_KEY", ""),
		MidtransClientKey: getEnv("MIDTRANS_CLIENT_KEY", ""),
		MidtransEnv:       getEnv("MIDTRANS_ENV", "sandbox"),
		JWTSecret:         getEnv("JWT_SECRET", "your-secret-key"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
