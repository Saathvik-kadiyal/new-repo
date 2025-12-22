import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex h-screen">
  <Sidebar />
  <div className="flex-1 flex flex-col min-w-0 "> 
    <Navbar />
    <main className="flex-1 overflow-auto max-w-full overflow-x-hidden"> 
      <Outlet />
    </main>
  </div>
</div>

  );
};

export default Layout;
