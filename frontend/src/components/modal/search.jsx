import React, { useState } from "react";
import Search from "../../assets/Search";

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000] bg-opacity-50 flex items-center justify-center">
      <div className="bg-custom-bg-gray rounded-xl p-4 w-[75vw] lg:w-[35vw] border-2 border-border-gray">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-sm lg:text-base font-medium">Search</h2>
          <button onClick={onClose} className="text-gray text-xl">
            &times;
          </button>
        </div>
        <form onSubmit={handleSearch} className="flex flex-row gap-3 items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full  text-xs lg:text-sm p-3 bg-black border border-border-gray rounded-xl text-white placeholder-gray focus:outline-none focus:ring-1 focus:ring-blue focus:border-transparent"
            placeholder="Type your search..."
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue to-blue-light rounded-lg p-2.5 flex items-center justify-center"
          >
            <Search className="cursor-pointer w-6 h-6 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchModal;