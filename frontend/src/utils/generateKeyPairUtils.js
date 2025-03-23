// Function to generate an ECDH Key Pair
export const generateKeyPair = async () => {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "ECDH",  // The name of the algorithm (Elliptic Curve Diffie-Hellman)
            namedCurve: "P-256",  // Use the P-256 elliptic curve
        },
        true,  // Indicates the key is extractable (can be exported)
        ["deriveKey", "deriveBits"]  // The key can be used for key derivation and bit derivation
    );
    return keyPair;  
};
