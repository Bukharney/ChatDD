import { useState } from 'react';
import Search from '../../assets/Search';

const AddContact = ({ onClose, onConfirm }) => {
  const [isProfileSelected, setIsProfileSelected] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    
    if (e.target.value.length > 0) {
      setIsProfileSelected(true);
    } else {
      setIsProfileSelected(false);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onConfirm(searchValue);
    } catch (error) {
      console.error("Adding contact failed:", error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000000] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-custom-bg-gray border border-border-gray rounded-xl p-6 max-w-sm w-full mx-8 px-14 py-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl lg:text-base font-bold">Add Contact</h2>
        </div>
        
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={handleSearch}
            className="w-full py-3 px-4 bg-gray-800 text-black rounded-lg focus:outline-none border border-border-gray text-sm lg:text-base"
          />
          <div className="absolute right-3 top-3.5 text-gray-400">
            <Search size={20} />
          </div>
        </div>
        
        {isProfileSelected && (
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-700 border-2 border-yellow flex items-center justify-center mb-2">
              <span className="text-white text-xl">{searchValue.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-white text-sm lg:text-base">{searchValue}</span>
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          {isProfileSelected && (
            <button 
              onClick={handleConfirm}
              disabled={isLoading}
              className={`bg-gradient-to-r from-blue to-blue-darkest text-white font-bold rounded-lg p-3 w-full text-sm lg:text-base flex justify-center items-center ${
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
                  <span className="text-white">Adding contact...</span>
                </>
              ) : (
                "Confirm"
              )}
            </button>
          )}
          
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

export default AddContact;