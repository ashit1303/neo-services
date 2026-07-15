// components/Navbar.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Briefcase, Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  // Get system preference
  const getSystemTheme = (): "light" | "dark" => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return "dark";
    }
    return "light";
  };

  // Apply theme
  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement;
    
    if (selectedTheme === "system") {
      const systemTheme = getSystemTheme();
      if (systemTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } else if (selectedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    setTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme || "system";
    applyTheme(savedTheme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === "system") {
        const systemTheme = getSystemTheme();
        if (systemTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const getCurrentThemeIcon = () => {
    const option = themeOptions.find(opt => opt.value === theme);
    return option ? option.icon : Sun;
  };

  const CurrentIcon = getCurrentThemeIcon();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
          >
            <Briefcase className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              fortlio
            </span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <motion.a
              whileHover={{ scale: 1.05 }}
              href="#features"
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Features
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              href="#how-it-works"
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              How It Works
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              href="#testimonials"
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Testimonials
            </motion.a>
            
            {/* Theme Toggle Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30"
              >
                <CurrentIcon className="w-5 h-5" />
              </motion.button>
              
              {isThemeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = theme === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          applyTheme(option.value as Theme);
                          setIsThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                          isActive
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                        {isActive && (
                          <span className="ml-auto text-xs">✓</span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </div>

            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-purple-600 dark:text-purple-400 border-2 border-purple-600 dark:border-purple-400 rounded-full hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white dark:hover:text-white transition-all"
              >
                Login
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:shadow-lg transition-all"
              >
                Get Started
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Theme Toggle */}
            <div className="relative">
              <button
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-full"
              >
                <CurrentIcon className="w-5 h-5" />
              </button>
              
              {isThemeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = theme === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          applyTheme(option.value as Theme);
                          setIsThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                          isActive
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                        {isActive && (
                          <span className="ml-auto text-xs">✓</span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </div>
            
            <button
              className="text-gray-700 dark:text-gray-300"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4"
          >
            <div className="flex flex-col space-y-3">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                How It Works
              </a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                Testimonials
              </a>
              <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold">
                Login
              </Link>
              <Link to="/register">
                <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-full">
                  Get Started
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}