import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Chat from "./components/chat/index";
import ChatBox from "./components/chat/ChatBox"; // Import ChatBox
import Logout from "./components/Logout";
import Profile from "./components/Profile";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<SignUp />} />

      <Route path="/" element={<Layout />}>
        <Route path="profile" element={<Profile />} />
        <Route path="chat" element={<Chat />} /> 
        <Route path="chat/:id" element={<ChatBox />} /> 
        <Route path="logout" element={<Logout />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;