import React, { useState } from "react";

const ChangePasswordModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  
  const [error, setError] = useState(null);

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("New passwords do not match");
      return;
    }
    
    setError(null);
    onSubmit(passwordForm);
  };

  const handleClose = () => {
    setPasswordForm({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-custom-bg-gray border border-border-gray rounded-xl p-6 max-w-md w-full mx-8">
        <h2 className="text-xl font-bold mb-6">Change Password</h2>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray mb-1">
              Current Password
            </label>
            <input
              type="password"
              name="current_password"
              value={passwordForm.current_password}
              onChange={handlePasswordFormChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray mb-1">
              New Password
            </label>
            <input
              type="password"
              name="new_password"
              value={passwordForm.new_password}
              onChange={handlePasswordFormChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirm_password"
              value={passwordForm.confirm_password}
              onChange={handlePasswordFormChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
            />
          </div>
          
          <div className="pt-4 flex space-x-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue to-blue-light text-black px-4 py-2 rounded-lg"
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;