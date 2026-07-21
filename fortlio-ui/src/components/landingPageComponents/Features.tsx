// sections/Features.tsx
import { motion } from "framer-motion";
import { Search, FileText, Users, MessageSquare, Award, Clock } from "lucide-react";
import { APP_NAME } from "../../constants/appName";

const features = [
  {
    icon: Search,
    title: "Smart Job Search",
    description: "AI-powered search to find the perfect job match based on your skills and preferences.",
    color: "from-purple-500 to-indigo-500"
  },
  {
    icon: FileText,
    title: "Easy Applications",
    description: "Apply to jobs with one click using your saved profile and resume.",
    color: "from-purple-600 to-indigo-600"
  },
  {
    icon: Users,
    title: "Network Building",
    description: "Connect with industry professionals and grow your professional network.",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: MessageSquare,
    title: "Direct Messaging",
    description: "Communicate directly with HR professionals and hiring managers.",
    color: "from-purple-500 to-indigo-500"
  },
  {
    icon: Award,
    title: "Skill Verification",
    description: "Showcase your verified skills and certifications to stand out.",
    color: "from-indigo-600 to-purple-600"
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Get instant notifications about new jobs and application status.",
    color: "from-purple-500 to-indigo-500"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the features that make {APP_NAME} the ultimate platform for your career journey.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="group relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl -z-10"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}