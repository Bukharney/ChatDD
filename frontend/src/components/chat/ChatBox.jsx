import React, { useState, useEffect, useRef } from "react";
import chatMessages from "../../data/chatMessages.json";
import Folder from "../../assets/Folder";
import Camera from "../../assets/Camera";
import Send from "../../assets/Send";
import Search from "../../assets/Search";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const sortedMessages = [...chatMessages].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    setMessages(sortedMessages);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      return date.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return "Today";
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
              src="https://thumbs.dreamstime.com/b/arabic-business-man-traditional-muslim-hat-placeholder-102337208.jpg"
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col">
              <h2 className="text-white text-sm lg:text-base text-medium">
                Chatbot
              </h2>
              <p className="text-gray  text-2xs lg:text-xs">Online</p>
            </div>
          </div>
          <button className=" rounded-lg p-1 flex items-center justify-center border-[1px] border-dark-gray">
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
            className="w-full p-3 bg-black border-none outline-none rounded-xl text-white placeholder-gray "
            placeholder="Type your message..."
          />
          <Folder className="cursor-pointer w-8 h-8" />
          <Camera className="cursor-pointer w-8 h-8" />
          <button className="bg-gradient-to-r from-blue to-blue-light rounded-lg p-1 flex items-center justify-center ">
            <Send className="cursor-pointer w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;