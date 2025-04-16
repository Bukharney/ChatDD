import React, { useState, useEffect } from "react";

const EditProfileModal = ({ isOpen, onClose, onSubmit, loading, profile }) => {
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
  });

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(editForm);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-custom-bg-gray border border-border-gray rounded-xl p-6 max-w-sm w-full mx-8">
        <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={editForm.username}
              onChange={handleEditFormChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={editForm.email}
              onChange={handleEditFormChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent"
            />
          </div>

          <div className="pt-4 flex space-x-4 justify-center">
            <button
              type="submit"
              className="bg-gradient-to-r w-full from-blue-light to-blue text-black font-bold hover:from-blue-light hover:to-blue-light px-4 py-2 rounded-lg"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gradient-to-r w-full from-yellow to-brown text-black px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;