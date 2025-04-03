package aes

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"io"

	"golang.org/x/crypto/hkdf"
)

// GenerateRandomSalt creates a unique random salt for each session
func GenerateRandomSalt() ([]byte, error) {
	salt := make([]byte, 16) // 16-byte random salt
	_, err := rand.Read(salt)
	if err != nil {
		return nil, err
	}
	return salt, nil
}

// DeriveKey securely generates an AES key using HKDF with a unique salt
func DeriveKey(sharedSecret, salt []byte) ([]byte, error) {
	hkdf := hkdf.New(sha256.New, sharedSecret, salt, nil)

	aesKey := make([]byte, 32) // 256-bit AES key
	if _, err := io.ReadFull(hkdf, aesKey); err != nil {
		return nil, err
	}

	return aesKey, nil
}

// EncryptMessage encrypts a message using AES-GCM and includes the salt
func EncryptMessage(plainText string, key []byte) (string, error) {
	nonce := make([]byte, 12)
	_, err := rand.Read(nonce)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	cipherText := aesGCM.Seal(nil, nonce, []byte(plainText), nil)

	// Combine nonce + ciphertext
	combined := append(nonce, cipherText...)
	return base64.StdEncoding.EncodeToString(combined), nil
}

// DecryptMessage decrypts a message using AES-GCM and the correct salt
func DecryptMessage(cipherTextBase64 string, key []byte) (string, error) {
	combined, err := base64.StdEncoding.DecodeString(cipherTextBase64)
	if err != nil {
		return "", err
	}

	if len(combined) < 12 {
		return "", err
	}

	nonce := combined[:12]
	cipherText := combined[12:]

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	plainText, err := aesGCM.Open(nil, nonce, cipherText, nil)
	if err != nil {
		return "", err
	}

	return string(plainText), nil
}
