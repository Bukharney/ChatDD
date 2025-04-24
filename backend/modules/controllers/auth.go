package controllers

import (
	"net/http"
	"time"

	"github.com/bukharney/ChatDD/configs"
	"github.com/bukharney/ChatDD/middlewares"
	"github.com/bukharney/ChatDD/modules/entities"
	"github.com/gin-gonic/gin"
)

type AuthController struct {
	Cfg         *configs.Configs
	AuthUsecase entities.AuthUsecase
}

func NewAuthControllers(r gin.IRoutes, cfg *configs.Configs, authUsecase entities.AuthUsecase) {
	controllers := &AuthController{
		Cfg:         cfg,
		AuthUsecase: authUsecase,
	}

	r.POST("/login", controllers.Login)
	r.GET("/auth-test", middlewares.JwtAuthentication(middlewares.AccessToken), controllers.AuthTest)
	r.GET("/refresh-token", middlewares.JwtAuthentication(middlewares.RefreshToken), controllers.RefreshToken)
	r.GET("/logout", middlewares.JwtAuthentication(middlewares.AccessToken), controllers.Logout)
	r.GET("/me", middlewares.JwtAuthentication(middlewares.AccessToken), controllers.Me)
}

func (a *AuthController) Login(c *gin.Context) {
	ctx := c.Request.Context()
	req := new(entities.UsersCredentials)
	err := c.ShouldBind(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	res, err := a.AuthUsecase.Login(a.Cfg, ctx, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "access_token",
		Value:    res.AccessToken,
		HttpOnly: true,
		Path:     "/",
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refresh_token",
		Value:    res.RefreshToken,
		HttpOnly: true,
		Path:     "/v1/auth/refresh-token",
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "success",
	})
}

func (a *AuthController) AuthTest(c *gin.Context) {
	tk, err := middlewares.GetUserByToken(c, middlewares.AccessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, tk)
}

func (a *AuthController) RefreshToken(c *gin.Context) {
	ctx := c.Request.Context()
	tk, err := middlewares.GetUserByToken(c, middlewares.RefreshToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	res, err := a.AuthUsecase.RefreshToken(ctx, *tk)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "access_token",
		Value:    *res,
		HttpOnly: true,
		Path:     "/",
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "success",
	})
}

func (a *AuthController) Logout(c *gin.Context) {
	ctx := c.Request.Context()
	tk, err := middlewares.GetUserByToken(c, middlewares.AccessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	err = a.AuthUsecase.Logout(ctx, *tk)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "access_token",
		Path:     "/",
		Value:    "",
		HttpOnly: true,
		Expires:  time.Now(),
	})

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refresh_token",
		Path:     "/v1/auth/refresh-token",
		Value:    "",
		HttpOnly: true,
		Expires:  time.Now(),
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "success",
	})
}

func (a *AuthController) Me(c *gin.Context) {
	tk, err := middlewares.GetUserByToken(c, middlewares.AccessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, tk)
}
