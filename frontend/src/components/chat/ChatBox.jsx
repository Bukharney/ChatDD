import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import chatData from "../../data/chatData.json";
import Folder from "../../assets/Folder";
import Camera from "../../assets/Camera";
import Send from "../../assets/Send";
import Search from "../../assets/Search";
import SearchModal from "../modal/search";
import hkdf from "@panva/hkdf"; // Make sure to install this with `npm install @panva/hkdf`
import { generateKeyPair, encodeBase64 } from "../../utils/crypto"; // Adjust the import path as necessary
import nacl from "tweetnacl";

const ChatBox = ({ contact, currentUser }) => {
  const ws = useRef(null);
  const bottomRef = useRef(null);
  const sentPublicKey = useRef(false);
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
    };
    console.log("Generated public key:", publicKey);
    console.log("Generated private key:", secretKey);
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
        await handleKeyExchange(msg);
      } else if (msg.type === "message") {
        await handleIncomingMessage(msg);
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
      sendPublicKey();
    } else if (msg.content == "Chat ready") {
      console.log("Chat is ready to send messages.");
    }
  };

  const sendPublicKey = () => {
    ws.current.send(
      JSON.stringify({
        type: "key-exchange",
        from: currentUser.user_id,
        to: contact.id,
        public_key: encodeBase64(keypair.current.publicKey),
        salt: encodeBase64(keypair.current.salt),
      })
    );
  };

  const handleKeyExchange = async (msg) => {
    if (!msg.public_key) {
      console.error("No public key provided for key exchange.");
      sendPublicKey();
      sentPublicKey.current = true;
      return;
    }

    const peerPublicKey = decodeBase64(msg.public_key);
    console.log("Received public key:", peerPublicKey);

    if (!sentPublicKey.current) {
      ws.current.send(
        JSON.stringify({
          type: "key-exchange",
          from: currentUser.user_id,
          to: contact.id,
          public_key: encodeBase64(keypair.current.publicKey),
        })
      );
      sentPublicKey.current = true;
      return;
    } else {
      console.log("Public key already sent.");
    }

    if (sendPublicKey.current) {
      const sharedSecret = nacl.box.before(
        peerPublicKey,
        keypair.current.secretKey
      );
      // Generate or decode salt
      let salt;
      if (msg.salt) {
        salt = decodeBase64(msg.salt);
      } else {
        salt = keypair.current.salt;
      }

      console.log("Salt used for HKDF:", salt);
      // Derive AES key using HKDF-SHA256
      const aesKey = await hkdf(
        "sha256",
        sharedSecret,
        salt,
        "", // info
        32 // 256-bit AES key
      );

      keypair.current = {
        ...keypair.current,
        sharedSecret: sharedSecret,
        aesKey: aesKey,
      };

      console.log("Shared secret:", sharedSecret);
      console.log("AES key derived, ready to chat.");

      ws.current.send(
        JSON.stringify({
          type: "handshake",
          from: currentUser.user_id,
          to: contact.id,
          content: "chat-ready",
        })
      );
    }

    console.log("Chat ready.");
    setMessages((prev) => [
      ...prev,
      {
        from: currentUser.user_id,
        to: contact.id,
        content: "Chat ready.",
        type: "message",
      },
    ]);
  };

  const handleIncomingMessage = async (msg) => {
    if (!keypair.current?.aesKey) {
      console.warn("AES key not set, cannot decrypt message.");
      return;
    }

    try {
      const encryptedBytes = new Uint8Array(decodeBase64(msg.content));

      if (encryptedBytes.length < 12) {
        console.error(
          "Invalid encrypted message length (too short for nonce)."
        );
        return;
      }

      const nonce = encryptedBytes.slice(0, 12); // AES-GCM standard nonce length
      const ciphertext = encryptedBytes.slice(12);

      const aesKey = await window.crypto.subtle.importKey(
        "raw",
        keypair.current.aesKey,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: nonce,
        },
        aesKey,
        ciphertext
      );

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
      console.error("Error decrypting incoming message:", err);
    }
  };

  function decodeBase64(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
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
