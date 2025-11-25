import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex h-screen">
  <Sidebar />
  <div className="flex-1 flex flex-col min-w-0"> {/* add min-w-0 */}
    <Navbar />
    <main className="flex-1 p-4 overflow-auto min-w-0"> {/* add min-w-0 */}
      <Outlet />
    </main>
  </div>
</div>

  );
};

export default Layout;
