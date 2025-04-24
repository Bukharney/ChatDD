import React, { useState } from "react";
import Logo from "../assets/Logo";
import { Link, useNavigate } from "react-router-dom";
import { LoginBG } from "../assets/LoginBG";
import { EyeOn, EyeOff } from "../assets/Visibility";
import { generateKeyPair } from "../utils/generateKeyPairUtils";
import { encryptPrivateKey } from "../utils/privateKeyUtils";
import { saveEncryptedPrivateKey } from "../utils/storageUtils";
import { savePublicKey } from "../utils/publicKeyUtils";
import { createUser } from "../api/api";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,}$/;
    if (!usernameRegex.test(username)) {
      setErrorMessage("Username must be at least 3 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-])[A-Za-z\d-]{6,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMessage(
        "Password must be 6+ characters with uppercase, lowercase, number, and '-'"
      );
      return;
    }

    if (!username || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // IMPORTANT: Make email the same as username to work around backend issue
      // The backend tries to log in with username but looks up by email
      const emailToUse = username;

      // Create user with minimal required data
      const userData = {
        username,
        email: emailToUse, // Use username as email to work around backend issue
        password,
      };

      console.log("Sending registration data:", userData);

      // Create the user account
      const response = await createUser(userData);
      console.log("Registration successful:", response);

      // Generate Key Pair (Public and Private Keys)
      const keyPair = await generateKeyPair();
      const { publicKey, privateKey } = keyPair;

      // Encrypt Private Key with Password
      const { encryptedPrivateKey, salt } = await encryptPrivateKey(
        privateKey,
        password
      );

      // Save Public Key to local storage
      await savePublicKey(publicKey);

      // Save the encrypted private key in browser storage
      await saveEncryptedPrivateKey(encryptedPrivateKey, salt);

      // Navigate directly to the chat page instead of login
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);

      // Extract error message from the API response if available
      if (error.response) {
        console.log("Error response status:", error.response.status);
        console.log("Error response data:", error.response.data);

        if (error.response.data && error.response.data.error) {
          setErrorMessage(error.response.data.error);
        } else {
          setErrorMessage(
            `Error during registration (${error.response.status}). Please try again.`
          );
        }
      } else if (error.request) {
        console.log("Error request:", error.request);
        setErrorMessage("No response received from server. Please try again.");
      } else {
        setErrorMessage("Error during registration. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
          Sign Up
        </h1>

        <div className="space-y-4 last:space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-xs lg:text-sm font-medium text-white mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white border border-gray text-black focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent text-sm lg:text-base"
            />
          </div>
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-light"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <EyeOn className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs lg:text-sm font-medium text-white mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-white border border-gray text-black focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent text-sm lg:text-base"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="text-red-500 text-xs lg:text-sm mt-2">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleSignUp}
            disabled={isLoading}
            className=" w-full py-2 px-4 bg-gradient-to-r from-blue-light to-dark-teal text-black font-bold hover:from-blue-light hover:to-blue-light font-medium rounded-md transition duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>

          <div className="text-center text-2xs lg:text-xs text-white mt-4">
            Already have an account?
            <Link to="/login" className="text-blue-light hover:underline ml-1">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
