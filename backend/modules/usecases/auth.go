package usecases

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/bukharney/ChatDD/configs"
	"github.com/bukharney/ChatDD/modules/entities"
	"github.com/bukharney/ChatDD/utils/argon"
)

type AuthUsecases struct {
	AuthRepo    entities.AuthRepository
	UserRepo    entities.UsersRepository
	SessionRepo entities.SessionRepository
	argon       *argon.Argon
}

func NewAuthUsecases(
	authRepo entities.AuthRepository,
	userRepo entities.UsersRepository,
	sessionRepo entities.SessionRepository,
	argon *argon.Argon,
) entities.AuthUsecase {
	return &AuthUsecases{
		AuthRepo:    authRepo,
		UserRepo:    userRepo,
		SessionRepo: sessionRepo,
		argon:       argon,
	}
}

func (a *AuthUsecases) Login(cfg *configs.Configs, ctx context.Context, req *entities.UsersCredentials) (*entities.UsersLoginRes, error) {
	user, err := a.UserRepo.GetUserByEmail(req.Username)
	if err != nil {
		return nil, errors.New("error, user not found")
	}

	if ok, err := a.argon.ComparePasswordAndHash(req.Password, user.Password); err != nil {
		return nil, errors.New("error, failed to compare password and hash")
	} else if !ok {
		return nil, errors.New("error, password is invalid")
	}

	err = a.SessionRepo.DeleteSessions(ctx, user.Id)
	if err != nil {
		return nil, errors.New("error, failed to delete sessions")
	}

	accessToken, err := a.AuthRepo.GenerateAccessToken(user)
	if err != nil {
		return nil, fmt.Errorf("error, failed to generate access token: %v", err)
	}

	refreshToken, err := a.AuthRepo.GenerateRefreshToken(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("error, failed to generate refresh token: %v", err)
	}

	res := &entities.UsersLoginRes{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	return res, nil
}

func (a *AuthUsecases) RefreshToken(ctx context.Context, claims entities.UsersClaims) (*string, error) {
	log.Println(claims.ID)
	session, err := a.SessionRepo.GetSession(ctx, claims.ID)
	if err != nil {
		return nil, errors.New("error, session not found")
	}

	if session.TokenId != claims.ID {
		return nil, errors.New("error, invalid refresh token")
	}

	if session.ExpiresAt.Before(time.Now()) {
		return nil, errors.New("error, refresh token expired")
	}

	user, err := a.UserRepo.GetUserByEmail(claims.Username)
	if err != nil {
		return nil, errors.New("error, user not found")
	}

	err = a.SessionRepo.DeleteSession(ctx, claims.ID)
	if err != nil {
		return nil, errors.New("error, failed to delete session")
	}

	refreshToken, err := a.AuthRepo.GenerateRefreshToken(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("error, failed to generate refresh token: %v", err)
	}

	return &refreshToken, nil
}
