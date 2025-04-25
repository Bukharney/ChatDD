package usecases

import (
	"context"
	"errors"
	"fmt"
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

func (a *AuthUsecases) Login(cfg *configs.Configs, ctx context.Context, req *entities.UsersCredentials) (*entities.Token, error) {
	user, err := a.UserRepo.GetUserByEmail(ctx, req.Username)
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

	res := &entities.Token{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	return res, nil
}

func (a *AuthUsecases) RefreshToken(ctx context.Context, claims entities.UsersClaims) (*string, error) {
	session, err := a.SessionRepo.GetSession(ctx, claims.ID)
	if err != nil {
		return nil, errors.New("error, session not found")
	}

	if session.TokenId != claims.ID {
		return nil, errors.New("error, invalid refresh token")
	}

	if session.ExpiresAt.Before(time.Now()) {
		err = a.SessionRepo.DeleteSession(ctx, claims.ID)
		if err != nil {
			return nil, errors.New("error, failed to delete session")
		}
		return nil, errors.New("error, refresh token expired")
	}

	user, err := a.UserRepo.GetUserByEmail(ctx, claims.Username)
	if err != nil {
		return nil, errors.New("error, user not found")
	}

	accessToken, err := a.AuthRepo.GenerateAccessToken(user)
	if err != nil {
		return nil, fmt.Errorf("error, failed to generate access token: %v", err)
	}

	return &accessToken, nil
}

func (a *AuthUsecases) Logout(ctx context.Context, claims entities.UsersClaims) error {
	err := a.SessionRepo.DeleteSession(ctx, claims.ID)
	if err != nil {
		return errors.New("error, failed to delete session")
	}

	return nil
}

func (a *AuthUsecases) Me(ctx context.Context, claims entities.UsersClaims) (*entities.UsersDataRes, error) {
	user, err := a.UserRepo.GetUserByEmail(ctx, claims.Email)
	if err != nil {
		return nil, errors.New("error, user not found")
	}

	res := &entities.UsersDataRes{
		Id:       user.Id,
		Username: user.Username,
		Email:    user.Email,
	}

	return res, nil
}
