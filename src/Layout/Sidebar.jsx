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
      className={`h-screen bg-gray-800 text-white p-5 pt-8 border-r border-neutral-700 overflow-hidden transition-all duration-300`}
      style={{ width: open ? "16rem" : "4.5rem" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2
          className={`text-xl font-bold whitespace-nowrap transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          My App
        </h2>

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="p-2 bg-gray-600 rounded-full hover:bg-gray-500"
        >
          {open ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {menuItems.map((item, index) => (
          <li key={index}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition-colors duration-200
                ${isActive ? "bg-gray-700 font-semibold" : "text-gray-200"}`
              }
            >
              {item.icon}

              {open && (
                <span
                  className="whitespace-nowrap transition-opacity duration-300"
                >
                  {item.label}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
