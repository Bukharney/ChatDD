package repositories

import (
	"context"
	"fmt"

	"github.com/bukharney/ChatDD/modules/entities"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SessionRepo struct {
	Db *pgxpool.Pool
}

func NewSessionRepo(db *pgxpool.Pool) entities.SessionRepository {
	return &SessionRepo{Db: db}
}

func (s *SessionRepo) CreateSession(ctx context.Context, session *entities.Session) error {
	_, err := s.Db.Exec(
		ctx,
		"INSERT INTO sessions (user_id, token_id, expires_at) VALUES ($1, $2, $3)",
		session.UserId, session.TokenId, session.ExpiresAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create session: %w", err)
	}

	return nil
}

func (s *SessionRepo) GetSession(ctx context.Context, token_id string) (*entities.Session, error) {
	var session entities.Session
	err := s.Db.QueryRow(
		ctx,
		"SELECT user_id, token_id, expires_at FROM sessions WHERE token_id = $1",
		token_id,
	).Scan(&session.UserId, &session.TokenId, &session.ExpiresAt)
	if err != nil {
		return nil, fmt.Errorf("failed to get session: %w", err)
	}

	return &session, nil
}

func (s *SessionRepo) DeleteSession(ctx context.Context, token_id string) error {
	_, err := s.Db.Exec(
		ctx,
		"DELETE FROM sessions WHERE token_id = $1",
		token_id,
	)
	if err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}

	return nil
}

func (s *SessionRepo) DeleteSessions(ctx context.Context, user_id uuid.UUID) error {
	_, err := s.Db.Exec(
		ctx,
		"DELETE FROM sessions WHERE user_id = $1",
		user_id,
	)
	if err != nil {
		return fmt.Errorf("failed to delete sessions: %w", err)
	}

	return nil
}
