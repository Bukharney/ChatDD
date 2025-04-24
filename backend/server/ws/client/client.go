package main

import (
	"bufio"
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/bukharney/ChatDD/utils/aes"
	"github.com/gorilla/websocket"
	"golang.org/x/crypto/curve25519"
)

type ChatClient struct {
	Conn          *websocket.Conn
	User          string
	PublicKey     []byte
	PrivateKey    []byte
	Salt          []byte
	AESKey        []byte
	Recipient     string
	sentPublicKey bool   // Tracks if we have sent our public key
	peerPublicKey []byte // Stores the received public key
}

type Message struct {
	Type      string `json:"type"`
	From      string `json:"from"`
	To        string `json:"to"`
	PublicKey string `json:"public_key,omitempty"`
	Salt      string `json:"salt,omitempty"`
	Content   string `json:"content,omitempty"`
}

func main() {
	if len(os.Args) < 4 {
		log.Fatal("Usage: ./client <username> <password> <recipient>")
	}

	user, password, recipient := os.Args[1], os.Args[2], os.Args[3]
	accessToken, err := login(user, password)
	if err != nil {
		log.Fatalf("Login failed: %v", err)
	}
	log.Println("Login successful. Access token obtained.")

	headers := http.Header{}
	headers.Set("Cookie", "access_token="+accessToken)
	serverURL := "ws://localhost:8080/ws"
	conn, err := connectWebSocket(serverURL, headers)
	if err != nil {
		log.Fatalf("WebSocket connection failed: %v", err)
	}
	defer conn.Close()
	log.Println("WebSocket connection established.")

	client := &ChatClient{User: user, Recipient: recipient, Conn: conn}
	client.initialize()
}

func (c *ChatClient) initialize() {
	log.Println("Initializing chat client...")
	if err := c.generateKeyPair(); err != nil {
		log.Fatal("Key generation failed:", err)
	}

	if err := c.sendHandshake("request"); err != nil {
		log.Fatal("Failed to send handshake:", err)
	}

	log.Println("Handshake sent. Waiting for response...")
	c.messageLoop()
}

func login(user, password string) (string, error) {
	resp, err := http.Post("http://localhost:8080/v1/auth/login", "application/json",
		strings.NewReader(fmt.Sprintf(`{"username":"%s","password":"%s"}`, user, password)))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("unexpected status: %s", resp.Status)
	}

	header := resp.Header.Get("Set-Cookie")
	if header == "" {
		return "", errors.New("missing Set-Cookie header")
	}

	for _, part := range strings.Split(header, ";") {
		if strings.HasPrefix(part, "access_token=") {
			return strings.Split(part, "=")[1], nil
		}
	}
	return "", errors.New("invalid Set-Cookie format")
}

func connectWebSocket(url string, headers http.Header) (*websocket.Conn, error) {
	conn, _, err := websocket.DefaultDialer.DialContext(context.Background(), url, headers)
	return conn, err
}

func (c *ChatClient) generateKeyPair() error {
	privateKey := make([]byte, 32)
	if _, err := rand.Read(privateKey); err != nil {
		return err
	}
	publicKey, err := curve25519.X25519(privateKey, curve25519.Basepoint)
	if err != nil {
		return err
	}
	salt, err := aes.GenerateRandomSalt()
	if err != nil {
		log.Println("Failed to generate salt:", err)
		return err
	}
	log.Println("Generated key pair and salt.")
	log.Println("Public key:", base64.StdEncoding.EncodeToString(publicKey))
	log.Println("Private key:", base64.StdEncoding.EncodeToString(privateKey))
	log.Println("Salt:", base64.StdEncoding.EncodeToString(salt))
	c.PublicKey, c.PrivateKey, c.Salt = publicKey, privateKey, salt
	return nil
}

func (c *ChatClient) sendPublicKey(salt bool) error {
	msg := Message{}
	if salt {
		msg = Message{
			Type:      "key-exchange",
			To:        c.Recipient,
			PublicKey: base64.StdEncoding.EncodeToString(c.PublicKey),
			Salt:      base64.StdEncoding.EncodeToString(c.Salt),
		}
	} else {
		msg = Message{
			Type:      "key-exchange",
			To:        c.Recipient,
			PublicKey: base64.StdEncoding.EncodeToString(c.PublicKey),
		}
	}
	err := c.Conn.WriteJSON(msg)
	log.Println("Public key sent:", base64.StdEncoding.EncodeToString(c.PublicKey))
	if err == nil {
		c.sentPublicKey = true
	}
	return err
}

func (c *ChatClient) sendHandshake(status string) error {
	return c.Conn.WriteJSON(Message{
		Type:    "handshake",
		From:    c.User,
		To:      c.Recipient,
		Content: status,
	})
}

func (c *ChatClient) sendMessage() {
	reader := bufio.NewReader(os.Stdin)
	for {
		fmt.Print("You: ")
		text, _ := reader.ReadString('\n')
		text = strings.TrimSpace(text)
		if text == "" {
			continue
		}
		encryptedMsg, err := aes.EncryptMessage(text, c.AESKey)
		if err != nil {
			log.Println("Failed to encrypt message:", err)
			continue
		}
		err = c.Conn.WriteJSON(Message{
			Type:    "message",
			From:    c.User,
			To:      c.Recipient,
			Content: encryptedMsg,
		})
		if err != nil {
			log.Println("Failed to send message:", err)
		}
	}
}

func (c *ChatClient) messageLoop() {
	for {
		var msg Message
		if err := c.Conn.ReadJSON(&msg); err != nil {
			if errors.Is(err, io.EOF) {
				log.Println("Connection closed by server.")
			} else {
				log.Println("Error reading message:", err)
			}
			return
		}

		switch msg.Type {
		case "key-exchange":
			c.handleKeyExchange(msg)
		case "message":
			c.handleMessage(msg)
		case "handshake":
			c.handleHandshake(msg)
		default:
			log.Println("Unknown message type:", msg.Type)
		}
	}
}

func (c *ChatClient) handleKeyExchange(msg Message) {
	if msg.PublicKey == "" {
		log.Println("Received key exchange request but no public key. Sending mine...")
		if err := c.sendPublicKey(true); err != nil {
			log.Println("Failed to send public key:", err)
		}
		return
	}
	peerPublicKey, err := base64.StdEncoding.DecodeString(msg.PublicKey)
	if err != nil {
		log.Println("Invalid public key received:", err)
		return
	}

	log.Println("Received public key from", msg.From)
	log.Println("Peer public key:", base64.StdEncoding.EncodeToString(peerPublicKey))
	// Store peer's public key
	c.peerPublicKey = peerPublicKey

	// Ensure we also sent ours
	if !c.sentPublicKey {
		if err := c.sendPublicKey(false); err != nil {
			log.Println("Failed to send public key:", err)
			return
		}
	}
	// Proceed only if both keys are exchanged
	if c.peerPublicKey != nil && c.sentPublicKey {
		sharedSecret, err := curve25519.X25519(c.PrivateKey, c.peerPublicKey)
		if err != nil {
			log.Println("Error computing shared secret:", err)
			return
		}
		log.Println("Shared secret: ", base64.StdEncoding.EncodeToString(sharedSecret))
		salt := ""
		if msg.Salt == "" {
			salt = base64.StdEncoding.EncodeToString(c.Salt)
		} else {
			salt = msg.Salt
		}
		log.Println("Salt: ", salt)
		saltByte, err := base64.StdEncoding.DecodeString(salt)
		if err != nil {
			log.Println("Invalid salt received:", err)
			return
		}
		c.AESKey, err = aes.DeriveKey(sharedSecret, saltByte)
		if err != nil {
			log.Println("Failed to derive AES key:", err)
			return
		}
		log.Println("AES: ", base64.StdEncoding.EncodeToString(c.AESKey))
		log.Println("AES key established with", msg.From)
		// Confirm chat is ready
		err = c.sendHandshake("chat-ready")
		if err != nil {
			log.Println("Failed to send chat ready:", err)
		}
	}
}

func (c *ChatClient) handleMessage(msg Message) {
	if c.AESKey == nil {
		log.Println("AES key is not established yet.")
		return
	}
	decryptedMessage, err := aes.DecryptMessage(msg.Content, c.AESKey)
	if err != nil {
		log.Println("Failed to decrypt message:", err)
		return
	}
	log.Printf("\nMessage from %s: %s\n", msg.From, decryptedMessage)
}

func (c *ChatClient) handleHandshake(msg Message) {
	switch msg.Content {
	case "request":
		err := c.sendHandshake("accepted")
		if err != nil {
			log.Println("Failed to send handshake response:", err)
			return
		}
		log.Println("Handshake accepted with", msg.From)
	case "accepted":
		err := c.sendHandshake("key-exchange")
		if err != nil {
			log.Println("Failed to send key exchange:", err)
			return
		}
		log.Println("Handshake accepted by", msg.From)
	case "key-exchange":
		log.Println("Key exchange requested by", msg.From)
		if err := c.sendPublicKey(true); err != nil {
			log.Println("Failed to send public key:", err)
			return
		}
		log.Println("Public key sent to", msg.From)
	case "chat-ready":
		log.Println("Chat ready with", msg.From)
		go c.sendMessage()
	}
}
