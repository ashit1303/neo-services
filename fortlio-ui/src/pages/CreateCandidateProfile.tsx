import { useState } from "react";
import { ArrowLeft, User, Globe } from "lucide-react";

export default function CreateCandidateProfile() {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (!skillInput.trim()) return;

    setSkills([...skills, skillInput.trim()]);
    setSkillInput("");
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <div className="p-8">
        {/* HEADER */}
        <div className="flex items-center justify-center gap-4 mb-8">
            <h1 className="text-[40px] font-semibold text-[#0b1633]">
              Create Candidate Profile
            </h1>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
          {/* BASIC INFO */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <User className="text-purple-600" size={22} />
            </div>

            <h2 className="text-[24px] font-semibold text-[#0b1633]">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-7">
            <div>
              <label className="block mb-2 text-lg font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter full name"
                className="w-full h-14 border border-gray-300 rounded-xl px-4 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-lg font-medium">
                Email <span className="text-red-500">*</span>
              </label>

              <input
                type="email"
                placeholder="Enter email address"
                className="w-full h-14 border border-gray-300 rounded-xl px-4 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-lg font-medium">
                Mobile Number
              </label>

              <input
                type="text"
                placeholder="Enter mobile number"
                className="w-full h-14 border border-gray-300 rounded-xl px-4 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-lg font-medium">
                Experience (Years)
              </label>

              <input
                type="number"
                placeholder="Enter experience in years"
                className="w-full h-14 border border-gray-300 rounded-xl px-4 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* SKILLS */}
          <div className="mt-8">
            <label className="block mb-2 text-lg font-medium">Skills</label>

            <div className="flex gap-4">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Add a skill (e.g., React, Node.js)"
                className="flex-1 h-14 border border-gray-300 rounded-xl px-4 outline-none focus:border-purple-500"
              />

              <button
                type="button"
                onClick={addSkill}
                className="px-8 h-14 text-[22px] border-2 border-purple-500 text-purple-600 rounded-xl font-medium hover:bg-purple-600 hover:text-white transition"
              >
                Add
              </button>
            </div>

            <p className="text-gray-400 text-sm mt-3">
              Add your key skills. Press 'Add' or hit Enter to include.
            </p>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 rounded-xl text-lg bg-purple-100 text-purple-700"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DIVIDER */}
          <div className="border-t my-10"></div>

          {/* ONLINE PRESENCE */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Globe className="text-purple-600" size={20} />
            </div>

            <h2 className="text-[24px] font-semibold text-[#0b1633]">
              Online Presence
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-7">
            <div>
              <label className="block mb-2 text-lg font-medium">
                GitHub URL
              </label>

              <input
                type="text"
                placeholder="https://github.com/username"
                className="w-full h-14 border border-gray-300 rounded-xl px-4 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-lg font-medium">
                LinkedIn URL
              </label>

              <input
                type="text"
                placeholder="https://linkedin.com/in/username"
                className="w-full h-14 border border-gray-300 rounded-xl px-4 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-lg font-medium">
                Portfolio URL
              </label>

              <input
                type="text"
                placeholder="https://yourportfolio.com"
                className="w-full h-14 border border-gray-300 rounded-xl px-4 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-lg font-medium">
                Resume URL
              </label>

              <input
                type="text"
                placeholder="https://drive.google.com/resume.pdf"
                className="w-full h-14 border border-gray-300 rounded-xl px-4 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* BIO */}
          <div className="mt-8">
            <label className="block mb-2 text-lg font-medium">Bio</label>

            <textarea
              rows={7}
              maxLength={2000}
              placeholder="Tell us about yourself, your experience, and what you're looking for..."
              className="w-full border border-gray-300 rounded-2xl px-4 py-4 resize-none outline-none focus:border-purple-500"
            />

            <p className="text-lg text-gray-400 mt-2">0/2000 characters</p>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-6 mt-10">
            <button
              type="button"
              className="flex-1 h-14 text-[22px] border border-gray-300 rounded-xl font-medium hover:bg-indigo-950 hover:text-white transition"
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