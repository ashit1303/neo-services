import { NavLink } from "react-router-dom";
import {
  Home,
  User,
  Search,
  Users,
  Newspaper,
  Bell,
  Settings,
  HelpCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const menu = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "HR Profile", path: "/profile", icon: User },
  { name: "Candidate Profile", path: "/candidate-profile", icon: Search },
  { name: "Create Candidate Profile", path: "/create-profile", icon: Search },
  { name: "Candidate Edit Profile", path: "/edit-profile", icon: Search },
  { name: "Candidate Blogs", path: "/candidate-blogs", icon: Newspaper },
  { name: "Markdown Editor", path: "/editor", icon: Newspaper },
  { name: "Connections", path: "/connections", icon: Users },
];

export default function Sidebar() {
  const [user, setUser] = useState<any>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  return (
    <div className={`w-[240px] h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 flex flex-col fixed left-0 top-0 transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-900 text-white' 
        : 'bg-[#07142f] text-white'
    }`}>
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Neo Services
        </h1>
      </div>

      <div className="flex-1 px-4 space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-4 px-4 py-3 rounded-xl transition ${
                  isActive 
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white" 
                    : isDark
                      ? "hover:bg-white/10 text-gray-300 hover:text-white"
                      : "hover:bg-white/10 text-gray-300 hover:text-white"
                }`
              }
            >
              <Icon size={22} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        <div className="mt-5 space-y-2">
          <hr className={isDark ? 'border-gray-700' : 'border-white/20'} />

          <NavLink
            to="/settings"
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-3 rounded-xl ${
                isActive 
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white" 
                  : isDark
                    ? "hover:bg-white/10 text-gray-300 hover:text-white"
                    : "hover:bg-white/10 text-gray-300 hover:text-white"
              }`
            }
          >
            <Settings size={22} />
            <span>Settings</span>
          </NavLink>

          <NavLink
            to="/help"
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-3 rounded-xl ${
                isActive 
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white" 
                  : isDark
                    ? "hover:bg-white/10 text-gray-300 hover:text-white"
                    : "hover:bg-white/10 text-gray-300 hover:text-white"
              }`
            }
          >
            <HelpCircle size={22} />
            <span>Help & Support</span>
          </NavLink>
        </div>
      </div>

      <div className="mx-6 mb-5 pt-12">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold">
            {(user?.fullName || user?.email || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="overflow-hidden">
            <p className="font-semibold truncate">
              {user?.fullName}
            </p>

            <p className="text-sm text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}