// sections/Hero.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Users, Building2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold mb-6"
            >
              🚀 Find Your Dream Job Today
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Your Next Career
              </span>
              <br />
              <span className="text-gray-800 dark:text-white">Starts Here</span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Connect with top employers and find the perfect job opportunity.
              Whether you're a job seeker or an HR professional, we've got you covered.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border-2 border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 rounded-full font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all"
              >
                Learn More
              </motion.button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex gap-8"
            >
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">5K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Companies</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">95%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Animated Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              {/* Floating elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-4 -left-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg"
              >
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </motion.div>
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg"
              >
                <Building2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </motion.div>
              
              <div className="bg-gradient-to-br from-purple-400 to-indigo-400 p-1 rounded-3xl">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                      <Search className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold dark:text-white">Search Jobs</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Find your perfect match</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full"></div>
                        <div>
                          <div className="font-semibold text-sm dark:text-white">Senior Developer</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Tech Corp • Remote</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}