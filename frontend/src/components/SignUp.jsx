import React, { useState } from "react";
import Logo from "../assets/Logo";
import { Link } from "react-router-dom";
import { LoginBG } from "../assets/LoginBG";
import { EyeOn, EyeOff } from "../assets/Visibility";
import { generateKeyPair } from "../utils/generateKeyPairUtils";
import { encryptPrivateKey } from "../utils/privateKeyUtils";
import { saveEncryptedPrivateKey } from "../utils/storageUtils";
import { savePublicKey } from "../utils/publicKeyUtils";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
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

    // Generate Key Pair (Public and Private Keys)
    try {
      const keyPair = await generateKeyPair();
      const { publicKey, privateKey } = keyPair;

      console.log("Password:", password);
      console.log("Public Key:", publicKey);
      console.log("Private Key:", privateKey);

      // Encrypt Private Key with Password
      const { encryptedPrivateKey, salt } = await encryptPrivateKey(
        privateKey,
        password
      );

      console.log("Encrypted Private Key:", encryptedPrivateKey);
      console.log("Salt:", salt);

      // Save Public Key to server database
      await savePublicKey(publicKey);

      // Save the encrypted private key in browser storage
      await saveEncryptedPrivateKey(encryptedPrivateKey, salt);

      alert("Sign Up successful! You can now log in.");

      // Could redirect to login page here
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("Error generating keys or encrypting private key.");
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
      {/* Signup card */}
      <div className="w-full max-w-md p-8 mx-6 lg:mx-0 rounded-3xl bg-black border-2 border-dark-gray shadow-xl relative z-10">
        <div className="flex justify-center mb-6">
          <Logo className="w-12 h-12 lg:h-16 lg:w-16" />
        </div>

        <h1 className="text-xl lg:text-2xl font-semibold text-white text-left mb-6">
          Sign Up
        </h1>

        <div className="space-y-4">
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
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-light to-blue text-white hover:from-blue hover:to-blue-darker font-medium rounded-md transition duration-200 flex items-center justify-center"
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
