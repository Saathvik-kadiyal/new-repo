import { ChevronLeft, ChevronRight, House, Users } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [open, setOpen] = useState(true);

  const menuItems = [
    { icon: <House size={20} />, label: "Dashboard", path: "/" },
    { icon: <Users size={20} />, label: "Employee Details", path: "/employee-details" },
    { icon: <Users size={20} />, label: "Client Summary", path: "/client-summary" },
  ];

  return (
    <nav
      className="h-screen bg-white shadow-md transition-all duration-300 p-4 overflow-hidden"
      style={{ width: open ? "10rem" : "4.5rem" }}
    >
      {/* Toggle Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setOpen(prev => !prev)}
          className="p-2 rounded-full shadow hover:bg-gray-200 transition"
        >
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Menu */}
      <ul className="flex flex-col gap-1">
        {menuItems.map((item, index) => (
          <li key={index}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition
                ${
                  isActive
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <span className="flex justify-center w-6">{item.icon}</span>

              <span
                className="whitespace-nowrap transition-all duration-300 text-[10px] font-medium"
                style={{
                  visibility: open ? "visible" : "hidden",
                  width: open ? "auto" : 0,
                }}
              >
                {item.label}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
