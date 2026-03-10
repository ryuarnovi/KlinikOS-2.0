package main

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/ryuarno/klinikos/internal/db"

	_ "github.com/joho/godotenv/autoload"
)

func Migrate(dsn string) {
	database := db.Connect(dsn)
	defer database.Close()

	if err := RunMigrations(database, "./migrations"); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	log.Println("Database migration completed successfully.")
}

func Drop(dsn string, table string) {
	database := db.Connect(dsn)
	defer database.Close()

	query := "DROP TABLE IF EXISTS " + table + " CASCADE;"
	if _, err := database.Exec(query); err != nil {
		log.Fatalf("Drop failed: %v", err)
	}
	log.Printf("Table %s dropped successfully.", table)
}

func Seed(dsn string) {
	database := db.Connect(dsn)
	defer database.Close()

	sqlBytes, err := os.ReadFile("./internal/migrations/seed.sql")
	if err != nil {
		log.Fatalf("Failed to read seed.sql: %v", err)
	}
	if _, err := database.Exec(string(sqlBytes)); err != nil {
		log.Fatalf("Seeding failed: %v", err)
	}
	log.Println("Database seeding completed successfully.")
}

func RunMigrations(db *sql.DB, migrationsDir string) error {
	files, err := os.ReadDir(migrationsDir)
	if err != nil {
		return err
	}
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".sql") {
			sqlBytes, err := os.ReadFile(filepath.Join(migrationsDir, file.Name()))
			if err != nil {
				return err
			}
			sqlStmt := string(sqlBytes)
			if _, err := db.Exec(sqlStmt); err != nil {
				return err
			}
			log.Printf("Migrated: %s", file.Name())
		}
	}
	return nil
}

func main() {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		log.Fatal("DB_DSN environment variable is not set")
	}

	if len(os.Args) < 2 {
		log.Fatal("Please provide a command: up, down, or seed")
	}

	switch os.Args[1] {
	case "up":
		Migrate(dsn)
	case "down":
		if len(os.Args) < 3 {
			log.Fatal("Please provide table name to drop, e.g. down users")
		}
		Drop(dsn, os.Args[2])
	case "seed":
		Seed(dsn)
	default:
		log.Fatalf("Unknown command: %s (use up, down, or seed)", os.Args[1])
	}
}

// Usage:
//   go run cmd/migrate/main.go up
//   go run cmd/migrate/main.go down
//   go run cmd/migrate/main.go seed
