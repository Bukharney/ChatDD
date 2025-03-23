import { useState } from "react";
import { encryptMessage } from "../utils/messageUtils"; 
import { getPublicKey } from "../utils/publicKeyUtils";

const Chat = () => {
    const [message, setMessage] = useState("");
    const [encryptedMessage, setEncryptedMessage] = useState(null);

    const handleSendMessage = async () => {
        try {
            // ใช้ข้อความและ public key (หรือ secret key) เพื่อเข้ารหัส
            const publicKey = await getPublicKey();  

            const encrypted = await encryptMessage(message, publicKey);
            setEncryptedMessage(encrypted);
            console.log("Encrypted message:", encrypted);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message"
            />
            <button onClick={handleSendMessage}>Send</button>
            <div>
                {encryptedMessage && <p>Encrypted message: {encryptedMessage}</p>}
            </div>
        </div>
    );
};

export default Chat;
