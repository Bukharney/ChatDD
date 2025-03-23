import { generateKeyPair } from "../generateKeyPairUtils.js";
import { encryptPrivateKey, decryptPrivateKey } from "../privateKeyUtils.js";
import { encryptMessage, decryptMessage } from "../messageUtils.js";

const testMessage = async () => {
    const keyPair = await generateKeyPair();
    const password = "securePassword123";
    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(keyPair.privateKey, password);
    const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, password, salt, iv);


    const message = "This is a secret message.";
    console.log("Message:", message);

    const encryptedMessage = await encryptMessage(message, keyPair.publicKey);
    console.log("Encrypted Message:", encryptedMessage);

    const decryptedMessage = await decryptMessage(encryptedMessage, decryptedPrivateKey);
    console.log("Decrypted Message:", decryptedMessage);


};

testMessage();



