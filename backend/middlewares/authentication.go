package middlewares

import (
	"errors"
	"fmt"
	"net/http"
	"os"

	"slices"

	"github.com/bukharney/ChatDD/modules/entities"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

type TokenType string

var (
	AccessToken  TokenType = "access_token"
	RefreshToken TokenType = "refresh_token"
)

func JwtAuthentication(token TokenType) gin.HandlerFunc {
	return func(c *gin.Context) {
		notAuth := []string{"/login"}
		requestPath := c.Request.URL.Path

		if slices.Contains(notAuth, requestPath) {
			c.Next()
			return
		}
		cookie, err := c.Request.Cookie(string(token))
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "error, missing auth token",
			})
			c.Abort()
			return
		}
		secretKey := os.Getenv("JWT_SECRET")
		if len(secretKey) < 64 {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "error, invalid jwt secret key",
			})
			c.Abort()
			return
		}
		tk := &entities.UsersClaims{}
		token, err := jwt.ParseWithClaims(cookie.Value, tk, func(token *jwt.Token) (interface{}, error) {
			return []byte(secretKey), nil
		})

		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{
				"error": fmt.Sprintf("validating token: %v", err),
			})
			c.Abort()
			return
		}

		if !token.Valid {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Invalid token",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

func GetUserByToken(c *gin.Context, token TokenType) (*entities.UsersClaims, error) {
	cookie, err := c.Request.Cookie(string(token))
	if err != nil {
		return nil, errors.New("error, missing token")
	}

	tk := &entities.UsersClaims{}
	_, err = jwt.ParseWithClaims(cookie.Value, tk, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil {
		return nil, errors.New("error, invalid token")
	}

	return tk, nil
}

func GetUserToken(tokenPart string) (*entities.UsersClaims, error) {
	tk := &entities.UsersClaims{}

	if tokenPart == "" {
		return nil, errors.New("error, missing auth token")
	}

	_, err := jwt.ParseWithClaims(tokenPart, tk, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil {
		return nil, errors.New("error, invalid token")
	}

	return tk, nil
}
