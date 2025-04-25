import React, { useEffect, useState } from "react";
import ChangePasswordModal from "../../src/components/modal/changePassword";
import EditProfileModal from "../../src/components/modal/editProfile";
import Pen from "../../src/assets/Pen";
import { changePassword, getUser } from "../api/api";

const Profile = () => {
  // Mock profile data
  const mockProfile = {
    username: "JohnDoe",
    email: "john.doe@example.com",
    public_key:
      "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0vz5TcHQMFTLXQRMxmGI6zhnW1RUM6f",
    avatar: null,
  };

  const [profile, setProfile] = useState(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleUpdateProfile = async (formData) => {
    setLoading(true);
    setTimeout(() => {
      const updatedProfile = { ...profile, ...formData };
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setLoading(false);
    }, 800);
  };

  const handleChangePassword = async (passwordData) => {
    setLoading(true);
    try {
      await changePassword(
        passwordData.new_password,
        passwordData.old_password
      );
      setIsChangingPassword(false);
      setSuccessMessage("Password changed successfully!");
    } catch (error) {
      setError("Error changing password. Please try again.");
      console.error("Error changing password:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      // Simulate fetching profile data
      setLoading(true);
      const resp = await getUser();
      console.log(resp);
      setProfile(resp);
      setError(resp.error || null);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  return (
    <div className="flex flex-col p-6 text-white">
      {successMessage && (
        <div className="bg-green bg-opacity-20 text-green p-4 rounded-lg mb-6">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-500 bg-opacity-20 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-dark-gray rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Profile Information</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="text-white rounded-lg"
          >
            <Pen className="inline-block" />
          </button>
        </div>

        <div className="space-y-4">
          {/* <div className="flex items-center mb-6 overflow-auto gap-x-6 p-2">
            <div className="relative  w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24">
              <div className="absolute inset-0 -m-2 rounded-full border-[3px] border-blue-light"></div>
              <img
                src={"default-avatar.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full border-[3px] border-none"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{profile?.username}</h3>
              <p className="text-gray">{profile?.email}</p>
            </div>
          </div> */}

          <div>
            <h4 className="text-sm font-medium text-gray mb-1">Username</h4>
            <p className="text-white">{profile?.username}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray mb-1">Email</h4>
            <p className="text-white">{profile?.email}</p>
          </div>
          <div className="pt-4">
            <button
              onClick={() => setIsChangingPassword(true)}
              className="bg-gradient-to-r from-yellow to-brown text-black px-4 py-2 rounded-lg"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSubmit={handleUpdateProfile}
        loading={loading}
        profile={profile}
      />

      <ChangePasswordModal
        isOpen={isChangingPassword}
        onClose={() => setIsChangingPassword(false)}
        onSubmit={handleChangePassword}
        loading={loading}
      />
    </div>
  );
};

export default Profile;
