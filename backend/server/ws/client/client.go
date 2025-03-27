package main

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/bukharney/ChatDD/utils/aes"
	"github.com/gorilla/websocket"
	"golang.org/x/crypto/curve25519"
)

type Message struct {
	Type      string `json:"type"`
	From      string `json:"from"`
	To        string `json:"to"`
	PublicKey string `json:"public_key,omitempty"`
	Content   string `json:"content,omitempty"`
}

func main() {
	//get parameters from command line
	user := os.Args[1]
	password := os.Args[2]
	recipient := os.Args[3]
	if user == "" || password == "" {
		log.Fatal("Please provide username and password as command line arguments")
	}

	roomId := os.Args[3]
	if roomId == "" {
		log.Fatal("Please provide roomId as command line arguments")
	}

	// login to get access token
	logInURL := "http://localhost:8080/v1/auth/login"
	loginData := fmt.Sprintf(`{"username":"%s","password":"%s"}`, user, password)
	resp, err := http.Post(logInURL, "application/json", strings.NewReader(loginData))
	if err != nil {
		log.Fatal("Failed to log in:", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		log.Fatal("Login failed:", resp.Status)
	}

	header := resp.Header.Get("Set-Cookie")
	if header == "" {
		log.Fatal("No Set-Cookie header found")
	}

	// Extract the access token from the Set-Cookie header
	parts := strings.Split(header, ";")
	cookieParts := strings.Split(parts[0], "=")
	if len(cookieParts) != 2 || cookieParts[0] != "access_token" {
		log.Fatal("Invalid Set-Cookie header format")
	}
	accessToken := cookieParts[1]
	fmt.Println("Access token:", accessToken)

	reqHeaders := http.Header{}

	reqHeaders.Set("Cookie", "access_token="+accessToken)
	serverURL := "ws://localhost:8080/ws/" + roomId
	u, err := url.Parse(serverURL)
	if err != nil {
		log.Fatal("Invalid URL:", err)
	}

	conn, _, err := websocket.DefaultDialer.DialContext(context.Background(), u.String(), reqHeaders)
	if err != nil {
		log.Fatal("Failed to connect to server:", err)
	}
	defer conn.Close()

	// Step 2: Generate Diffie-Hellman keys
	privateKey := make([]byte, 32)
	_, err = rand.Read(privateKey)
	if err != nil {
		log.Fatal("Error generating private key:", err)
	}
	publicKey, _ := curve25519.X25519(privateKey, curve25519.Basepoint)
	encodedPubKey := base64.StdEncoding.EncodeToString(publicKey)

	// Step 3: Send public key to userB
	err = conn.WriteJSON(Message{
		Type:      "key-exchange",
		To:        recipient,
		PublicKey: encodedPubKey,
	})
	if err != nil {
		log.Fatal("Failed to send public key:", err)
	}

	var aesKey []byte
	// Step 6: Listen for incoming messages
	for {
		msg := Message{}
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("Connection closed:", err)
			return
		}
		if msg.Type == "key-exchange" {
			peerPublicKey, _ := base64.StdEncoding.DecodeString(msg.PublicKey)
			sharedSecret, _ := curve25519.X25519(privateKey, peerPublicKey)
			aesKey, err = aes.DeriveKey(sharedSecret)
			if err != nil {
				log.Println("Failed to generate AES key:", err)
				continue
			}

			fmt.Println("AES key derived successfully")

			encodedMessage, err := aes.EncryptMessage("Hello from userA", aesKey)
			if err != nil {
				log.Println("Failed to encrypt message:", err)
				continue
			}
			fmt.Println("Encrypted message:", encodedMessage)

			decryptedMessage, err := aes.DecryptMessage(encodedMessage, aesKey)
			if err != nil {
				log.Println("Failed to decrypt message:", err)
				continue
			}
			fmt.Println("Decrypted message:", decryptedMessage)
		}
		if msg.Type == "handshake" {
			// Send a message to the server to indicate that the chat is ready
			err = conn.WriteJSON(Message{
				Type: "chat_ready",
				From: user,
				To:   recipient,
			})
			if err != nil {
				log.Println("Failed to send chat ready message:", err)
				continue
			}
			fmt.Println("Chat is ready")
		}
		if msg.Type == "message" {
			// Decrypt the message using the AES key
			decryptedMessage, err := aes.DecryptMessage(msg.Content, aesKey)
			if err != nil {
				log.Println("Failed to decrypt message:", err)
				continue
			}
			fmt.Println("Decrypted message:", decryptedMessage)
		}
	}
}
