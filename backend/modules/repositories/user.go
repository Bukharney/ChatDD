package repositories

import (
	"context"
	"log"

	"github.com/bukharney/ChatDD/modules/entities"
	"github.com/bukharney/ChatDD/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepo struct {
	Db *pgxpool.Pool
}

func NewUsersRepo(db *pgxpool.Pool) entities.UsersRepository {
	return &UserRepo{Db: db}
}

func (r *UserRepo) Register(ctx context.Context, req *entities.UsersRegisterReq) (*entities.UsersRegisterRes, error) {
	var res entities.UsersRegisterRes
	err := r.Db.QueryRow(
		ctx,
		"INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id, username",
		req.Username, req.Password, req.Email,
	).Scan(&res.Id, &res.Username)

	if err != nil {
		return nil, utils.HandlePostgreSQLError(err)
	}

	return &res, nil
}

func (r *UserRepo) ChangePassword(ctx context.Context, req *entities.UsersChangePasswordReq) (*entities.UsersChangedRes, error) {
	err := r.Db.QueryRow(
		context.Background(),
		"UPDATE users SET password = $1 WHERE email = $2",
		req.NewPassword, req.Username,
	).Scan()
	if err != nil {
		return &entities.UsersChangedRes{
			Success: false,
		}, utils.HandlePostgreSQLError(err)
	}
	return &entities.UsersChangedRes{
		Success: true,
	}, nil
}

func (r *UserRepo) GetUserByEmail(email string) (*entities.UsersPassport, error) {
	log.Println("GetUserByEmail")
	log.Println(email)
	var user entities.UsersPassport
	err := r.Db.QueryRow(
		context.Background(),
		"SELECT id, username, password, email FROM users WHERE email = $1",
		email,
	).Scan(&user.Id, &user.Username, &user.Password, &user.Email)

	if err != nil {
		return nil, utils.HandlePostgreSQLError(err)
	}

	return &user, nil
}

func (r *UserRepo) DeleteAccount(user_id uuid.UUID) (*entities.UsersChangedRes, error) {
	return nil, nil
}

func (r *UserRepo) AddFriend(req *entities.FriendReq) (*entities.FriendRes, error) {
	return nil, nil
}

func (r *UserRepo) AcceptFriendReq(user_id uuid.UUID, friend_id uuid.UUID, room_id int) (*entities.FriendRes, error) {
	return nil, nil
}

func (r *UserRepo) RejectFriend(user_id uuid.UUID, friend_id uuid.UUID) (*entities.UsersChangedRes, error) {
	return nil, nil
}

func (r *UserRepo) GetFriendsReq(user_id uuid.UUID) ([]entities.FriendInfoRes, error) {
	return nil, nil
}

func (r *UserRepo) GetFriendReq(user_id uuid.UUID, friend_id uuid.UUID) (*entities.FriendRes, error) {
	return nil, nil
}

func (r *UserRepo) GetFriends(user_id uuid.UUID) ([]entities.FriendInfoRes, error) {
	return nil, nil
}
