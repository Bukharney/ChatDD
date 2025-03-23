import { generateKeyPair } from "../generateKeyPairUtils.js";
import { encryptPrivateKey, decryptPrivateKey } from "../privateKeyUtils.js";

const testKeyGenerationAndEncryption = async () => {
    const keyPair = await generateKeyPair();
    console.log("Key Pair:", keyPair);
    const password = "securePassword123";

    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(keyPair.privateKey, password);

    console.log("Encrypted Private Key:", new Uint8Array(encryptedPrivateKey));
    console.log("Salt:", salt);
    console.log("IV:", iv);

    const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, password, salt, iv);
    console.log("Decrypted Private Key:", decryptedPrivateKey);
};

testKeyGenerationAndEncryption();
