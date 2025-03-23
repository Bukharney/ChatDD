import { generateKeyPair } from "../generateKeyPairUtils.js";
import { encryptPrivateKey, decryptPrivateKey } from "../privateKeyUtils.js";

const testKeyGenerationAndEncryption = async () => {
    // generateKeyPair
    const keyPair = await generateKeyPair();
    console.log("Key Pair:", keyPair);
    const password = "securePassword123";

    // test encryptPrivateKey and decryptPrivateKey with password
    const { encryptedPrivateKey, salt } = await encryptPrivateKey(keyPair.privateKey, password);

    console.log("Encrypted Private Key:", encryptedPrivateKey);
    console.log("Salt:", salt);

    const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, salt, password);
    console.log("Decrypted Private Key:", decryptedPrivateKey);

};

testKeyGenerationAndEncryption();
