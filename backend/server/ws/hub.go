package ws

import (
	"fmt"
)

type Hub struct {
	clients    map[string]*Client
	unregister chan *Client
	register   chan *Client
	broadcast  chan Message
}

type Message struct {
	Type      string `json:"type"`
	From      string `json:"from"`
	To        string `json:"to"`
	PublicKey string `json:"public_key,omitempty"`
	Salt      string `json:"salt,omitempty"`
	Content   string `json:"content,omitempty"`
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]*Client),
		unregister: make(chan *Client),
		register:   make(chan *Client),
		broadcast:  make(chan Message),
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
	if receiverOnline {
		receiverClient.send <- message
	}
}
