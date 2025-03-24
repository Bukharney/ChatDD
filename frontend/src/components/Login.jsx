import React, { useState } from 'react';
import Logo from '../assets/Logo';
import { Link } from 'react-router-dom';
import { EyeOn, EyeOff } from '../assets/Visibility';
import { LoginBG } from '../assets/LoginBG';
import { decryptPrivateKey } from "../utils/privateKeyUtils";
import { getEncryptedPrivateKey } from "../utils/storageUtils";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [privateKey, setPrivateKey] = useState(null);

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage('Please enter username and password.');
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="h-screen bg-black flex items-center justify-center relative">
      <LoginBG className="absolute inset-0 overflow-hidden" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/3 w-8 h-8 rounded-full border border-green-400 flex items-center justify-center">
          <div className="w-5 h-5 bg-black border border-green-400 transform rotate-45"></div>
        </div>
        <div className="absolute right-1/4 top-2/3 w-8 h-8 rounded-full border border-yellow-400"></div>
        <div className="absolute left-3/4 bottom-1/3 w-8 h-8 rounded-full border border-green-400"></div>
        <div className="absolute opacity-20 w-full h-full">
          <div className="w-full h-full bg-[url('/circuit-pattern.svg')] bg-repeat"></div>
        </div>
      </div>

      {/* Login card */}
      <div className="w-full max-w-md p-8 mx-6 lg:mx-0 rounded-3xl bg-[#0f0f0f] border border-gray-800 shadow-xl relative z-10">
        <div className="flex justify-center mb-6">
          <Logo className="w-12 h-12" />
        </div>
        
        <h1 className="text-2xl font-bold text-white text-left mb-6">Login</h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white border border-gray-600 text-black focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-white border border-gray-600 text-black focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-cyan-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <EyeOn className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div className="text-right">
            <a href="#forgot-password" className="text-sm text-white hover:text-cyan-400">
              Forgot Password?
            </a>
          </div>
          
          {errorMessage && (
            <div className="text-red-500 text-sm mt-2">
              {errorMessage}
            </div>
          )}
          
          <button
            onClick={handleLogin}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-dark to-green-dark hover:from-cyan-500 hover:to-cyan-700 text-black font-medium rounded-md transition duration-200"
          >
            Sign in
          </button>
          
          <div className="text-center text-sm text-white mt-4">
            Don't have an account yet? 
            <Link to="/register" className="text-cyan-400 hover:underline ml-1">
              Register for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;