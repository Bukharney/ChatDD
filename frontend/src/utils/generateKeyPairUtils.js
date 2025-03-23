export const generateKeyPair = async () => {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,  // ขนาดของ modulus
            publicExponent: new Uint8Array([1, 0, 1]),  // ค่า public exponent (65537)
            hash: "SHA-256",  // ใช้ SHA-256 สำหรับการแฮช
        },
        true,  // กำหนดว่า key สามารถใช้ได้ทั้งการเข้ารหัสและถอดรหัส
        ["encrypt", "decrypt"]  // ใช้ในการเข้ารหัสและถอดรหัส
    );

    return keyPair;
};
