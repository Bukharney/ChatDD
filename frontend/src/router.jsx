import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Chat from "./components/Chat";
import Logout from "./components/Logout";
import Profile from "./components/Profile";

const AppRouter = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="profile" element={<Profile />} />
        <Route path="chat" element={<Chat />} />
        <Route path="logout" element={<Logout />} />
      </Routes>
    </Layout>
  );
};

export default AppRouter;