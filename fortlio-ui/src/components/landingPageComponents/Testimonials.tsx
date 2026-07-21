// sections/Testimonials.tsx
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { APP_NAME } from "../../constants/appName";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Software Engineer",
    company: "Google",
    image: "https://i.pravatar.cc/150?img=1",
    text: `${APP_NAME} helped me find my dream job at Google. The platform is intuitive and the job recommendations were spot on!`,
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "HR Director",
    company: "Microsoft",
    image: "https://i.pravatar.cc/150?img=2",
    text: `We've hired 50+ amazing candidates through ${APP_NAME}. The quality of applicants is outstanding and the process is seamless.`,
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Product Manager",
    company: "Amazon",
    image: "https://i.pravatar.cc/150?img=3",
    text: `The networking opportunities on ${APP_NAME} are incredible. I've connected with industry leaders and landed my dream role.`,
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-4 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            What Our{" "}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Users Say
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real stories from real people who transformed their careers with {APP_NAME}.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl shadow-lg relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-purple-300 dark:text-purple-600 opacity-50" />
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-purple-400 dark:border-purple-500"
                />
                <div>
                  <h4 className="font-bold dark:text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">"{testimonial.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}