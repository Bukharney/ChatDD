package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/bukharney/ChatDD/configs"
	"github.com/bukharney/ChatDD/middlewares"
	"github.com/bukharney/ChatDD/modules/entities"
)

type ChatController struct {
	Cfg          *configs.Configs
	UsersUsecase entities.UsersUsecase
	AuthUsecase  entities.AuthUsecase
	ChatUsecase  entities.ChatUsecase
}

func NewChatControllers(r gin.IRoutes, usersUsecase entities.UsersUsecase, authUsecase entities.AuthUsecase, chatUsecase entities.ChatUsecase) {
	controllers := &ChatController{
		UsersUsecase: usersUsecase,
		AuthUsecase:  authUsecase,
		ChatUsecase:  chatUsecase,
	}

	r.POST("/", controllers.CreateChatRoom)
	r.GET("/:roomId", middlewares.JwtAuthentication(middlewares.AccessToken), controllers.GetChatMessages)
}

func (c *ChatController) CreateChatRoom(ctx *gin.Context) {
	var req entities.ChatRoom
	err := ctx.ShouldBindJSON(&req)
	if err != nil {
		ctx.JSON(400, gin.H{"message": err.Error()})
		return
	}

	err = c.ChatUsecase.CreateChatRoom(&req)
	if err != nil {
		ctx.JSON(500, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(200, gin.H{"message": "success"})
}

func (c *ChatController) GetChatMessages(ctx *gin.Context) {
	user, err := middlewares.GetUserByToken(ctx, middlewares.AccessToken)
	if err != nil {
		ctx.JSON(401, gin.H{"message": err.Error()})
		return
	}
	roomId := ctx.Param("roomId")
	rid, err := strconv.Atoi(roomId)
	if err != nil {
		ctx.JSON(400, gin.H{"message": err.Error()})
		return
	}

	err = c.ChatUsecase.GetChatRoom(user.Id, rid)
	if err != nil {
		ctx.JSON(500, gin.H{"message": err.Error()})
		return
	}

	messages, err := c.ChatUsecase.GetChatMessages(rid)
	if err != nil {
		ctx.JSON(500, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(200, messages)
}
