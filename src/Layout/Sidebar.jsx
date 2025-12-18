import { Home, NotebookPen, User } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <nav
        className="h-screen bg-indigo-900  shadow-md transition-all duration-300 p-4 overflow-hidden left-0 top-0 z-50"
        style={{ width: "4.5rem" }}
      >
        <div className="flex justify-end mb-6 "></div>

        <ul className="flex flex-col gap-1">
          <li>
            <NavLink
              to={"/"}
              // onClick={() => setPanelOpen((prev) => !prev)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition
                  ${
                    isActive
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-white hover:bg-indigo-400"
                  }`
              }
            >
              <span className="flex justify-center w-6 ">
                <Home size={20} />
              </span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to={"/shift-allowance"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition
                  ${
                    isActive
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-white hover:bg-indigo-400"
                  }`
              }
            >
              <span className="flex justify-center w-6 ">
                <User size={20} />
              </span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to={"/client-summary"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition
                  ${
                    isActive
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-white hover:bg-indigo-400"
                  }`
              }
            >
              <span className="flex justify-center w-6 ">
                <NotebookPen size={20} />
              </span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div
        className={`
          fixed top-0 left-18 h-screen bg-white p-4 shadow-xl z-1 mt-10
          transition-transform duration-300
          ${panelOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ width: "12rem" }}
      >
        <ul className="flex flex-col gap-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-2 py-2 rounded-lg transition 
              ${
                isActive
                  ? "text-white bg-indigo-800"
                  : "text-indigo-800 hover:text-blue-200"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/comparison"
            className={({ isActive }) =>
              `px-2 py-2 rounded-lg transition 
              ${
                isActive
                  ? "text-white bg-indigo-800"
                  : "text-indigo-800 hover:text-blue-200"
              }`
            }
          >
            Comparison
          </NavLink>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
