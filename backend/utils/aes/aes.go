package aes

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
)

// Function to generate AES key from shared secret
func DeriveKey(sharedSecret []byte) ([]byte, error) {
	// Hash the shared secret using SHA-256 to create a 256-bit key
	hash := sha256.New()
	hash.Write(sharedSecret)
	return hash.Sum(nil), nil
}

// AES GCM Encryption
func EncryptMessage(plainText string, key []byte) (string, error) {
	// Generate a random nonce (12 bytes for AES-GCM)
	nonce := make([]byte, 12)
	_, err := rand.Read(nonce)
	if err != nil {
		return "", err
	}

	// Create AES cipher block
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	// Create AES-GCM cipher and encrypt the message
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// Encrypt the message
	cipherText := aesGCM.Seal(nil, nonce, []byte(plainText), nil)

	// Combine nonce and ciphertext, then encode as base64 to send as a string
	combined := append(nonce, cipherText...)
	return base64.StdEncoding.EncodeToString(combined), nil
}

// AES GCM Decryption
func DecryptMessage(cipherTextBase64 string, key []byte) (string, error) {
	// Decode base64 to get the combined nonce + ciphertext
	combined, err := base64.StdEncoding.DecodeString(cipherTextBase64)
	if err != nil {
		return "", err
	}

	// Extract nonce (first 12 bytes) and ciphertext (rest of the message)
	nonce := combined[:12]
	cipherText := combined[12:]

	// Create AES cipher block
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	// Create AES-GCM cipher
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// Decrypt the message
	plainText, err := aesGCM.Open(nil, nonce, cipherText, nil)
	if err != nil {
		return "", err
	}

	return string(plainText), nil
}
