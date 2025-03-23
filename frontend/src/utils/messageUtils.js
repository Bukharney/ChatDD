// ฟังก์ชันสำหรับเข้ารหัสข้อความ
export const encryptMessage = async (message, publicKey) => {
    // แปลงข้อความเป็น ArrayBuffer
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(message);

    try {
        // ใช้ RSA-OAEP ในการเข้ารหัสข้อความ
        const encryptedMessage = await crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            publicKey,  // public key ที่จะใช้ในการเข้ารหัส
            messageBuffer  // ข้อความที่ต้องการเข้ารหัส
        );

        return new Uint8Array(encryptedMessage);  // ส่งคืนข้อความที่ถูกเข้ารหัส
    } catch (error) {
        console.error("Encryption failed:", error);
        throw new Error("Encryption failed: " + error.message);
    }
};

// ฟังก์ชันสำหรับถอดรหัสข้อความ
export const decryptMessage = async (encryptedMessage, privateKey) => {
    try {
        // ใช้ RSA-OAEP ในการถอดรหัสข้อความ
        const decryptedMessageBuffer = await crypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
            },
            privateKey,  // private key ที่จะใช้ในการถอดรหัส
            encryptedMessage  // ข้อความที่ถูกเข้ารหัส
        );

        // แปลงข้อมูลที่ถอดรหัสเป็นข้อความ (String)
        const decoder = new TextDecoder();
        const decryptedMessage = decoder.decode(decryptedMessageBuffer);

        return decryptedMessage;  // ส่งคืนข้อความที่ถูกถอดรหัส
    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Decryption failed: " + error.message);
    }
};
