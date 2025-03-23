// Function to encrypt the user's private key using a password
export const encryptPrivateKey = async (privateKey, password) => {
    const enc = new TextEncoder();

    // Import the password as a key using PBKDF2
    const passwordKey = await crypto.subtle.importKey(
        "raw", 
        enc.encode(password),  // Convert password into bytes
        { name: "PBKDF2" },     // Use PBKDF2 for key derivation
        false, 
        ["deriveKey"]
    );

    // Generate a random Salt for key derivation
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Derive the encryption key using PBKDF2 with the password key and salt
    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,  
            iterations: 100000,  
            hash: "SHA-256" 
        },
        passwordKey,
        { name: "AES-GCM", length: 256 },  // The derived key will be used for AES-GCM encryption
        false,
        ["encrypt"]  // The key will only be used for encryption
    );

    // Export the private key in JWK format
    const privateKeyBuffer = await crypto.subtle.exportKey("jwk", privateKey);

    // Encrypt the private key using AES-GCM with the derived key and salt as IV
    const encryptedPrivateKey = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: salt },  
        derivedKey,
        new TextEncoder().encode(JSON.stringify(privateKeyBuffer))  // Convert private key to string for encryption
    );

    // Return the encrypted private key and salt
    return { encryptedPrivateKey: new Uint8Array(encryptedPrivateKey), salt };
};

// Function to decrypt the user's private key using the password
export const decryptPrivateKey = async (encryptedPrivateKey, salt, password) => {
    const enc = new TextEncoder();

    // Import the password as a key using PBKDF2
    const passwordKey = await crypto.subtle.importKey(
        "raw", 
        enc.encode(password),  
        { name: "PBKDF2" },  
        false, 
        ["deriveKey"]
    );

    // Derive the decryption key using PBKDF2 with the password key and salt
    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,  
            iterations: 100000,  
            hash: "SHA-256"  
        },
        passwordKey,
        { name: "AES-GCM", length: 256 },  
        false,
        ["decrypt"]  
    );

    // Decrypt the private key using AES-GCM with the derived key and salt as IV
    const decryptedPrivateKey = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: salt },  
        derivedKey,
        encryptedPrivateKey  
    );

    // Parse the decrypted private key and import it back as an ECDH key
    const privateKeyBuffer = JSON.parse(new TextDecoder().decode(decryptedPrivateKey));
    return await crypto.subtle.importKey(
        "jwk", 
        privateKeyBuffer,  // The decrypted private key in JWK format
        { name: "ECDH", namedCurve: "P-256" },  // Use ECDH algorithm with P-256 curve
        true,  // The key is extractable
        ["deriveKey", "deriveBits"]  // The key will be used for key derivation and bit derivation
    );
};
