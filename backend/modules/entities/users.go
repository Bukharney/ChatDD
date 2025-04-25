package entities

import (
	"context"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
)

type UsersUsecase interface {
	Register(ctx context.Context, req *UsersRegisterReq) (*UsersRegisterRes, error)
	ChangePassword(ctx context.Context, req *UsersChangePasswordReq) (*UsersChangedRes, error)
	GetUserDetails(ctx context.Context, user UsersClaims) (*UsersDataRes, error)
	GetUserByEmail(ctx context.Context, email string) (*UsersDataRes, error)
	DeleteAccount(ctx context.Context, user UsersClaims) (*UsersChangedRes, error)
	AddFriend(ctx context.Context, req *FriendReq) (*FriendRes, error)
	GetFriends(ctx context.Context, userId uuid.UUID) ([]FriendInfoRes, error)
}

type UsersRepository interface {
	Register(ctx context.Context, req *UsersRegisterReq) (*UsersRegisterRes, error)
	GetUserByEmail(ctx context.Context, email string) (*UsersPassport, error)
	ChangePassword(ctx context.Context, req *UsersChangePasswordReq) (*UsersChangedRes, error)
	DeleteAccount(ctx context.Context, user_id uuid.UUID) (*UsersChangedRes, error)
	AddFriend(ctx context.Context, req *FriendReq) error
	GetFriends(ctx context.Context, user_id uuid.UUID) ([]FriendInfoRes, error)
}

type UsersCredentials struct {
	Username string `json:"username" db:"username" form:"username" binding:"required"`
	Password string `json:"password" db:"password" form:"password" binding:"required"`
}

type UsersPassport struct {
	Id       uuid.UUID `json:"id" db:"id"`
	Username string    `json:"username" db:"username"`
	Password string    `json:"password" db:"password"`
	Email    string    `json:"email" db:"email"`
}

type UsersDataRes struct {
	Id       uuid.UUID `json:"id" db:"id"`
	Username string    `json:"username" db:"username"`
	Email    string    `json:"email" db:"email"`
}

type UsersClaims struct {
	Id       uuid.UUID `json:"user_id"`
	Username string    `json:"username"`
	Email    string    `json:"email"`
	jwt.RegisteredClaims
}

type UsersRegisterReq struct {
	Username string `json:"username" db:"username" binding:"required"`
	Password string `json:"password" db:"password" binding:"required"`
	Email    string `json:"email" db:"email" binding:"required"`
}

type UsersChangePasswordReq struct {
	Id          uuid.UUID `json:"id" db:"id"`
	Username    string    `json:"username" db:"username"`
	OldPassword string    `json:"old_password" db:"old_password" binding:"required"`
	NewPassword string    `json:"new_password" db:"new_password" binding:"required"`
}

type UsersRegisterRes struct {
	Id          uuid.UUID `json:"id" db:"id"`
	Username    string    `json:"username" db:"username"`
	AccessToken string    `json:"token"`
}

type Token struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type UsersChangedRes struct {
	Success bool `json:"success"`
}

type FriendReq struct {
	UserId   uuid.UUID `json:"user_a_id"`
	FriendId uuid.UUID `json:"user_b_id"`
}

type FriendRes struct {
	Success bool `json:"success"`
}

type FriendInfoRes struct {
	Id       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	Email    string    `json:"email"`
	RoomId   int       `json:"room_id" db:"room_id"`
}

type UserInfo struct {
	Id       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	Email    string    `json:"email"`
}
