import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/api";

const SignOutModal = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login");
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000000] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-custom-bg-gray border border-border-gray rounded-xl p-6 max-w-sm w-full mx-8 px-14 py-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl lg:text-base font-bold">
            Sign Out
          </h2>
        </div>
        <div className="text-white text-sm lg:text-base mb-4">
          Are you sure to sign out?
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className={`bg-gradient-to-r from-yellow to-brown text-black font-bold rounded-lg p-3 w-full text-sm lg:text-base flex justify-center items-center ${
              isLoading ? "opacity-50 cursor-not-allowed" : "opacity-100"
            }`}
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
                <span className="text-white">Signing out...</span>
              </>
            ) : (
              "Confirm"
            )}
          </button>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-light to-blue text-black font-bold rounded-lg p-3 w-full text-sm lg:text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOutModal;
