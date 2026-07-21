import { useEffect, useState } from "react";
import { User, Globe, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useTheme } from "../contexts/ThemeContext";

interface CandidateProfile {
  fullName: string;
  email: string;
  mobile: string;
  experience: string;
  github: string;
  linkedin: string;
  portfolio: string;
  resume: string;
  bio: string;
}

export default function CandidateEditProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<CandidateProfile>({
    fullName: "",
    email: "",
    mobile: "",
    experience: "",
    github: "",
    linkedin: "",
    portfolio: "",
    resume: "",
    bio: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    fetchCandidate();
  }, []);

  const fetchCandidate = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/candidate/${id}`);

      const data = res.data;

      setProfile({
        fullName: data.fullName || "",
        email: data.email || "",
        mobile: data.mobile || "",
        experience: data.experience?.toString() || "",
        github: data.github || "",
        linkedin: data.linkedin || "",
        portfolio: data.portfolio || "",
        resume: data.resume || "",
        bio: data.bio || "",
      });

      setSkills(data.skills || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;

    if (skills.includes(skillInput.trim())) return;

    setSkills([...skills, skillInput.trim()]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/candidate/${id}`, {
        ...profile,
        skills,
      });

      alert("Profile Updated Successfully");
    } catch (error) {
      console.log(error);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-[#f7f8fc]'
      }`}>
        <div className={`text-lg font-medium transition-colors duration-300 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Loading Profile...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-[#f7f8fc]'
    }`}>
      <div className="px-10 py-8">
        {/* PAGE TITLE */}
        <div className="flex justify-center mb-8">
          <h1 className={`text-[40px] font-semibold transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-[#0f172a]'
          }`}>
            Edit Candidate Profile
          </h1>
        </div>

        <div className={`rounded-[24px] border shadow-sm p-8 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
              isDark ? 'bg-purple-900/30' : 'bg-purple-100'
            }`}>
              <User
                size={22}
                className={`transition-colors duration-300 ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`}
              />
            </div>

            <h2 className={`text-[24px] font-semibold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-[#0f172a]'
            }`}>
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className={`block text-lg font-medium mb-2 transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                Full Name <span className="text-red-500">*</span>
              </label>

              <input
                value={profile.fullName}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    fullName: e.target.value,
                  })
                }
                className={`w-full h-14 px-4 rounded-xl border outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-lg font-medium mb-2 transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                Email <span className="text-red-500">*</span>
              </label>

              <input
                value={profile.email}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    email: e.target.value,
                  })
                }
                className={`w-full h-14 px-4 rounded-xl border outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-lg font-medium mb-2 transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                Mobile Number
              </label>

              <input
                value={profile.mobile}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    mobile: e.target.value,
                  })
                }
                className={`w-full h-14 px-4 rounded-xl border outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-lg font-medium mb-2 transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                Experience (Years)
              </label>

              <input
                value={profile.experience}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    experience: e.target.value,
                  })
                }
                className={`w-full h-14 px-4 rounded-xl border outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>
          </div>

          {/* SKILLS */}
          <div className="mt-6">
            <label className={`block text-lg font-medium mb-3 transition-colors duration-300 ${
              isDark ? 'text-gray-200' : ''
            }`}>
              Skills
            </label>

            <div className={`flex items-center gap-3 border rounded-xl px-3 py-2 min-h-[60px] transition-colors duration-300 ${
              isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
            }`}>
              <div className="flex flex-wrap gap-2 flex-1">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-lg font-medium transition-colors duration-300 ${
                      isDark 
                        ? 'bg-purple-900/30 text-purple-300' 
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {skill}

                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className={isDark ? 'text-purple-300 hover:text-purple-200' : 'text-purple-700 hover:text-purple-900'}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                <input
                  value={skillInput}
                  onChange={(e) =>
                    setSkillInput(e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && addSkill()
                  }
                  placeholder="Add a skill (e.g., Python)"
                  className={`flex-1 min-w-[180px] outline-none py-2 transition-colors duration-300 ${
                    isDark 
                      ? 'bg-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white text-gray-800 placeholder-gray-400'
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={addSkill}
                className={`h-12 px-6 text-xl rounded-xl border-2 font-semibold transition-colors duration-300 ${
                  isDark 
                    ? 'border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white' 
                    : 'border-purple-500 text-purple-600 hover:bg-purple-600 hover:text-white'
                }`}
              >
                Add
              </button>
            </div>
          </div>

          <div className={`border-t my-8 transition-colors duration-300 ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`} />

          {/* ONLINE PRESENCE */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
              isDark ? 'bg-purple-900/30' : 'bg-purple-100'
            }`}>
              <Globe
                size={20}
                className={`transition-colors duration-300 ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`}
              />
            </div>

            <h2 className={`text-[24px] font-semibold transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-[#0f172a]'
            }`}>
              Online Presence
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className={`block text-lg font-medium mb-2 transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                GitHub URL
              </label>

              <input
                value={profile.github}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    github: e.target.value,
                  })
                }
                className={`w-full h-14 px-4 rounded-xl border outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-lg font-medium mb-2 transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                LinkedIn URL
              </label>

              <input
                value={profile.linkedin}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    linkedin: e.target.value,
                  })
                }
                className={`w-full h-14 px-4 rounded-xl border outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-lg font-medium mb-2 transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                Portfolio URL
              </label>

              <input
                value={profile.portfolio}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    portfolio: e.target.value,
                  })
                }
                className={`w-full h-14 px-4 rounded-xl border outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-lg font-medium mb-2 transition-colors duration-300 ${
                isDark ? 'text-gray-200' : ''
              }`}>
                Resume URL
              </label>

              <input
                value={profile.resume}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    resume: e.target.value,
                  })
                }
                className={`w-full h-14 px-4 rounded-xl border outline-none transition-colors duration-300 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                    : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
                }`}
              />
            </div>
          </div>

          <div className={`border-t my-8 transition-colors duration-300 ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`} />

          {/* BIO */}
          <div>
            <label className={`block text-[24px] font-medium mb-2 transition-colors duration-300 ${
              isDark ? 'text-gray-200' : ''
            }`}>
              Bio
            </label>

            <textarea
              rows={5}
              maxLength={2000}
              value={profile.bio}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  bio: e.target.value,
                })
              }
              className={`w-full rounded-2xl border p-4 resize-none outline-none transition-colors duration-300 ${
                isDark 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                  : 'border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-purple-500'
              }`}
            />

            <p className={`text-lg mt-2 transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-400'
            }`}>
              {profile.bio.length}/2000 characters
            </p>
          </div>

          {/* BUTTONS */}
          <div className="grid grid-cols-2 gap-6 mt-10">
            <button
              onClick={() => navigate(-1)}
              className={`h-14 text-[22px] rounded-xl border font-semibold transition-colors duration-300 ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'border-gray-300 text-gray-700 hover:bg-indigo-950 hover:text-white'
              }`}
            >
              Cancel
            </button>

            <button
              onClick={handleUpdate}
              className="h-14 text-[22px] rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg hover:from-indigo-950 hover:to-purple-600 transition"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}