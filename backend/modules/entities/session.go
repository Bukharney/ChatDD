package entities

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type SessionRepository interface {
	CreateSession(ctx context.Context, session *Session) error
	GetSession(ctx context.Context, token_id string) (*Session, error)
	DeleteSession(ctx context.Context, token_id string) error
	DeleteSessions(ctx context.Context, user_id uuid.UUID) error
}

type SessionUsecase interface {
}

type Session struct {
	UserId    uuid.UUID `json:"user_id" db:"user_id"`
	TokenId   string    `json:"token_id" db:"token_id"`
	ExpiresAt time.Time `json:"expires_at" db:"expires_at"`
}
