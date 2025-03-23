package server

import (
	"net/http"

	"github.com/bukharney/ChatDD/modules/controllers"
	"github.com/bukharney/ChatDD/modules/repositories"
	"github.com/bukharney/ChatDD/modules/usecases"
	"github.com/bukharney/ChatDD/utils/argon"
	"github.com/gin-gonic/gin"
)

func (s *Server) MapHandlers() error {
	v1 := s.App.Group("/v1")

	usersGroup := v1.Group("/users")
	authGroup := v1.Group("/auth")
	chat := v1.Group("/chat")

	argon := argon.NewArgon(&s.Cfg.Argon)

	usersRepo := repositories.NewUsersRepo(s.DB)
	sessionRepo := repositories.NewSessionRepo(s.DB)
	authRepo := repositories.NewAuthRepo(sessionRepo)
	chatRepo := repositories.NewChatRepo(s.DB)

	authUsecase := usecases.NewAuthUsecases(authRepo, usersRepo, sessionRepo, argon)
	usersUsecase := usecases.NewUsersUsecases(usersRepo, chatRepo, argon)
	chatUsecase := usecases.NewChatUsecases(chatRepo)

	controllers.NewUsersControllers(usersGroup, usersUsecase, authUsecase)
	controllers.NewAuthControllers(authGroup, s.Cfg, authUsecase)
	controllers.NewChatControllers(chat, usersUsecase, authUsecase, chatUsecase)

	s.App.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{"message": "Path Not Found"})
	})

	return nil
}
