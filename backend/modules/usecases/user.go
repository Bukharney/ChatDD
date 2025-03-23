package usecases

import (
	"context"
	"errors"

	"github.com/bukharney/ChatDD/modules/entities"
	"github.com/bukharney/ChatDD/utils/argon"
	"github.com/google/uuid"
)

type UsersUsecases struct {
	UsersRepo entities.UsersRepository
	ChatRepo  entities.ChatRepository
	Argon     *argon.Argon
}

func NewUsersUsecases(
	usersRepo entities.UsersRepository,
	chatRepo entities.ChatRepository,
	argon *argon.Argon,
) entities.UsersUsecase {
	return &UsersUsecases{
		UsersRepo: usersRepo,
		ChatRepo:  chatRepo,
		Argon:     argon,
	}
}

func (a *UsersUsecases) Register(ctx context.Context, req *entities.UsersRegisterReq) (*entities.UsersRegisterRes, error) {
	hashedPassword, err := a.hashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	req.Password = hashedPassword

	user, err := a.UsersRepo.Register(ctx, req)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (a *UsersUsecases) ChangePassword(ctx context.Context, req *entities.UsersChangePasswordReq) (*entities.UsersChangedRes, error) {
	user, err := a.UsersRepo.GetUserByEmail(req.Username)
	if err != nil {
		return nil, errors.New("error, user not found")
	}

	if ok, err := a.Argon.ComparePasswordAndHash(user.Password, req.OldPassword); err != nil {
		return nil, errors.New("error, failed to compare password and hash")
	} else if !ok {
		return nil, errors.New("error, password is invalid")
	}

	req.NewPassword, err = a.hashPassword(req.NewPassword)
	if err != nil {
		return nil, err
	}

	res, err := a.UsersRepo.ChangePassword(ctx, req)
	if err != nil {
		return nil, err
	}

	return res, nil
}

func (a *UsersUsecases) hashPassword(password string) (string, error) {
	hashedPassword, err := a.Argon.GenerateFromPassword(password)
	if err != nil {
		return "", err
	}

	return string(hashedPassword), nil
}

func (a *UsersUsecases) GetUserByUsername(username string) (*entities.UsersPassport, error) {
	user, err := a.UsersRepo.GetUserByEmail(username)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (a *UsersUsecases) GetUserDetails(user entities.UsersClaims) (*entities.UsersDataRes, error) {
	res, err := a.UsersRepo.GetUserByEmail(user.Username)
	if err != nil {
		return nil, err
	}

	return &entities.UsersDataRes{
		Id:       res.Id,
		Username: res.Username,
		Email:    res.Email,
	}, nil
}

func (a *UsersUsecases) DeleteAccount(user entities.UsersClaims) (*entities.UsersChangedRes, error) {
	res, err := a.UsersRepo.DeleteAccount(user.Id)
	if err != nil {
		return nil, err
	}

	return res, nil
}

func (a *UsersUsecases) AddFriend(req *entities.FriendReq) (*entities.FriendRes, error) {
	res, err := a.UsersRepo.AddFriend(req)
	if err != nil {
		return nil, err
	}

	return res, nil
}

func (a *UsersUsecases) RejectFriend(userId uuid.UUID, FriendUsername string) (*entities.UsersChangedRes, error) {
	friend, err := a.GetUserByUsername(FriendUsername)
	if err != nil {
		return nil, err
	}
	res, err := a.UsersRepo.RejectFriend(userId, friend.Id)
	if err != nil {
		return nil, err
	}

	return res, nil
}

func (a *UsersUsecases) GetFriendsReq(userId uuid.UUID) ([]entities.FriendInfoRes, error) {
	res, err := a.UsersRepo.GetFriendsReq(userId)
	if err != nil {
		return nil, err
	}

	return res, nil
}

func (a *UsersUsecases) GetFriends(userId uuid.UUID) ([]entities.FriendInfoRes, error) {
	res, err := a.UsersRepo.GetFriends(userId)
	if err != nil {
		return nil, err
	}

	return res, nil
}
