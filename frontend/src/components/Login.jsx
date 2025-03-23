import { useState } from "react";
import { decryptPrivateKey } from "../utils/privateKeyUtils";
import { getEncryptedPrivateKey } from "../utils/storageUtils";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [privateKey, setPrivateKey] = useState(null);

    const handleLogin = async () => {
        if (!username || !password) {
            setErrorMessage("Please enter username and password.");
            return;
        }
    
        // Get Encrypted Private Key from Browser Storage
        const { encryptedPrivateKey, salt } = await getEncryptedPrivateKey();
    
        console.log("encryptedPrivateKey:", encryptedPrivateKey);
        console.log("password:", password);
        console.log("salt:", salt);
    
        if (!encryptedPrivateKey) {
            setErrorMessage("No private key found for this user.");
            return;
        }
    
        // Decrypt Private Key using Password
        try {
            const privateKey = await decryptPrivateKey(encryptedPrivateKey, salt, password);

            console.log("privateKey:", privateKey);
    
            if (!privateKey) {
                throw new Error("Private key is invalid.");
            }
    
            setPrivateKey(privateKey);
            alert("Login Successful!");
        } catch (error) {
            console.error("Decryption failed:", error);
            setErrorMessage("Invalid password or decryption failed.");
        }
    };
    

    return (
        <div>
            <h2>Login</h2>
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
            <button onClick={handleLogin}>Login</button>
            <br />
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </div>
    );
};

export default Login;
