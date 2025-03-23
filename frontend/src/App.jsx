import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";  // ใช้ Routes แทน Switch
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Chat from "./components/Chat";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />  
                <Route path="/signup" element={<SignUp />} />
                <Route path="/chat" element={<Chat />} /> 
            </Routes>
        </Router>
    );
};

export default App;
