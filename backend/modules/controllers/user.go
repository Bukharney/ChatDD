package controllers

import (
	"log"
	"net/http"

	"github.com/bukharney/ChatDD/configs"
	"github.com/bukharney/ChatDD/middlewares"
	"github.com/bukharney/ChatDD/modules/entities"
	"github.com/gin-gonic/gin"
)

type UsersController struct {
	Cfg          *configs.Configs
	UsersUsecase entities.UsersUsecase
	AuthUsecase  entities.AuthUsecase
}

func NewUsersControllers(r gin.IRoutes, usersUsecase entities.UsersUsecase, authUsecase entities.AuthUsecase) {
	controllers := &UsersController{
		UsersUsecase: usersUsecase,
		AuthUsecase:  authUsecase,
	}

	r.GET("/", middlewares.JwtAuthentication(middlewares.AccessToken), controllers.GetUserDetails)
	r.GET("/friends-request", middlewares.JwtAuthentication(middlewares.AccessToken), controllers.GetFriendsReq)
	r.GET("/friends", middlewares.JwtAuthentication(middlewares.AccessToken), controllers.GetFriends)
	r.POST("/", controllers.Register)
	r.POST("/add-friend", middlewares.JwtAuthentication(middlewares.AccessToken), controllers.AddFriend)
	r.POST("/reject-friend", middlewares.JwtAuthentication(middlewares.AccessToken), controllers.RejectFriend)
	r.DELETE("/", middlewares.JwtAuthentication(middlewares.AccessToken), controllers.DeleteAccount)
	r.PATCH("/", middlewares.JwtAuthentication(middlewares.AccessToken), controllers.ChangePassword)
}

func (u *UsersController) Register(c *gin.Context) {
	ctx := c.Request.Context()
	req := new(entities.UsersRegisterReq)
	err := c.ShouldBind(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	user := &entities.UsersCredentials{
		Username: req.Username,
		Password: req.Password,
	}

	res, err := u.UsersUsecase.Register(ctx, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	token, err := u.AuthUsecase.Login(u.Cfg, ctx, user)
	if err != nil {
		log.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	res.AccessToken = token.AccessToken

	c.JSON(http.StatusOK, res)
}

func (u *UsersController) ChangePassword(c *gin.Context) {
	ctx := c.Request.Context()
	claims, err := middlewares.GetUserByToken(c, middlewares.AccessToken)
	if err != nil {
		return
	}

	req := new(entities.UsersChangePasswordReq)
	err = c.ShouldBind(req)
	req.Username = claims.Username
	req.Id = claims.Id
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	res, err := u.UsersUsecase.ChangePassword(ctx, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (u *UsersController) GetUserDetails(c *gin.Context) {
	user, err := middlewares.GetUserByToken(c, middlewares.AccessToken)
	if err != nil {
		return
	}

	res, err := u.UsersUsecase.GetUserDetails(*user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (u *UsersController) DeleteAccount(c *gin.Context) {
	user, err := middlewares.GetUserByToken(c, middlewares.AccessToken)
	if err != nil {
		return
	}

	res, err := u.UsersUsecase.DeleteAccount(*user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (u *UsersController) AddFriend(c *gin.Context) {
	user, err := middlewares.GetUserByToken(c, middlewares.AccessToken)
	if err != nil {
		return
	}

	req := new(entities.FriendReq)
	err = c.ShouldBind(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	req.UserId = user.Id

	res, err := u.UsersUsecase.AddFriend(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (u *UsersController) RejectFriend(c *gin.Context) {
	user, err := middlewares.GetUserByToken(c, middlewares.AccessToken)
	if err != nil {
		return
	}

	req := new(entities.FriendReq)
	err = c.ShouldBind(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	req.UserId = user.Id

	res, err := u.UsersUsecase.RejectFriend(req.UserId, req.FriendUsername)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (u *UsersController) GetFriendsReq(c *gin.Context) {
	user, err := middlewares.GetUserByToken(c, middlewares.AccessToken)
	if err != nil {
		return
	}

	res, err := u.UsersUsecase.GetFriendsReq(user.Id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (u *UsersController) GetFriends(c *gin.Context) {
	user, err := middlewares.GetUserByToken(c, middlewares.AccessToken)
	if err != nil {
		return
	}

	res, err := u.UsersUsecase.GetFriends(user.Id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, res)
}
