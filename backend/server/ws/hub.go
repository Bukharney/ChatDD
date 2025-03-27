package ws

import (
	"fmt"
	"log"
)

type Hub struct {
	clients     map[string]*Client
	pendingKeys map[string]map[string]string
	unregister  chan *Client
	register    chan *Client
	broadcast   chan Message
}

type Message struct {
	Type      string `json:"type"`
	From      string `json:"from"`
	To        string `json:"to"`
	PublicKey string `json:"public_key,omitempty"`
	Content   string `json:"content,omitempty"`
}

func NewHub() *Hub {
	return &Hub{
		clients:     make(map[string]*Client),
		pendingKeys: make(map[string]map[string]string),
		unregister:  make(chan *Client),
		register:    make(chan *Client),
		broadcast:   make(chan Message),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.RegisterNewClient(client)
		case client := <-h.unregister:
			h.RemoveClient(client)
		case message := <-h.broadcast:
			h.HandleMessage(message)
		}
	}
}

func (h *Hub) RegisterNewClient(client *Client) {
	userId := client.User.Id.String()
	connections := h.clients[userId]
	if connections == nil {
		h.clients[userId] = client
	}

	if storedKeys, exists := h.pendingKeys[userId]; exists {
		for sender, key := range storedKeys {
			h.HandleMessage(Message{
				Type:      "key-exchange",
				From:      sender,
				To:        userId,
				PublicKey: key,
			})
		}
		delete(h.pendingKeys, userId) // Remove after sending
	}
	fmt.Println("Registered new client")
}

func (h *Hub) RemoveClient(client *Client) {
	if _, ok := h.clients[client.User.Id.String()]; ok {
		delete(h.clients, client.User.Id.String())
		close(client.send)
		fmt.Println("Unregistered client")
	}
}

func (h *Hub) HandleMessage(message Message) {
	receiverClient, receiverOnline := h.clients[message.To]
	switch message.Type {
	case "key-exchange":
		if receiverOnline {
			receiverClient.send <- message
		} else {
			if h.pendingKeys[message.To] == nil {
				h.pendingKeys[message.To] = make(map[string]string)
			}
			h.pendingKeys[message.To][message.From] = message.PublicKey
		}
		return
	case "handshake":
		if receiverOnline {
			receiverClient.send <- Message{
				Type: "chat_ready",
				From: "server",
				To:   message.From,
			}
			h.clients[message.From].send <- Message{
				Type: "chat_ready",
				From: "server",
				To:   message.To,
			}
		}
		return
	case "message":
		if receiverOnline {
			receiverClient.send <- message
		}
		return
	}

	log.Println("Unknown message type:", message.Type)
}
