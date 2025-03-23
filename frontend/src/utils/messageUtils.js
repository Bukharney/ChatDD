// Function to generate a shared secret key using ECDH (Elliptic Curve Diffie-Hellman) algorithm
const generateSharedSecretKey = async (publicKey, privateKey) => {
    const sharedSecret = await crypto.subtle.deriveKey(
        { name: "ECDH", public: publicKey },  // Derive using ECDH and the public key
        privateKey,  // Use the private key for the derivation
        { name: "AES-GCM", length: 256 },  // Use AES-GCM for encryption
        false,  // The key is not exportable
        ["encrypt", "decrypt"]  // Allow encryption and decryption
    );

    return sharedSecret;
};

// Function to encrypt a message using AES-GCM and the shared secret key
export const encryptMessage = async (publicKey, privateKey, message) => {
    const sharedSecretKey = await generateSharedSecretKey(publicKey, privateKey);
    const iv = crypto.getRandomValues(new Uint8Array(12));  // Generate random IV
    const encodedMessage = new TextEncoder().encode(message);  // Encode the message

    const encryptedMessage = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },  
        sharedSecretKey,  
        encodedMessage  
    );

    return { encryptedMessage, iv };  
};

// Function to decrypt a message using AES-GCM and the shared secret key
export const decryptMessage = async (publicKey, privateKey, encryptedMessage, iv) => {
    const sharedSecretKey = await generateSharedSecretKey(publicKey, privateKey);

    const decryptedMessage = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },  
        sharedSecretKey,  
        encryptedMessage  
    );

    return new TextDecoder().decode(decryptedMessage); 
};
