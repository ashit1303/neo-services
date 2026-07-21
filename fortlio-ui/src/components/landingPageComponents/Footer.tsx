// sections/Footer.tsx
import { motion } from "framer-motion";
import { Briefcase, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                fortlio
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Connecting talent with opportunity. Your dream job is just a click away.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">For Job Seekers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Browse Jobs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Create Profile</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Career Resources</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Job Alerts</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">For Employers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Post a Job</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Search Candidates</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Employer Resources</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@jobhub.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>123 Career St, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm"
        >
          <p>&copy; 2026 fortlio. All rights reserved. Made with ❤️ for your career success.</p>
        </motion.div>
      </div>
    </footer>
  );
}