import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  Calendar,
  Tag,
  User,
  Code2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

export default function CandidateProfile() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const candidate = {
    _id: "1",
    fullName: "Full Name",
    email: "example@gmail.com",
    mobile: "1234567890",
    experience: 2,

    skills: [
      "React",
      "Node.js",
      "JavaScript",
      "MongoDB",
    ],

    github: "https://github.com",
    linkedin: "https://linkedin.com/in",
    portfolio: "https://portfolio",
    resume: "https://resume.pdf",
    bio: `Write down bio`,
  };

  const initials =
    candidate.fullName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase();

  return (
    <div className={`min-h-screen transition-colors duration-300 p-8 ${
      isDark ? 'bg-gray-900' : 'bg-[#f7f8fc]'
    }`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-5">    
          <h1 className={`text-[40px] font-semibold transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-[#0f172a]'
          }`}>
            Candidate Profile
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/create-profile")}
            className={`h-12 px-6 text-lg rounded-xl border font-semibold transition-all duration-300 ${
              isDark 
                ? 'border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white' 
                : 'border-purple-500 text-purple-600 hover:bg-purple-700 hover:text-white'
            }`}
          >
            + Create Profile
          </button>

          <button
            onClick={() => navigate(`/edit-profile`)}
            className={`h-12 px-6 text-lg rounded-xl border font-semibold transition-all duration-300 ${
              isDark 
                ? 'border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white' 
                : 'border-purple-500 text-purple-600 hover:bg-purple-700 hover:text-white'
            }`}
          >
            Edit Profile
          </button>

          <button className={`h-12 px-6 text-lg rounded-xl border font-semibold flex items-center gap-2 transition-all duration-300 ${
            isDark 
              ? 'border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white' 
              : 'border-purple-500 text-purple-600 hover:bg-purple-700 hover:text-white'
          }`}>
            <Download size={18} />
            Download Resume
          </button>
        </div>
      </div>

      {/* Top Profile Card */}
      <div className={`rounded-3xl p-8 shadow-sm mb-6 transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      } border`}>
        <div className="flex items-center gap-10">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-colors duration-300 ${
            isDark ? 'bg-purple-900/30' : 'bg-purple-100'
          }`}>
            <span className={`text-[40px] font-semibold transition-colors duration-300 ${
              isDark ? 'text-purple-300' : 'text-[#24196b]'
            }`}>
              {initials}
            </span>
          </div>

          <div className="flex-1">
            <h2 className={`text-[40px] font-semibold mb-6 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-[#0f172a]'
            }`}>
              {candidate.fullName}
            </h2>

            <div className="flex flex-wrap gap-10">
              <div className={`flex items-center gap-3 transition-colors duration-300 ${
                isDark ? 'text-gray-300' : ''
              }`}>
                <Mail size={22} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                <span>{candidate.email}</span>
              </div>

              <div className={`flex items-center gap-3 transition-colors duration-300 ${
                isDark ? 'text-gray-300' : ''
              }`}>
                <Phone size={22} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                <span>{candidate.mobile}</span>
              </div>

              <div className={`flex items-center gap-3 transition-colors duration-300 ${
                isDark ? 'text-gray-300' : ''
              }`}>
                <Calendar size={22} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                <span>{candidate.experience} Years of Experience</span>
              </div>

              <div className={`flex items-center gap-3 transition-colors duration-300 ${
                isDark ? 'text-gray-300' : ''
              }`}>
                <Tag size={22} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                <span>{candidate.skills.length} Skills</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className={`rounded-3xl border shadow-sm p-6 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-3 mb-8">
            <User
              className={`transition-colors duration-300 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`}
              size={24}
            />
            <h3 className={`text-2xl font-semibold transition-colors duration-300 ${
              isDark ? 'text-white' : ''
            }`}>
              Basic Information
            </h3>
          </div>

          <div className="space-y-6">
            <div className={`grid grid-cols-[220px_20px_1fr] transition-colors duration-300 ${
              isDark ? 'text-gray-300' : ''
            }`}>
              <span className={`font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-700'
              }`}>
                Full Name
              </span>
              <span>:</span>
              <span>{candidate.fullName}</span>
            </div>

            <div className={`grid grid-cols-[220px_20px_1fr] transition-colors duration-300 ${
              isDark ? 'text-gray-300' : ''
            }`}>
              <span className={`font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-700'
              }`}>
                Email
              </span>
              <span>:</span>
              <span>{candidate.email}</span>
            </div>

            <div className={`grid grid-cols-[220px_20px_1fr] transition-colors duration-300 ${
              isDark ? 'text-gray-300' : ''
            }`}>
              <span className={`font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-700'
              }`}>
                Mobile Number
              </span>
              <span>:</span>
              <span>{candidate.mobile}</span>
            </div>

            <div className={`grid grid-cols-[220px_20px_1fr] transition-colors duration-300 ${
              isDark ? 'text-gray-300' : ''
            }`}>
              <span className={`font-medium transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-700'
              }`}>
                Experience (Years)
              </span>
              <span>:</span>
              <span>{candidate.experience}</span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className={`rounded-3xl border shadow-sm p-6 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-3 mb-8">
            <Code2
              className={`transition-colors duration-300 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`}
              size={24}
            />
            <h3 className={`text-2xl font-semibold transition-colors duration-300 ${
              isDark ? 'text-white' : ''
            }`}>
              Skills
            </h3>
          </div>

          <div className="flex flex-wrap gap-4">
            {candidate.skills.map((skill) => (
              <div
                key={skill}
                className={`px-5 py-3 rounded-xl font-medium transition-colors duration-300 ${
                  isDark 
                    ? 'bg-purple-900/30 text-purple-300' 
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Online Presence */}
        <div className={`col-span-2 rounded-3xl border shadow-sm p-6 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
              isDark ? 'bg-purple-900/30' : 'bg-purple-100'
            }`}>
              <span className={`text-xl transition-colors duration-300 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`}>
                🌐
              </span>
            </div>

            <h3 className={`text-2xl font-semibold transition-colors duration-300 ${
              isDark ? 'text-white' : ''
            }`}>
              Online Presence
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <p className={`font-semibold mb-2 transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  GitHub URL
                </p>

                <a
                  href={candidate.github}
                  target="_blank"
                  rel="noreferrer"
                  className={`transition-colors duration-300 ${
                    isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'
                  } hover:underline`}
                >
                  {candidate.github}
                </a>
              </div>

              <div>
                <p className={`font-semibold mb-2 transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Portfolio URL
                </p>

                <a
                  href={candidate.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className={`transition-colors duration-300 ${
                    isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'
                  } hover:underline`}
                >
                  {candidate.portfolio}
                </a>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <p className={`font-semibold mb-2 transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  LinkedIn URL
                </p>

                <a
                  href={candidate.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className={`transition-colors duration-300 ${
                    isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'
                  } hover:underline`}
                >
                  {candidate.linkedin}
                </a>
              </div>

              <div>
                <p className={`font-semibold mb-2 transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Resume URL
                </p>

                <a
                  href={candidate.resume}
                  target="_blank"
                  rel="noreferrer"
                  className={`transition-colors duration-300 ${
                    isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'
                  } hover:underline`}
                >
                  {candidate.resume}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className={`col-span-2 rounded-3xl border shadow-sm p-6 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <User
              className={`transition-colors duration-300 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`}
              size={24}
            />
            <h3 className={`text-2xl font-semibold transition-colors duration-300 ${
              isDark ? 'text-white' : ''
            }`}>
              Bio
            </h3>
          </div>

          <div className={`border-t pt-6 transition-colors duration-300 ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <p className={`leading-8 text-[16px] transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {candidate.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}