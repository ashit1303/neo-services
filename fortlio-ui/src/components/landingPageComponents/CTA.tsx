// sections/CTA.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { APP_NAME } from "../../constants/appName";

export default function CTA() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 transition-colors duration-300">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-6">
            <Sparkles className="w-12 h-12 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who found their dream jobs or hired the perfect candidates through {APP_NAME}.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all"
            >
              Learn More
            </motion.button>
          </div>
          <div className="mt-8 flex justify-center gap-8 text-white/80 text-sm">
            <span>✓ Free to Join</span>
            <span>✓ 10K+ Jobs</span>
            <span>✓ 5K+ Companies</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}