package ws

import (
	"fmt"
	"log"
	"net/http"

	"github.com/bukharney/ChatDD/middlewares"
	"github.com/bukharney/ChatDD/modules/entities"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Client struct for websocket connection and message sending
type Client struct {
	Chat entities.ChatRepository
	User *entities.UsersClaims
	Conn *websocket.Conn
	send chan Message
	hub  *Hub
}

// NewClient creates a new client
func NewClient(conn *websocket.Conn, hub *Hub, user *entities.UsersClaims, chat entities.ChatRepository) *Client {
	return &Client{
		Conn: conn,
		send: make(chan Message, 256),
		hub:  hub,
		User: user,
		Chat: chat,
	}
}

// Client goroutine to read messages from client
func (c *Client) Read() {
	defer func() {
		c.hub.unregister <- c
		c.Conn.Close()
	}()

	for {
		var msg Message
		err := c.Conn.ReadJSON(&msg)
		if err != nil {
			fmt.Println("Error: ", err)
			break
		}
		msg.From = c.User.Id.String()
		c.hub.broadcast <- msg
	}
}

// Client goroutine to write messages to client
func (c *Client) Write() {
	defer func() {
		c.Conn.Close()
	}()

	for message := range c.send {
		if err := c.Conn.WriteJSON(message); err != nil {
			log.Println("Error writing message to client: ", err)
			break
		}
	}
}

// Client closing channel to unregister client
func (c *Client) Close() {
	close(c.send)
}

// Function to handle websocket connection and register client to hub and start goroutines
func ServeWS(c *gin.Context, hub *Hub, chatRepo entities.ChatRepository) {
	tk, err := c.Cookie("access_token")
	if err != nil {
		log.Println("Error getting token from cookie: ", err)
		c.JSON(400, gin.H{"error": "token is required"})
		return
	}
	if tk == "" {
		log.Println("Token is required")
		c.JSON(400, gin.H{"error": "token is required"})
		return
	}

	user, err := middlewares.GetUserToken(tk)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println(err)
		return
	}

	client := NewClient(ws, hub, user, chatRepo)

	hub.register <- client

	go client.Write()
	go client.Read()
}
