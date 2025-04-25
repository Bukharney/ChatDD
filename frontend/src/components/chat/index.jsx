import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ChatBox from "./ChatBox";
import Contacts from "./Contacts";
import Logo from "../../assets/Logo";
import { getFriends, getUser } from "../../api/api";

const Chat = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const location = useLocation();

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };
  const handleAddContact = (newContact) => {
    setContacts((prevContacts) => [...prevContacts, newContact]);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser();
        setCurrentUser(response);
        console.log("User fetched:", response);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchContacts = async () => {
      try {
        const response = await getFriends();
        setContacts(response);

        console.log("Contacts fetched:", response);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    const updateContactFromQuery = () => {
      const queryParams = new URLSearchParams(location.search);
      const id = queryParams.get("id");
      if (id) {
        const contact = contacts.find((c) => c.id === parseInt(id));
        setSelectedContact(contact);
      } else {
        setSelectedContact(null);
      }
    };

    fetchUser();
    fetchContacts();
    updateContactFromQuery();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 h-full w-full">
      <div
        className={`h-full border-r border-dark-gray ${
          selectedContact
            ? "hidden lg:block lg:col-span-1"
            : "block lg:col-span-1"
        }`}
      >
        <Contacts
          contacts={contacts}
          handleSelectContact={handleSelectContact}
          selectedContact={selectedContact}
          addContact={handleAddContact}
        />
      </div>
      <div
        className={`lg:col-span-3 ${
          selectedContact ? "block" : "hidden lg:block"
        }`}
      >
        {selectedContact ? (
          <ChatBox contact={selectedContact} currentUser={currentUser} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[80vh] w-full lg:hidden">
            <Contacts
              contacts={contacts}
              handleSelectContact={handleSelectContact}
            />
          </div>
        )}
        {!selectedContact && (
          <div className="hidden lg:flex flex-col items-center justify-center h-[80vh] w-full">
            <Logo className="w-32 h-32 mb-4" />
            <p className="text-gray text-xs lg:text-sm mt-6">
              Select a contact to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
