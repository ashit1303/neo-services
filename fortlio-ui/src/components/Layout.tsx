import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {sidebarOpen && <Sidebar />}
      
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <div 
        className={`pt-[70px] transition-all duration-300 ${
          sidebarOpen ? "ml-[240px]" : "ml-0"
        }`}
      >
        <div className={`p-6 transition-colors duration-300 ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}