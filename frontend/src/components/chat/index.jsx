import React from "react";
import ChatBox from "./ChatBox";
import People from "./People";

const Chat = () => {
  return (
    <div className="grid gird-cols-1 lg:grid-cols-4 h-full w-full">
      <div className="hidden lg:block lg:col-span-1 h-full border-r border-dark-gray">
        <People />
      </div>
      <div className="lg:col-span-3">
        <ChatBox />
      </div>
    </div>
  );
};

export default Chat;