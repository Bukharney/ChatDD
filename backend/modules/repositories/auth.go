package repositories

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/bukharney/ChatDD/modules/entities"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
)

type AuthRepo struct {
	SessionRepo entities.SessionRepository
}

func NewAuthRepo(
	SessionRepo entities.SessionRepository,
) entities.AuthRepository {
	return &AuthRepo{
		SessionRepo: SessionRepo,
	}
}

func (a *AuthRepo) GenerateAccessToken(req *entities.UsersPassport) (string, error) {
	// Generate an access token (short-lived)
	secretKey := os.Getenv("JWT_SECRET")
	if len(secretKey) < 64 {
		return "", errors.New("error, invalid jwt secret key")
	}
	claims := &entities.UsersClaims{
		Id:       req.Id,
		Username: req.Username,
		Email:    req.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(5 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   "access_token",
			Issuer:    "chatdd_auth",
			Audience:  []string{"chatdd_app"},
			ID:        uuid.New().String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS512, claims)
	signedString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", fmt.Errorf("error, failed to sign token: %v", err)
	}

	return signedString, nil
}

func (a *AuthRepo) GenerateRefreshToken(ctx context.Context, req *entities.UsersPassport) (string, error) {
	// Generate a refresh token (longer-lived)
	secretKey := os.Getenv("JWT_SECRET")
	if len(secretKey) < 64 {
		return "", errors.New("error, invalid jwt secret key")
	}
	claims := &entities.UsersClaims{
		Id:       req.Id,
		Username: req.Username,
		Email:    req.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   "refresh_token",
			Issuer:    "chatdd_auth",
			Audience:  []string{"chatdd_app"},
			ID:        uuid.New().String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS512, claims)
	signedString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", fmt.Errorf("error, failed to sign token: %v", err)
	}

	err = a.SessionRepo.CreateSession(ctx, &entities.Session{
		UserId:    req.Id,
		TokenId:   claims.ID,
		ExpiresAt: claims.ExpiresAt.Time,
	})
	if err != nil {
		return "", fmt.Errorf("error, failed to create session: %v", err)
	}

	return signedString, nil
}
