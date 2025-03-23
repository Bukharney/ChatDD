package repositories

import (
	"github.com/bukharney/ChatDD/modules/entities"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ChatRepo struct {
	Db *pgxpool.Pool
}

func NewChatRepo(db *pgxpool.Pool) entities.ChatRepository {
	return &ChatRepo{Db: db}
}

func (c *ChatRepo) CreateChatRoom(req *entities.ChatRoom) (int, error) {
	return 0, nil
}

func (c *ChatRepo) GetChatRoom(userId uuid.UUID, roomId int) error {
	return nil
}

func (c *ChatRepo) JoinChatRoom(req *entities.JoinChatRoomReq) error {
	return nil
}

func (c *ChatRepo) LeaveChatRoom(req *entities.JoinChatRoomReq) error {
	return nil
}

func (c *ChatRepo) SendMessage(req *entities.ChatMessage) error {
	return nil
}

func (c *ChatRepo) GetChatMessages(roomId int) ([]entities.ChatMessage, error) {
	return nil, nil
}

func (c *ChatRepo) GetChatRoomUsers(roomId int) ([]entities.ChatUser, error) {
	return nil, nil
}
