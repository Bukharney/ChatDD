import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import DOMPurify from "dompurify"; 
import chatData from "../../data/chatData.json";
import Folder from "../../assets/Folder";
import Camera from "../../assets/Camera";
import Send from "../../assets/Send";
import Search from "../../assets/Search";
import SearchModal from "../modal/search";

const ChatBox = ({ contact }) => {
  const [messages, setMessages] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [inputValue, setInputValue] = useState(""); 
  const bottomRef = useRef(null);
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

  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input); 
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const sanitizedMessage = sanitizeInput(inputValue); 
    const newMessage = {
      sender: "user",
      text: sanitizedMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue(""); 
  };

  const formatTimestamp = (timestamp, sender) => {
    const date = new Date(timestamp);
    const timeString = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${sender === "user" ? "You" : sender}, ${timeString}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    }
    if (
      date.getDate() === today.getDate() - 1 &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Yesterday";
    }
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const groupMessagesByDate = (messages) => {
    return messages.reduce((acc, message) => {
      const date = new Date(message.timestamp).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    }, {});
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full text-white justify-between">
      <div className="flex flex-col h-full bg-black rounded-xl shadow-lg">
        <div className="flex flex-row items-center justify-between py-3 px-4 lg:px-6 bg-black">
          <div className="flex flex-row items-center gap-2">
            <img
              src={contact.avatar || "https://via.placeholder.com/150"}
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col">
              <h2 className="text-white text-sm lg:text-base font-medium">
                {contact.name}
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
          {Object.keys(groupedMessages).map((date, dateIndex) => (
            <div key={dateIndex} className="flex flex-col mb-4">
              <div className="text-center text-gray mb-4 text-2xs lg:text-xs">
                {formatDate(groupedMessages[date][0].timestamp)}
              </div>
              {groupedMessages[date].map((message, index) => {
                const showTimestamp =
                  index === 0 ||
                  groupedMessages[date][index - 1].sender !== message.sender;
                return (
                  <div key={index} className="flex flex-col">
                    {showTimestamp && (
                      <div
                        className={`text-2xs lg:text-xs text-gray mb-2 ${
                          message.sender === "user"
                            ? "self-end text-right"
                            : "self-start text-left"
                        }`}
                      >
                        {formatTimestamp(message.timestamp, message.sender)}
                      </div>
                    )}
                    <div
                      className={`p-2 rounded-lg text-xs lg:text-sm mb-3 ${
                        message.sender === "user"
                          ? "bg-dark-gray self-end"
                          : "bg-gradient-to-r from-blue to-blue-dark self-start"
                      }`}
                    >
                      <p>{message.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="p-2 bg-black rounded-xl flex flex-row gap-3 mt-4 items-center ">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="w-full p-3 bg-black border-none outline-none rounded-xl text-white placeholder-gray focus:outline-none focus:ring-1 focus:ring-blue focus:border-transparent"
            placeholder="Type your message..."
          />
          <Folder className="cursor-pointer w-8 h-8" />
          <Camera className="cursor-pointer w-8 h-8" />
          <button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-blue to-blue-light rounded-lg p-1 flex items-center justify-center "
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