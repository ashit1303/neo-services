import {
  Search,
  Plus,
  Calendar,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PenSquare,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function CandidateBlogs() {
  const { isDark } = useTheme();

  const blogs = [
    {
      id: 1,
      title: "Understanding Cloud Architecture",
      description:
        "A comprehensive guide to cloud architecture principles, best practices, and modern cloud solutions.",
      status: "Published",
      date: "May 15, 2024",
      tags: ["Cloud", "AWS", "DevOps", "Architecture"],
    },
    {
      id: 2,
      title: "Building Scalable React Applications",
      description:
        "Best practices and architecture patterns for building large-scale React applications.",
      status: "Published",
      date: "May 10, 2024",
      tags: ["React", "JavaScript", "Web Development", "Frontend"],
    },
    {
      id: 3,
      title: "TypeScript Tips and Best Practices",
      description:
        "Essential TypeScript tips that will help you write better, more maintainable code.",
      status: "Draft",
      date: "May 08, 2024",
      tags: ["TypeScript", "JavaScript", "Best Practices"],
    },
    {
      id: 4,
      title: "Getting Started with Next.js",
      description:
        "A beginner's guide to Next.js framework and building modern web applications.",
      status: "Draft",
      date: "May 05, 2024",
      tags: ["Next.js", "React", "JavaScript", "Web Development"],
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 p-8 ${
      isDark ? 'bg-gray-900' : 'bg-[#f7f8fc]'
    }`}>
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-4">
          <h1 className={`text-[40px] font-semibold transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-[#0f172a]'
          }`}>
            My Blogs
          </h1>
        </div>

        <button className="h-14 px-8 rounded-xl text-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold flex items-center gap-3 shadow-md hover:from-purple-700 hover:to-indigo-700 transition">
          <Plus size={20} />
          Create New Blog
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-10 border-b mb-6 transition-colors duration-300 ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <button className={`pb-4 border-b-2 font-semibold transition-colors duration-300 ${
          isDark 
            ? 'border-purple-400 text-purple-400' 
            : 'border-purple-600 text-purple-600'
        }`}>
          All Blogs
        </button>

        <button className={`pb-4 font-medium transition-colors duration-300 ${
          isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
        }`}>
          Published
        </button>

        <button className={`pb-4 font-medium transition-colors duration-300 ${
          isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
        }`}>
          Drafts
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search
            size={20}
            className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-400'
            }`}
          />

          <input
            placeholder="Search blogs by title, content or keywords..."
            className={`w-full h-14 rounded-xl border px-5 outline-none transition-colors duration-300 ${
              isDark 
                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                : 'border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
            }`}
          />
        </div>

        <button className={`w-[190px] h-14 rounded-xl border flex items-center justify-between px-5 transition-colors duration-300 ${
          isDark 
            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        }`}>
          <span>All Status</span>
          <ChevronDown size={18} />
        </button>

        <button className={`w-[190px] h-14 rounded-xl border flex items-center justify-between px-5 transition-colors duration-300 ${
          isDark 
            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        }`}>
          <span>Latest First</span>
          <ChevronDown size={18} />
        </button>
      </div>

      {/* Blog List */}
      <div className="space-y-4">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className={`rounded-2xl border p-6 transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between">
              {/* Left */}
              <div className="flex-1 pr-10">
                <h2 className={`text-[28px] font-semibold mb-2 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-[#0f172a]'
                }`}>
                  {blog.title}
                </h2>

                <p className={`text-lg leading-8 mb-5 max-w-[900px] transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {blog.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                        isDark 
                          ? 'bg-purple-900/30 text-purple-300' 
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div className={`w-[230px] border-l pl-6 flex flex-col gap-5 transition-colors duration-300 ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <span
                  className={`w-fit px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-300 ${
                    blog.status === "Published"
                      ? isDark 
                        ? 'bg-green-900/30 text-green-300' 
                        : 'bg-green-100 text-green-700'
                      : isDark
                        ? 'bg-orange-900/30 text-orange-300'
                        : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {blog.status}
                </span>
                
                <div className={`flex items-center gap-3 transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <Calendar size={18} />
                  <span>{blog.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8 gap-3">
        <button className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors duration-300 ${
          isDark 
            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        }`}>
          <ChevronLeft />
        </button>

        <button className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold">
          1
        </button>

        <button className={`w-12 h-12 rounded-xl border font-semibold transition-colors duration-300 ${
          isDark 
            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        }`}>
          2
        </button>

        <button className={`w-12 h-12 rounded-xl border font-semibold transition-colors duration-300 ${
          isDark 
            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        }`}>
          3
        </button>

        <button className={`w-12 h-12 rounded-xl border font-semibold transition-colors duration-300 ${
          isDark 
            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        }`}>
          ...
        </button>

        <button className={`w-12 h-12 rounded-xl border font-semibold transition-colors duration-300 ${
          isDark 
            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        }`}>
          5
        </button>

        <button className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors duration-300 ${
          isDark 
            ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        }`}>
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}