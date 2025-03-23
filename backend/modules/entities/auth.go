package entities

import (
	"context"

	"github.com/bukharney/ChatDD/configs"
)

type AuthRepository interface {
	GenerateRefreshToken(ctx context.Context, req *UsersPassport) (string, error)
	GenerateAccessToken(req *UsersPassport) (string, error)
}

type AuthUsecase interface {
	Login(cfg *configs.Configs, ctx context.Context, req *UsersCredentials) (*UsersLoginRes, error)
	RefreshToken(ctx context.Context, claims UsersClaims) (*string, error)
}
