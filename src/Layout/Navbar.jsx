import { useState } from "react";
import { User, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Auth } from "../utils/auth";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here (clear tokens, redirect)
    console.log("Logging out...");
    navigate("/login");
  };

  return (
    <header className="flex justify-end items-center bg-white shadow px-4 py-2 relative">
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 focus:outline-none"
        >
          {/* Lucide User icon as avatar */}
          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white">
            <User size={20} />
          </div>

          {/* Arrow down */}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 z-50">
              <button
                onClick={Auth.logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
