import { useState } from "react";
import { ArrowLeft, User, Globe } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function CreateCandidateProfile() {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const { isDark } = useTheme();

  const addSkill = () => {
    if (!skillInput.trim()) return;

    setSkills([...skills, skillInput.trim()]);
    setSkillInput("");
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-[#f7f8fc]'
    }`}>
      <div className="p-8">
        {/* HEADER */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <h1 className={`text-[40px] font-semibold transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-[#0b1633]'
          }`}>
            Create Candidate Profile
          </h1>
        </div>

        {/* CARD */}
        <div className={`rounded-3xl shadow-sm border p-10 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          {/* BASIC INFO */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
              isDark ? 'bg-purple-900/30' : 'bg-purple-100'
            }`}>
              <User className={`transition-colors duration-300 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`} size={22} />
            </div>

            <h2 className={`text-[24px] font-semibold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-[#0b1633]'
            }`}>
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-7">
            <div>
              <label className={`block mb-2 text-lg font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                Full Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter full name"
                className={`w-full h-14 border rounded-xl px-4 outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>

            <div>
              <label className={`block mb-2 text-lg font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                Email <span className="text-red-500">*</span>
              </label>

              <input
                type="email"
                placeholder="Enter email address"
                className={`w-full h-14 border rounded-xl px-4 outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>

            <div>
              <label className={`block mb-2 text-lg font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                Mobile Number
              </label>

              <input
                type="text"
                placeholder="Enter mobile number"
                className={`w-full h-14 border rounded-xl px-4 outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>

            <div>
              <label className={`block mb-2 text-lg font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                Experience (Years)
              </label>

              <input
                type="number"
                placeholder="Enter experience in years"
                className={`w-full h-14 border rounded-xl px-4 outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>
          </div>

          {/* SKILLS */}
          <div className="mt-8">
            <label className={`block mb-2 text-lg font-medium transition-colors duration-300 ${
              isDark ? 'text-gray-200' : ''
            }`}>
              Skills
            </label>

            <div className="flex gap-4">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Add a skill (e.g., React, Node.js)"
                className={`flex-1 h-14 border rounded-xl px-4 outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />

              <button
                type="button"
                onClick={addSkill}
                className={`px-8 h-14 text-[22px] border-2 rounded-xl font-medium transition-colors duration-300 ${
                  isDark 
                    ? 'border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white' 
                    : 'border-purple-500 text-purple-600 hover:bg-purple-600 hover:text-white'
                }`}
              >
                Add
              </button>
            </div>

            <p className={`text-sm mt-3 transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-400'
            }`}>
              Add your key skills. Press 'Add' or hit Enter to include.
            </p>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 rounded-xl text-lg transition-colors duration-300 ${
                      isDark 
                        ? 'bg-purple-900/30 text-purple-300' 
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DIVIDER */}
          <div className={`border-t my-10 transition-colors duration-300 ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}></div>

          {/* ONLINE PRESENCE */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
              isDark ? 'bg-purple-900/30' : 'bg-purple-100'
            }`}>
              <Globe className={`transition-colors duration-300 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`} size={20} />
            </div>

            <h2 className={`text-[24px] font-semibold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-[#0b1633]'
            }`}>
              Online Presence
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-7">
            <div>
              <label className={`block mb-2 text-lg font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                GitHub URL
              </label>

              <input
                type="text"
                placeholder="https://github.com/username"
                className={`w-full h-14 border rounded-xl px-4 outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>

            <div>
              <label className={`block mb-2 text-lg font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                LinkedIn URL
              </label>

              <input
                type="text"
                placeholder="https://linkedin.com/in/username"
                className={`w-full h-14 border rounded-xl px-4 outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>

            <div>
              <label className={`block mb-2 text-lg font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                Portfolio URL
              </label>

              <input
                type="text"
                placeholder="https://yourportfolio.com"
                className={`w-full h-14 border rounded-xl px-4 outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>

            <div>
              <label className={`block mb-2 text-lg font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                Resume URL
              </label>

              <input
                type="text"
                placeholder="https://drive.google.com/resume.pdf"
                className={`w-full h-14 border rounded-xl px-4 outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>
          </div>

          {/* BIO */}
          <div className="mt-8">
            <label className={`block mb-2 text-lg font-medium transition-colors duration-300 ${
              isDark ? 'text-gray-200' : ''
            }`}>
              Bio
            </label>

            <textarea
              rows={7}
              maxLength={2000}
              placeholder="Tell us about yourself, your experience, and what you're looking for..."
              className={`w-full border rounded-2xl px-4 py-4 resize-none outline-none transition-colors duration-300 ${
                isDark 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                  : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
              }`}
            />

            <p className={`text-lg mt-2 transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-400'
            }`}>
              0/2000 characters
            </p>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-6 mt-10">
            <button
              type="button"
              className={`flex-1 h-14 text-[22px] border rounded-xl font-medium transition-colors duration-300 ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'border-gray-300 text-gray-700 hover:bg-indigo-950 hover:text-white'
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 h-14 text-[22px] rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-indigo-950 hover:to-purple-600 transition"
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}