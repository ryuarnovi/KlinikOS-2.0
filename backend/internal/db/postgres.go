package db

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

// Connect opens and pings a PostgreSQL database using the given DSN.
func Connect(dsn string) *sql.DB {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("DB open error: %v", err)
	}
	if err := db.Ping(); err != nil {
		log.Fatalf("DB ping error: %v", err)
	}
	log.Println("PostgreSQL connected.")
	return db
}

// Close closes the database connection.
func Close(db *sql.DB) {
	if err := db.Close(); err != nil {
		log.Printf("DB close error: %v", err)
	} else {
		log.Println("PostgreSQL disconnected.")
	}
}

// GetDBType returns the type of the database.
func GetDBType() string {
	return "postgres"
}

// GetPlaceholder returns the PostgreSQL placeholder for prepared statements (e.g., $1, $2, ...).
func GetPlaceholder(n int) string {
	return fmt.Sprintf("$%d", n)
}

// GetLastInsertIDQuery returns the RETURNING clause for PostgreSQL.
func GetLastInsertIDQuery(column string) string {
	return "RETURNING " + column
}

// SupportsLastInsertID returns false for PostgreSQL (uses RETURNING instead).
func SupportsLastInsertID() bool {
	return false
}

// MigrationsTableExists checks if the schema_migrations table exists.
func MigrationsTableExists(db *sql.DB) (bool, error) {
	var exists bool
	query := `
	SELECT EXISTS (
		SELECT 1
		FROM information_schema.tables 
		WHERE table_name = 'schema_migrations'
	);`
	err := db.QueryRow(query).Scan(&exists)
	return exists, err
}
