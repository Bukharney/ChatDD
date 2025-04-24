import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Search from "../../assets/Search";
import AddContact from "../modal/addContact";

const Contacts = ({
  contacts,
  handleSelectContact,
  selectedContact,
  addContact,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const idFromUrl = queryParams.get("id");

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  // const formatTime = (time) => {
  //   const date = new Date(time);
  //   const today = new Date();
  //   if (
  //     date.getDate() === today.getDate() &&
  //     date.getMonth() === today.getMonth() &&
  //     date.getFullYear() === today.getFullYear()
  //   ) {
  //     return date.toLocaleTimeString([], {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     });
  //   }
  //   if (
  //     date.getDate() === today.getDate() - 1 &&
  //     date.getMonth() === today.getMonth() &&
  //     date.getFullYear() === today.getFullYear()
  //   ) {
  //     return "Yesterday";
  //   }
  //   return `${date.getDate()}/${date.getMonth() + 1}`;
  // };

  const handleContactClick = (contact) => {
    handleSelectContact(contact);
    navigate(`/chat?id=${contact.id}`);
  };

  const handleAddContact = (contactName) => {
    const newContact = {
      id: Date.now().toString(),
      name: contactName,
      lastMessage: "",
      timestamp: new Date().toISOString(),
      avatar: null,
      isActive: false,
    };

    addContact(newContact);
    setShowModal(false);
  };

  return (
    <>
      <div className="border-r border-[#000000] flex flex-col h-full overflow-hidden">
        <div className="flex flex-row gap-3 px-4 py-3">
          <div className="flex items-center bg-black px-4 py-2 rounded-xl w-full focus-within:ring-1 focus-within:ring-dark-gray focus-within:border-transparent">
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent ml-2 flex-1 outline-none text-white text-xs lg:text-sm placeholder-gray"
            />
            <Search className="cursor-pointer w-6 h-6 text-white" />
          </div>
          <button
            className="bg-black rounded-lg flex items-center justify-center aspect-square h-full hover:border hover:border-dark-gray"
            onClick={() => setShowModal(true)}
          >
            <span className="text-white text-xl">+</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex items-center p-4 cursor-pointer ${
                (selectedContact && selectedContact.id === contact.id) ||
                idFromUrl === contact.id
                  ? "bg-dark-gray"
                  : "hover:bg-dark-gray hover:bg-opacity-50"
              }`}
              onClick={() => handleContactClick(contact)}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-dark-gray flex items-center justify-center">
                  {contact.avatar ? (
                    <img
                      src={contact.avatar}
                      alt={contact.username}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <span>{getInitials(contact.username)}</span>
                  )}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <p className="font-medium text-white test-xs lg:text-sm">
                    {contact.username}
                  </p>
                  {/* <p className="text-2xs lg:text-xs text-gray">
                    {formatTime(contact.timestamp)}
                  </p> */}
                </div>
                {/* <p className="text-2xs lg:text-xs text-gray truncate">
                  {contact.lastMessage}
                </p> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <AddContact
          onClose={() => setShowModal(false)}
          onConfirm={handleAddContact}
        />
      )}
    </>
  );
};

export default Contacts;
