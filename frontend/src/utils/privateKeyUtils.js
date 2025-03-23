const deriveKey = async (password, salt) => {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
        "raw", 
        passwordBuffer, 
        "PBKDF2", 
        false, 
        ["deriveKey"]
    );

    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000, // จำนวนการทำ iterations
            hash: "SHA-256" // ใช้ SHA-256 สำหรับการแฮช
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 }, // สร้าง AES-GCM key ขนาด 256 บิต
        false,
        ["encrypt", "decrypt"] // ใช้ในการเข้ารหัสและถอดรหัส
    );

    return { derivedKey };
};

// ฟังก์ชันสำหรับเข้ารหัส private key ด้วย AES-GCM
export const encryptPrivateKey = async (privateKey, password) => {
    const salt = crypto.getRandomValues(new Uint8Array(16)); // สร้าง salt ขนาด 16 bytes
    const iv = crypto.getRandomValues(new Uint8Array(12)); // สร้าง IV ขนาด 12 bytes

    const { derivedKey } = await deriveKey(password, salt); // สร้าง key จาก password และ salt

    // แปลง private key เป็น ArrayBuffer
    const privateKeyBuffer = await crypto.subtle.exportKey("pkcs8", privateKey);

    // เข้ารหัส private key ด้วย AES-GCM
    const encryptedPrivateKey = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        derivedKey,
        privateKeyBuffer
    );

    return { encryptedPrivateKey, salt, iv }; // ส่งคืนข้อมูลที่ถูกเข้ารหัส, salt และ iv
};

export const decryptPrivateKey = async (encryptedPrivateKey, password, salt, iv) => {
    if (salt.length !== 16) {
        throw new Error("Salt must be 16 bytes for PBKDF2.");
    }
    if (iv.length !== 12) {
        throw new Error("IV must be 12 bytes for AES-GCM.");
    }

    try {
        const { derivedKey } = await deriveKey(password, salt);  // สร้าง key จาก password และ salt

        // ถอดรหัส private key ด้วย AES-GCM
        const decryptedPrivateKeyBuffer = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            derivedKey,
            encryptedPrivateKey
        );

        // แปลงข้อมูลกลับเป็น private key
        const privateKey = await crypto.subtle.importKey(
            "pkcs8",  // ค่าที่ใช้ในการ import private key
            decryptedPrivateKeyBuffer,  // ข้อมูลที่ถูกถอดรหัส
            { 
                name: "RSA-OAEP",  // ใช้ RSA-OAEP สำหรับการเข้ารหัสและถอดรหัส
                hash: "SHA-256"    // ต้องระบุ hash เพื่อให้การนำเข้า key ถูกต้อง
            },
            true,
            ["decrypt"]  // private key ใช้ในการถอดรหัส
        );

        return privateKey;
    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Decryption failed: " + error.message);
    }
};

