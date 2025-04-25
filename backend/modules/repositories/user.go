package repositories

import (
	"context"

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
	cmdTag, err := r.Db.Exec(
		ctx,
		"UPDATE users SET password = $1 WHERE email = $2",
		req.NewPassword, req.Username,
	)

	if err != nil {
		return nil, utils.HandlePostgreSQLError(err)
	}

	if cmdTag.RowsAffected() == 0 {
		return &entities.UsersChangedRes{Success: false}, nil
	}

	return &entities.UsersChangedRes{Success: true}, nil
}

func (r *UserRepo) GetUserByEmail(ctx context.Context, email string) (*entities.UsersPassport, error) {
	var user entities.UsersPassport
	err := r.Db.QueryRow(
		ctx,
		"SELECT id, username, password, email FROM users WHERE email = $1",
		email,
	).Scan(&user.Id, &user.Username, &user.Password, &user.Email)

	if err != nil {
		return nil, utils.HandlePostgreSQLError(err)
	}

	return &user, nil
}

func (r *UserRepo) DeleteAccount(ctx context.Context, user_id uuid.UUID) (*entities.UsersChangedRes, error) {
	cmdTag, err := r.Db.Exec(
		ctx,
		"DELETE FROM users WHERE id = $1",
		user_id,
	)
	if err != nil {
		return &entities.UsersChangedRes{Success: false}, utils.HandlePostgreSQLError(err)
	}

	return &entities.UsersChangedRes{
		Success: cmdTag.RowsAffected() > 0,
	}, nil
}

func (r *UserRepo) AddFriend(ctx context.Context, req *entities.FriendReq) error {
	_, err := r.Db.Exec(
		ctx,
		`INSERT INTO friends (user_a_id, user_b_id)
		 SELECT $1, $2 WHERE NOT EXISTS (
		 	SELECT 1 FROM friends WHERE 
		 	(user_a_id = $1 AND user_b_id = $2) OR 
		 	(user_a_id = $2 AND user_b_id = $1)
		 )`,
		req.UserId, req.FriendId,
	)

	if err != nil {
		return utils.HandlePostgreSQLError(err)
	}

	return nil
}

func (r *UserRepo) GetFriends(ctx context.Context, user_id uuid.UUID) ([]entities.FriendInfoRes, error) {
	var res []entities.FriendInfoRes
	rows, err := r.Db.Query(
		ctx,
		`SELECT 
			CASE 
				WHEN user_a_id = $1 THEN user_b_id
				WHEN user_b_id = $1 THEN user_a_id
			END as friend_id,
			u.username, u.email
		FROM friends f
		JOIN users u ON u.id = CASE 
			WHEN user_a_id = $1 THEN user_b_id
			WHEN user_b_id = $1 THEN user_a_id
		END
		WHERE user_a_id = $1 OR user_b_id = $1`,
		user_id,
	)
	if err != nil {
		return nil, utils.HandlePostgreSQLError(err)
	}
	defer rows.Close()

	for rows.Next() {
		var friend entities.FriendInfoRes
		err = rows.Scan(&friend.Id, &friend.Username, &friend.Email)
		if err != nil {
			return nil, utils.HandlePostgreSQLError(err)
		}
		res = append(res, friend)
	}

	return res, nil
}
