import React, { useState, useEffect } from 'react';
import { Camera, File, Send, Search } from '../assets/ChatBoxAsset';

const ChatBox = () => {
  const [currentContact, setCurrentContact] = useState(null);
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Sample contact data
  const contacts = [
    {
      id: 1,
      name: 'Lauren',
      lastMessage: 'Hey babe, I miss you',
      time: '11:35 PM',
      avatar: null,
      isActive: false
    },
    {
      id: 2,
      name: 'Layla',
      lastMessage: 'Babe, Where are you ?',
      time: '9:45 PM',
      avatar: null,
      isActive: true
    }
  ];

  // Sample conversations data - map of contact ID to their messages
  const conversations = {
    1: [
      {
        id: 1,
        sender: 'me',
        content: 'Hey Lauren, how are you?',
        time: '9:10 AM'
      },
      {
        id: 2,
        sender: 'other',
        content: 'Hey babe, I miss you',
        time: '11:35 PM'
      },
      {
        id: 3,
        sender: 'me',
        content: 'Aww, I miss you too! How was your day?',
        time: '11:37 PM'
      },
      {
        id: 4,
        sender: 'other',
        content: 'It was okay, just busy with work. What about you?',
        time: '11:40 PM'
      },
      {
        id: 5,
        sender: 'me',
        content: 'Same here, just had a lot of meetings. Can’t wait for the weekend!',
        time: '11:42 PM'
      },
      {
        id: 6,
        sender: 'other',
        content: 'Yeah, me too! Let’s plan something fun.',
        time: '11:45 PM'
      },
      {
        id: 7,
        sender: 'me',
        content: 'How about a movie night and dinner?',
        time: '11:47 PM'
      },
      {
        id: 8,
        sender: 'other',
        content: 'Sounds perfect! I’ll pick the movie 😆',
        time: '11:50 PM'
      },
      {
        id: 9,
        sender: 'me',
        content: 'Haha, fine! But no horror movies this time! 😅',
        time: '11:52 PM'
      },
      {
        id: 10,
        sender: 'other',
        content: 'Deal! 😂 Sleep well, love ❤️',
        time: '11:55 PM'
      },
      {
        id: 11,
        sender: 'me',
        content: 'Good night, babe ❤️',
        time: '11:56 PM'
      }
    ],
    2: [
      {
        id: 1,
        sender: 'me',
        content: 'Good morning my dear',
        time: '9:15 AM'
      },
      {
        id: 2,
        sender: 'other',
        content: 'Good morning my dear ❤️',
        time: '9:15 AM'
      },
      {
        id: 3,
        sender: 'other',
        content: "What's your plan for today?",
        time: '9:16 AM'
      },
      {
        id: 4,
        sender: 'me',
        content: 'Just work and a gym session later. What about you?',
        time: '9:18 AM'
      },
      {
        id: 5,
        sender: 'other',
        content: 'Same here. I have a few meetings and then probably some Netflix in the evening.',
        time: '9:20 AM'
      },
      {
        id: 6,
        sender: 'me',
        content: 'That sounds nice! What are you watching?',
        time: '9:22 AM'
      },
      {
        id: 7,
        sender: 'other',
        content: 'Started a new crime series, it’s so intense!',
        time: '9:24 AM'
      },
      {
        id: 8,
        sender: 'me',
        content: 'Ooo, I love crime shows! Maybe we can watch together later?',
        time: '9:26 AM'
      },
      {
        id: 9,
        sender: 'other',
        content: 'Yes, let’s do that! I’ll wait for you 😊',
        time: '9:28 AM'
      },
      {
        id: 10,
        sender: 'me',
        content: 'Yay! Alright, I need to get ready for work now. Have a great day!',
        time: '9:30 AM'
      },
      {
        id: 11,
        sender: 'other',
        content: 'You too, love! Talk later 😘',
        time: '9:32 AM'
      }
    ]
  };


  // Get messages for the current contact
  const getCurrentMessages = () => {
    if (!currentContact) return [];
    return conversations[currentContact.id] || [];
  };

  // Create avatar placeholder with initials
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSelectContact = (contact) => {
    setCurrentContact(contact);
  };

  const handleBack = () => {
    setCurrentContact(null);
  };

  // Check if should show chat instead of contacts (either on desktop or mobile with selected contact)
  const shouldShowChat = !isMobile || (isMobile && currentContact);
  const shouldShowContacts = !isMobile || (isMobile && !currentContact);

  // Handle window resize for mobile/desktop view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-full flex bg-black text-white">
      {/*Contact List Section */}
      {shouldShowContacts && (
        <div className={`${isMobile ? 'w-full' : 'w-1/3'} border-r border-dark-gray flex flex-col h-full overflow-hidden`}>
          {/* Search Input */}
          <div className="flex-none px-4 py-3">
            <div className="flex items-center bg-dark-gray rounded-full px-4 py-2">
              <Search className="w-5 h-5" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent ml-2 flex-1 outline-none text-white"
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto">
            {contacts.map(contact => (
              <div
                key={contact.id}
                className="flex items-center p-4 hover:bg-dark-gray cursor-pointer"
                onClick={() => handleSelectContact(contact)}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-dark-gray flex items-center justify-center">
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full" />
                    ) : (
                      <span>{getInitials(contact.name)}</span>
                    )}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-xs text-gray">{contact.time}</p>
                  </div>
                  <p className="text-sm text-gray truncate">{contact.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/*Chat Conversation Window */}
      {shouldShowChat && (
        <div className={`${isMobile ? 'w-full' : 'w-2/3'} flex flex-col h-full overflow-hidden`}>
          {/* Chat Header */}
          <div className="flex-none p-4 border-b border-dark-gray flex items-center">
            {isMobile && (
              <button
                onClick={handleBack}
                className="mr-3 rounded-full bg-dark-gray w-8 h-8 flex items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div className="flex items-center flex-1">
              <div className="w-8 h-8 rounded-full bg-dark-gray flex items-center justify-center mr-3">
                <span>{getInitials(currentContact?.name || 'Layla Shaw')}</span>
              </div>
              <div>
                <p className="font-medium">{currentContact?.name || 'Layla Shaw'}</p>
                <p className="text-xs text-gray">Active now</p>
              </div>
            </div>

            <button className="rounded-full bg-dark-gray w-8 h-8 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {getCurrentMessages().map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'me' ? 'flex-col items-start' : 'flex-col items-end'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl mb-2 ${msg.sender === 'me'
                    ? 'bg-blue text-white rounded-bl-none'
                    : 'bg-dark-gray text-white rounded-br-none'
                    }`}
                >
                  <p>{msg.content}</p>
                </div>
                <div className="text-xs text-gray mt-1 px-1 mb-2">
                  {msg.sender === 'me' ? `${currentContact?.name || 'Layla'}, ${msg.time}` : `you, ${msg.time}`}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex-none py-3 px-2 sm:px-3">
            <div className="flex items-center bg-dark-gray rounded-md px-2 sm:px-4 py-2.5 h-12">
              {/* Input with appropriate height */}
              <input
                type="text"
                placeholder="Write your message..."
                className="bg-transparent min-w-[60px] flex-1 outline-none text-white text-sm h-8"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              {/* Icon buttons with consistent size */}
              <div className="flex items-center gap-1 sm:gap-3 flex-none">
                <button className="flex-none hidden sm:block">
                  <File className="w-5 h-5" />
                </button>
                <button className="flex-none">
                  <Camera className="w-5 h-5" />
                </button>
                <button className="flex-none bg-gradient-to-r from-blue-kind-of-dark to-blue-dark rounded-md p-1 w-7 h-7 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;