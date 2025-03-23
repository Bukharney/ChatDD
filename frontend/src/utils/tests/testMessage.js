import { generateKeyPair } from "../generateKeyPairUtils.js";
import { encryptPrivateKey, decryptPrivateKey } from "../privateKeyUtils.js";
import { encryptMessage, decryptMessage } from "../messageUtils.js";

const testMessage = async () => {
    // generateKeyPair
    const keyPair = await generateKeyPair();
    const password = "securePassword123";

    // test encryptPrivateKey and decryptPrivateKey with password
    const { encryptedPrivateKey, salt } = await encryptPrivateKey(keyPair.privateKey, password);
    const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, salt, password);

    const message = "This is a secret message!";

    console.log("Original Message:", message);

    // encryptMessage
    const { encryptedMessage, iv } = await encryptMessage(keyPair.publicKey, decryptedPrivateKey, message);
    console.log("Encrypted Message:", new Uint8Array(encryptedMessage));

    // decryptMessage
    const decryptedMessage = await decryptMessage(keyPair.publicKey, decryptedPrivateKey, encryptedMessage, iv);
    console.log("Decrypted Message:", decryptedMessage);
};

testMessage();
