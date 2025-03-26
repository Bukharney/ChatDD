import React, { useState } from "react";
import Logo from "../assets/Logo";
import { Link } from "react-router-dom";
import { EyeOn, EyeOff } from "../assets/Visibility";
import { LoginBG } from "../assets/LoginBG";
import { decryptPrivateKey } from "../utils/privateKeyUtils";
import { getEncryptedPrivateKey } from "../utils/storageUtils";
import { loginUser } from "../api/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [_, setPrivateKey] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter email and password.");
      return;
    }

    await loginUser(
      JSON.stringify({
        username: email,
        password: password,
      })
    );

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
      const privateKey = await decryptPrivateKey(
        encryptedPrivateKey,
        salt,
        password
      );

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
      <div className="w-full max-w-md p-8 mx-6 lg:mx-0 rounded-3xl bg-black border-2 border-dark-gray shadow-xl relative z-10">
        <div className="flex justify-center mb-6">
          <Logo className="w-12 h-12 lg:h-16 lg:w-16" />
        </div>

        <h1 className="text-xl lg:text-2xl font-semibold text-white text-left mb-6">
          Login
        </h1>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs lg:text-sm font-medium text-white mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white border border-gray text-black focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent text-sm lg:text-base"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs lg:text-sm font-medium text-white mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-white border border-gray text-black focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent text-sm lg:text-base"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray hover:text-blue-light"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <EyeOn className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="text-right">
            <a
              href="#forgot-password"
              className="text-2xs lg:text-xs text-white hover:text-blue-light"
            >
              Forgot Password?
            </a>
          </div>

          {errorMessage && (
            <div className="text-red-500 text-xs lg:text-sm mt-2">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-light to-blue text-white hover:from-blue hover:to-blue-light  font-medium rounded-md transition duration-200"
          >
            Sign in
          </button>

          <div className="text-center text-2xs lg:text-xs text-white mt-4">
            Don't have an account yet?
            <Link
              to="/register"
              className="text-blue-light hover:underline ml-1"
            >
              Register for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
