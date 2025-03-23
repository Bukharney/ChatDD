package entities

import (
	"context"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
)

type UsersUsecase interface {
	Register(ctx context.Context, req *UsersRegisterReq) (*UsersRegisterRes, error)
	ChangePassword(ctx context.Context, req *UsersChangePasswordReq) (*UsersChangedRes, error)
	GetUserDetails(user UsersClaims) (*UsersDataRes, error)
	DeleteAccount(user UsersClaims) (*UsersChangedRes, error)
	AddFriend(req *FriendReq) (*FriendRes, error)
	GetFriendsReq(userId uuid.UUID) ([]FriendInfoRes, error)
	GetFriends(userId uuid.UUID) ([]FriendInfoRes, error)
	RejectFriend(userId uuid.UUID, FriendUsername string) (*UsersChangedRes, error)
}

type UsersRepository interface {
	Register(ctx context.Context, req *UsersRegisterReq) (*UsersRegisterRes, error)
	GetUserByEmail(email string) (*UsersPassport, error)
	ChangePassword(ctx context.Context, req *UsersChangePasswordReq) (*UsersChangedRes, error)
	DeleteAccount(user_id uuid.UUID) (*UsersChangedRes, error)
	AddFriend(req *FriendReq) (*FriendRes, error)
	GetFriendsReq(user_id uuid.UUID) ([]FriendInfoRes, error)
	GetFriendReq(user_id uuid.UUID, friend_id uuid.UUID) (*FriendRes, error)
	GetFriends(user_id uuid.UUID) ([]FriendInfoRes, error)
	AcceptFriendReq(user_id uuid.UUID, friend_id uuid.UUID, room_id int) (*FriendRes, error)
	RejectFriend(user_id uuid.UUID, friend_id uuid.UUID) (*UsersChangedRes, error)
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
	Id          uuid.UUID `json:"id" db:"id"`
	Username    string    `json:"username" db:"username"`
	Email       string    `json:"email" db:"email"`
	AccessToken string    `json:"token"`
}

type UsersClaims struct {
	Id       uuid.UUID `json:"user_id"`
	Username string    `json:"username"`
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

type UsersLoginRes struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type UsersChangedRes struct {
	Success bool `json:"success"`
}

type FriendReq struct {
	UserId         uuid.UUID `json:"user_id"`
	FriendId       uuid.UUID `json:"friend_id"`
	FriendUsername string    `json:"username" binding:"required"`
	Status         int       `json:"status"`
}

type FriendRes struct {
	UserId   uuid.UUID `json:"user_id" db:"from_user_id"`
	FriendId uuid.UUID `json:"friend_id" db:"to_user_id"`
	Status   int       `json:"status" db:"status"`
	Created  string    `json:"created_at" db:"created_at"`
}

type FriendInfoRes struct {
	Id       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	Status   int       `json:"status"`
	RoomId   int       `json:"room_id" db:"room_id"`
}
