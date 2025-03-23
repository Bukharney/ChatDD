import { useState } from "react";
import { generateKeyPair } from "../utils/generateKeyPairUtils";
import { encryptPrivateKey } from "../utils/privateKeyUtils";
import { saveEncryptedPrivateKey } from "../utils/storageUtils";
import { savePublicKey } from "../utils/publicKeyUtils";

const SignUp = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSignUp = async () => {
        if (!username || !password) {
            setErrorMessage("Please enter both username and password.");
            return;
        }

        // Generate Key Pair (Public and Private Keys)
        try {
            const keyPair = await generateKeyPair();
            const { publicKey, privateKey } = keyPair;

            console.log("Password:", password);
            console.log("Public Key:", publicKey);
            console.log("Private Key:", privateKey);

            // Encrypt Private Key with Password
            const { encryptedPrivateKey, salt } = await encryptPrivateKey(privateKey, password);

            console.log("Encrypted Private Key:", encryptedPrivateKey);
            console.log("Salt:", salt);

            // Save Public Key to server database
            await savePublicKey(publicKey);

            // Save the encrypted private key in browser storage
            await saveEncryptedPrivateKey(encryptedPrivateKey, salt);

            alert("Sign Up successful! You can now log in.");

        } catch (error) {
            setErrorMessage("Error generating keys or encrypting private key.");
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button onClick={handleSignUp}>Sign Up</button>
            <br />
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
    );
};

export default SignUp;
