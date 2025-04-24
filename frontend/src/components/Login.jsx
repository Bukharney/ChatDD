import React, { useState } from "react";
import Logo from "../assets/Logo";
import { Link, useNavigate } from "react-router-dom";
import { EyeOn, EyeOff } from "../assets/Visibility";
import { LoginBG } from "../assets/LoginBG";
import { loginUser } from "../api/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Login user
      const loginResponse = await loginUser({
        username: email,
        password: password,
      });

      console.log("Login successful:", loginResponse);

      // Explicitly store token in localStorage
      // if (loginResponse && loginResponse.token) {
      //   localStorage.setItem('token', loginResponse.token);
      //   console.log("Token stored directly in Login component:", loginResponse.token);

      //   if (loginResponse.refresh_token) {
      //     localStorage.setItem('refreshToken', loginResponse.refresh_token);
      //   }

      //   // Create a basic user object if none exists
      //   const basicUserData = {
      //     username: email,
      //     email: email,
      //     public_key: localStorage.getItem('publicKey') || ""
      //   };

      //   localStorage.setItem('user', JSON.stringify(basicUserData));
      //   console.log("Basic user data stored:", basicUserData);
      // }

      // // Get Encrypted Private Key from Browser Storage
      // const { encryptedPrivateKey, salt } = await getEncryptedPrivateKey();

      // if (!encryptedPrivateKey) {
      //   setErrorMessage("No private key found for this user.");
      //   return;
      // }

      // // Decrypt Private Key using Password
      // const privateKey = await decryptPrivateKey(
      //   encryptedPrivateKey,
      //   salt,
      //   password
      // );

      // if (!privateKey) {
      //   throw new Error("Private key is invalid.");
      // }

      // setPrivateKey(privateKey);

      // Navigate to chat page after successful login
      navigate("/chat");
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Invalid email or password. Please try again.");
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
            disabled={isLoading}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-light to-dark-teal text-black font-bold hover:to-blue-light hover:to-blue-light hover:font-medium rounded-md transition duration-200 flex items-center justify-center"
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
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
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
