import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import DOMPurify from "dompurify"; 
import chatData from "../../data/chatData.json";
import Folder from "../../assets/Folder";
import Camera from "../../assets/Camera";
import Send from "../../assets/Send";
import Search from "../../assets/Search";
import SearchModal from "../modal/search";
import hkdf from "@panva/hkdf"; // Make sure to install this with `npm install @panva/hkdf`
import {
  generateKeyPair,
  encodeBase64,
  decodeBase64,
} from "../../utils/crypto"; // Adjust the import path as necessary
import nacl from "tweetnacl";

const ChatBox = ({ contact, currentUser }) => {
  const ws = useRef(null);
  const bottomRef = useRef(null);
  const keypair = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const contactId = queryParams.get("id");
    if (contactId) {
      const contact = chatData.find((msg) => msg.id === parseInt(contactId));
      if (contact) {
        setMessages(contact.messages);
      } else {
        setMessages([]);
      }
    } else if (contact) {
      setMessages(contact.messages);
    } else {
      setMessages([]);
    }
  }, [contact, location]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  useEffect(() => {
    const { publicKey, secretKey } = generateKeyPair();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    keypair.current = {
      publicKey: publicKey,
      secretKey: secretKey,
      aesKey: null,
      salt: salt,
      peerPublicKey: null,
      sharedSecret: null,
      sentPublicKey: false,
    };
    console.log("Generated public key:", encodeBase64(publicKey));
    console.log("Generated private key:", encodeBase64(secretKey));
  }, []);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080/ws");

    ws.current.onopen = () => {
      ws.current.send(
        JSON.stringify({
          type: "handshake",
          from: currentUser.user_id,
          to: contact.id,
          content: "request",
        })
      );
      // delay for 1 second to simulate network latency
      setTimeout(() => {}, 1000);
    };

    ws.current.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      console.log("Received message:", msg); // Already there
      console.log("Message type:", msg.type); // Add this if missing

      if (msg.type === "handshake") {
        handleHandshake(msg);
      } else if (msg.type === "key-exchange") {
        await handleKeyExchange(
          msg,
          ws.current,
          keypair.current,
          contact,
          currentUser,
          setMessages
        );
      } else if (msg.type === "message") {
        await handleIncomingMessage(msg, keypair.current, setMessages);
      }
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const handleHandshake = (msg) => {
    if (msg.content === "request") {
      ws.current.send(
        JSON.stringify({
          type: "handshake",
          from: currentUser.user_id,
          to: contact.id,
          content: "accepted",
        })
      );
    } else if (msg.content === "accepted") {
      ws.current.send(
        JSON.stringify({
          type: "handshake",
          from: currentUser.user_id,
          to: contact.id,
          content: "key-exchange",
        })
      );
    } else if (msg.content === "key-exchange") {
      sendPublicKey(ws.current, currentUser, contact, keypair.current, true);
    } else if (msg.content == "Chat ready") {
      console.log("Chat is ready to send messages.");
    }
  };

  function sendPublicKey(ws, currentUser, contact, keypair, salt) {
    if (salt) {
      ws.send(
        JSON.stringify({
          type: "key-exchange",
          from: currentUser.user_id,
          to: contact.id,
          public_key: encodeBase64(keypair.publicKey),
          salt: encodeBase64(keypair.salt),
        })
      );
    } else {
      ws.send(
        JSON.stringify({
          type: "key-exchange",
          from: currentUser.user_id,
          to: contact.id,
          public_key: encodeBase64(keypair.publicKey),
        })
      );
    }
  }

  async function handleKeyExchange(
    msg,
    ws,
    keypair,
    contact,
    currentUser,
    setMessages
  ) {
    if (!msg.public_key) {
      console.warn(
        "Received key exchange request but no public key. Sending mine..."
      );
      if (!keypair.sentPublicKey) {
        sendPublicKey(ws, currentUser, contact, keypair, true);
        keypair.sentPublicKey = true;
      }
      return;
    }

    try {
      const peerPublicKey = decodeBase64(msg.public_key);
      keypair.peerPublicKey = peerPublicKey;

      if (!keypair.sentPublicKey) {
        sendPublicKey(ws, currentUser, contact, keypair, false);
        keypair.sentPublicKey = true;
      }

      if (keypair.peerPublicKey && keypair.sentPublicKey) {
        console.log("Peer public key:", encodeBase64(peerPublicKey));
        console.log("Public key:", encodeBase64(keypair.publicKey));
        console.log("Private key:", encodeBase64(keypair.secretKey));
        const sharedSecret = deriveSharedSecret(
          keypair.secretKey,
          peerPublicKey
        );
        console.log("Shared secret derived:", encodeBase64(sharedSecret));

        const salt = msg.salt ? decodeBase64(msg.salt) : keypair.salt;
        console.log("Salt:", encodeBase64(salt));
        const aesKey = await hkdf("sha256", sharedSecret, salt, "", 32);

        keypair.sharedSecret = sharedSecret;
        keypair.aesKey = aesKey;

        console.log("AES key derived:", encodeBase64(aesKey));

        ws.send(
          JSON.stringify({
            type: "handshake",
            from: currentUser.user_id,
            to: contact.id,
            content: "chat-ready",
          })
        );

        console.log("Chat is ready to send messages.");

        setMessages((prev) => [
          ...prev,
          {
            from: currentUser.user_id,
            to: contact.id,
            content: "Chat ready.",
            type: "message",
          },
        ]);
      }
    } catch (err) {
      console.error("Error during key exchange:", err);
    }
  }

  async function handleIncomingMessage(msg, keypair, setMessages) {
    if (!keypair.aesKey) {
      console.warn("AES key not set. Cannot decrypt.");
      return;
    }

    try {
      const encryptedBytes = decodeBase64(msg.content);
      if (encryptedBytes.length < 12) {
        console.error("Invalid encrypted message (too short for nonce).");
        return;
      }

      const nonce = encryptedBytes.slice(0, 12);
      const ciphertext = encryptedBytes.slice(12);

      console.log("Nonce:", encodeBase64(nonce));
      console.log("Ciphertext:", encodeBase64(ciphertext));
      console.log("AES key:", encodeBase64(keypair.aesKey));

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keypair.aesKey,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      console.log("Crypto key imported:", cryptoKey);
      console.log("Decrypting message...");

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: nonce },
        cryptoKey,
        ciphertext
      );

      console.log("Decrypted buffer:", decryptedBuffer);

      const decryptedText = new TextDecoder().decode(decryptedBuffer);
      setMessages((prev) => [
        ...prev,
        {
          from: msg.from,
          to: msg.to,
          content: decryptedText,
          type: "message",
        },
      ]);
    } catch (err) {
      console.error("Failed to decrypt message:", err);
    }
  }

  const formatTimestamp = (timestamp, sender) => {
    const date = new Date(timestamp);
    const timeString = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${sender === contact.id ? contact.username : "You"}, ${timeString}`;
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  function deriveSharedSecret(privateKey, peerPublicKey) {
    return nacl.scalarMult(privateKey, peerPublicKey);
  }

  const sendMessage = () => {
    if (inputMessage.trim() === "") return;

    const newMessage = {
      from: currentUser.user_id,
      to: contact.id,
      type: "text",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    ws.current.send(JSON.stringify(newMessage));
    setInputMessage("");
  };

  return (
    <div className="flex flex-col h-full text-white justify-between">
      <div className="flex flex-col h-full bg-black rounded-xl shadow-lg">
        <div className="flex flex-row items-center justify-between py-3 px-4 lg:px-6 bg-black">
          <div className="flex flex-row items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-dark-gray flex items-center justify-center">
              {contact.avatar ? (
                <img
                  src={contact.avatar}
                  alt={contact.username}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <span>{getInitials(contact.username)}</span>
              )}
            </div>

            <div className="flex flex-col">
              <h2 className="text-white text-sm lg:text-base font-medium">
                {contact.username}
              </h2>
              <p className="text-gray text-2xs lg:text-xs">Online</p>
            </div>
          </div>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="rounded-lg p-1 flex items-center justify-center border-[1px] border-dark-gray"
          >
            <Search className="cursor-pointer w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="p-4 lg:p-6 text-xs lg:text-sm">
        <div className="flex-1 max-h-[calc(100vh-14.75rem)] min-h-[calc(100vh-14.75rem)] lg:max-h-[calc(100vh-17rem)] lg:min-h-[calc(100vh-17rem)] overflow-y-auto scrollbar-hide flex flex-col">
          {messages.map((message, index) => {
            const showTimestamp =
              index === 0 || messages[index - 1].from !== message.from;
            return (
              <div key={index} className="flex flex-col">
                {showTimestamp && (
                  <div
                    className={`text-2xs lg:text-xs text-gray mb-2 ${
                      message.from !== contact.id
                        ? "self-end text-right"
                        : "self-start text-left"
                    }`}
                  >
                    {formatTimestamp(message.timestamp, message.from)}
                  </div>
                )}
                <div
                  className={`p-2 rounded-lg text-xs lg:text-sm mb-3 ${
                    message.from !== contact.id
                      ? "bg-dark-gray self-end"
                      : "bg-gradient-to-r from-blue to-blue-dark self-start"
                  }`}
                >
                  <p>{message.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="p-2 bg-black rounded-xl flex flex-row gap-3 mt-4 items-center ">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="w-full p-3 bg-black border-none outline-none rounded-xl text-white placeholder-gray focus:outline-none focus:ring-1 focus:ring-blue focus:border-transparent"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <Folder className="cursor-pointer w-8 h-8" />
          <Camera className="cursor-pointer w-8 h-8" />
          <button
            onClick={sendMessage}
            className="bg-gradient-to-r from-blue to-blue-light rounded-lg p-1 flex items-center justify-center"
          >
            <Send className="cursor-pointer w-6 h-6" />
          </button>
        </div>
      </div>
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default ChatBox;
