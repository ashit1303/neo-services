// sections/HowItWorks.tsx
import { motion } from "framer-motion";
import { UserPlus, Search, CheckCircle, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up as a job seeker or HR professional in minutes.",
    color: "from-purple-500 to-indigo-500"
  },
  {
    icon: Search,
    title: "Find or Post Jobs",
    description: "Search for jobs or post openings that match your requirements.",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: CheckCircle,
    title: "Apply or Review",
    description: "Apply to jobs or review applications from qualified candidates.",
    color: "from-purple-600 to-indigo-600"
  },
  {
    icon: TrendingUp,
    title: "Get Hired or Hire",
    description: "Start your new job or find the perfect candidate for your team.",
    color: "from-indigo-600 to-purple-600"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How It{" "}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get started in 4 simple steps and transform your career journey.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-indigo-400 hidden lg:block"></div>
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-center relative z-10">
                <div className="relative inline-block">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mx-auto mb-4`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}