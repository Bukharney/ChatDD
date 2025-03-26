package server

import (
	"errors"

	"github.com/bukharney/ChatDD/configs"
	"github.com/bukharney/ChatDD/modules/repositories"
	"github.com/bukharney/ChatDD/server/ws"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	App *gin.Engine
	Cfg *configs.Configs
	DB  *pgxpool.Pool
}

func NewServer(db *pgxpool.Pool, cfg *configs.Configs) *Server {
	return &Server{
		App: gin.Default(),
		DB:  db,
		Cfg: cfg,
	}
}

func (s *Server) Run() error {
	s.App.Use(cors.New(
		cors.Config{
			AllowOrigins:     []string{"http://localhost:5173"},
			AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
			AllowCredentials: true,
		},
	))

	err := s.MapHandlers()
	if err != nil {
		return errors.New("failed to map handlers")
	}

	hub := ws.NewHub()
	go hub.Run()

	chatRepo := repositories.NewChatRepo(s.DB)
	s.App.GET("/ws/:roomId", func(c *gin.Context) {
		ws.ServeWS(c, hub, chatRepo)
	})

	err = s.App.Run()
	if err != nil {
		return errors.New("failed to run server")
	}

	return nil
}
