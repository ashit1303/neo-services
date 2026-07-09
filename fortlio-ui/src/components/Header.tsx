import {
  Menu,
  Sun,
  Bell,
  Search,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}

export default function Header({
  sidebarOpen,
  setSidebarOpen,
}: HeaderProps) {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [openMenu, setOpenMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (token) {
        await api.get("/auth/logout", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.log("Logout error:", err);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setUser(null);
    navigate("/login");
  };

  const initial =
    (user?.fullName || user?.email || "U")
      .charAt(0)
      .toUpperCase();

  return (
    <div
      className={`h-[70px] fixed top-0 ${
        sidebarOpen ? "left-[240px]" : "left-0"
      } right-0 bg-gray-50 border-b flex items-center justify-between px-8 z-20`}
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-5">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={25} />
        </button>

        {/* SEARCH */}
        <div className="relative">
          <div className="w-[370px] h-12 border rounded-xl flex items-center gap-3 px-4">
            <Search size={20} className="text-gray-400" />

            <input
              value={search}
              onFocus={() => setSearchActive(true)}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people, skills..."
              className="w-full outline-none"
            />
          </div>

          {searchActive && (
            <div className="absolute top-14 left-0 w-[370px] bg-white border rounded-xl shadow-lg p-4">
              {search ? (
                <p>Searching: {search}</p>
              ) : (
                <p className="text-gray-400">Start typing...</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">

        <button className="hover:bg-gray-100 p-2 rounded-xl">
          <Sun size={21} />
        </button>

        <button className="relative hover:bg-gray-100 p-2 rounded-xl">
          <Bell size={21} />
          <span className="absolute -top-1 -right-1 bg-purple-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
            4
          </span>
        </button>

        <div className="relative" ref={menuRef}>

          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-gray-100"
          >
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
              {initial}
            </div>

            <ChevronDown
              size={18}
              className={`transition ${
                openMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-3 w-80 bg-white border rounded-2xl shadow-2xl overflow-hidden z-50">

              <div className="px-5 py-4 flex gap-3 items-center">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-lg font-bold">
                  {initial}
                </div>

                <div>
                  <p className="font-semibold text-gray-800">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.email || ""}
                  </p>
                </div>
              </div>

              <hr />

              <button
                onClick={() => navigate("/settings")}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-100"
              >
                <Settings size={18} />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-red-600"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
