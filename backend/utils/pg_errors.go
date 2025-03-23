package utils

import (
	"errors"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// HandlePostgreSQLError processes common PostgreSQL errors and returns user-friendly messages.
func HandlePostgreSQLError(err error) error {
	if err == nil {
		return nil
	}

	// Handle PostgreSQL-specific errors
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case "23505": // Unique violation
			return fmt.Errorf("username or email already exists")
		case "23503": // Foreign key violation
			return fmt.Errorf("invalid reference, user cannot be created")
		case "42P01": // Table does not exist
			return fmt.Errorf("table does not exist")
		case "42P05": // Duplicate table
			return fmt.Errorf("table already exists")
		default:
			log.Printf("Database error: %v", pgErr)
			return errors.New("internal server error")
		}
	}

	// Handle "no rows found" errors
	if errors.Is(err, pgx.ErrNoRows) {
		return fmt.Errorf("record not found")
	}

	// Unexpected errors
	log.Printf("Unexpected error: %v", err)
	return errors.New("unexpected database error")
}
