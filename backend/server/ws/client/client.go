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
	AESKey        []byte
	Recipient     string
	Handshake     bool
	sentPublicKey bool   // Tracks if we have sent our public key
	peerPublicKey []byte // Stores the received public key
}

type Message struct {
	Type      string `json:"type"`
	From      string `json:"from"`
	To        string `json:"to"`
	PublicKey string `json:"public_key,omitempty"`
	Content   string `json:"content,omitempty"`
}

func main() {
	if len(os.Args) < 3 {
		log.Fatal("Usage: ./client <username> <password> <recipient>")
	}

	user, password, recipient := os.Args[1], os.Args[2], os.Args[3]

	accessToken, err := login(user, password)
	if err != nil {
		log.Fatal("Login failed:", err)
	}
	log.Println("Login successful. Access token obtained.")

	headers := http.Header{}
	headers.Set("Cookie", "access_token="+accessToken)

	serverURL := "ws://localhost:8080/ws"
	conn, err := connectWebSocket(serverURL, headers)
	if err != nil {
		log.Fatal("WebSocket connection failed:", err)
	}
	defer conn.Close()

	client := &ChatClient{User: user, Recipient: recipient, Conn: conn}

	err = client.generateKeyPair()
	if err != nil {
		log.Fatal("Key generation failed:", err)
	}

	err = client.sendHandshake("request")
	if err != nil {
		log.Fatal("Failed to send handshake:", err)
	}

	client.messageLoop()
}

func login(user, password string) (string, error) {
	loginURL := "http://localhost:8080/v1/auth/login"
	payload := fmt.Sprintf(`{"username":"%s","password":"%s"}`, user, password)

	resp, err := http.Post(loginURL, "application/json", strings.NewReader(payload))
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

	parts := strings.Split(header, ";")
	cookieParts := strings.Split(parts[0], "=")
	if len(cookieParts) != 2 || cookieParts[0] != "access_token" {
		return "", errors.New("invalid Set-Cookie format")
	}
	return cookieParts[1], nil
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
	c.PublicKey = publicKey
	c.PrivateKey = privateKey
	return err
}

func (c *ChatClient) sendPublicKey() error {
	encodedPubKey := base64.StdEncoding.EncodeToString(c.PublicKey)
	err := c.Conn.WriteJSON(Message{
		Type:      "key-exchange",
		To:        c.Recipient,
		PublicKey: encodedPubKey,
	})
	if err == nil {
		c.sentPublicKey = true // Only mark if sending was successful
	}
	return err
}

func (c *ChatClient) sendHandshake(status string) error {
	return c.Conn.WriteJSON(Message{
		Type:    "handshake",
		Content: status,
		From:    c.User,
		To:      c.Recipient,
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
		msg := Message{}
		err := c.Conn.ReadJSON(&msg)
		if err != nil {
			if errors.Is(err, io.EOF) {
				log.Println("Connection closed by server.")
			} else {
				log.Println("Error reading message:", err)
			}
			return
		}

		switch msg.Type {
		case "key-exchange":
			if msg.PublicKey == "" {
				log.Println("Received key exchange request but no public key. Sending mine...")
				if err := c.sendPublicKey(); err != nil {
					log.Println("Failed to send public key:", err)
				}
				continue
			}

			peerPublicKey, err := base64.StdEncoding.DecodeString(msg.PublicKey)
			if err != nil {
				log.Println("Invalid public key received:", err)
				continue
			}

			log.Println("Received public key from", msg.From)

			// Store peer's public key
			c.peerPublicKey = peerPublicKey

			// Ensure we also sent ours
			if !c.sentPublicKey {
				if err := c.sendPublicKey(); err != nil {
					log.Println("Failed to send public key:", err)
					continue
				}
			}

			// Proceed only if both keys are exchanged
			if c.peerPublicKey != nil && c.sentPublicKey {
				sharedSecret, err := curve25519.X25519(c.PrivateKey, c.peerPublicKey)
				if err != nil {
					log.Println("Error computing shared secret:", err)
					continue
				}

				c.AESKey, err = aes.DeriveKey(sharedSecret)
				if err != nil {
					log.Println("Failed to derive AES key:", err)
					continue
				}

				log.Println("AES key established with", msg.From)

				// Confirm chat is ready
				err = c.sendHandshake("chat_ready")
				if err != nil {
					log.Println("Failed to send chat ready:", err)
				}
			}
		case "message":
			if c.AESKey == nil {
				log.Println("AES key is not established yet.")
				continue
			}
			decryptedMessage, err := aes.DecryptMessage(msg.Content, c.AESKey)
			if err != nil {
				log.Println("Failed to decrypt message:", err)
				continue
			}
			log.Printf("\nMessage from %s: %s\n", msg.From, decryptedMessage)

		case "handshake":
			switch msg.Content {
			case "request":
				err = c.sendHandshake("accepted")
				if err != nil {
					log.Println("Failed to send handshake response:", err)
					continue
				}
				log.Println("Handshake accepted with", msg.From)

			case "accepted":
				err = c.sendHandshake("key-exchange")
				if err != nil {
					log.Println("Failed to send key exchange:", err)
					continue
				}
				log.Println("Handshake accepted by", msg.From)

			case "key-exchange":
				log.Println("Key exchange requested by", msg.From)

				if err := c.sendPublicKey(); err != nil {
					log.Println("Failed to send public key:", err)
					continue
				}
				log.Println("Public key sent to", msg.From)

			case "chat_ready":
				log.Println("Chat ready with", msg.From)
				go c.sendMessage()
			}
		}
	}
}
