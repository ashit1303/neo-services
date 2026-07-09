import { useEffect, useState } from "react";
import { User, Globe, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

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
      <div className="min-h-screen flex justify-center items-center bg-[#f7f8fc]">
        <div className="text-lg font-medium text-gray-500">
          Loading Profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <div className="px-10 py-8">

        {/* PAGE TITLE */}

        <div className="flex justify-center mb-8">
          <h1 className="text-[40px] font-semibold text-[#0f172a]">
            Edit Candidate Profile
          </h1>
        </div>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <User
                size={22}
                className="text-purple-600"
              />
            </div>

            <h2 className="text-[24px] font-semibold text-[#0f172a]">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">

            <div>
              <label className="block text-lg font-medium mb-2">
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
                className="w-full h-14 px-4 rounded-xl border border-gray-300 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">
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
                className="w-full h-14 px-4 rounded-xl border border-gray-300 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">
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
                className="w-full h-14 px-4 rounded-xl border border-gray-300 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">
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
                className="w-full h-14 px-4 rounded-xl border border-gray-300 outline-none focus:border-purple-500"
              />
            </div>

          </div>

          {/* SKILLS */}

          <div className="mt-6">

            <label className="block text-lg font-medium mb-3">
              Skills
            </label>

            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-3 py-2 min-h-[60px]">

              <div className="flex flex-wrap gap-2 flex-1">

                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-lg font-medium"
                  >
                    {skill}

                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
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
                  className="flex-1 min-w-[180px] outline-none py-2"
                />

              </div>

              <button
                type="button"
                onClick={addSkill}
                className="h-12 px-6 text-xl rounded-xl border-2 border-purple-500 text-purple-600 font-semibold hover:bg-purple-600 hover:text-white transition"
              >
                Add
              </button>

            </div>

          </div>

          <div className="border-t border-gray-200 my-8" />

          {/* ONLINE PRESENCE */}

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Globe
                size={20}
                className="text-purple-600"
              />
            </div>

            <h2 className="text-[24px] font-semibold text-[#0f172a]">
              Online Presence
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">

            <div>
              <label className="block text-lg font-medium mb-2">
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
                className="w-full h-14 px-4 rounded-xl border border-gray-300 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">
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
                className="w-full h-14 px-4 rounded-xl border border-gray-300 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">
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
                className="w-full h-14 px-4 rounded-xl border border-gray-300 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">
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
                className="w-full h-14 px-4 rounded-xl border border-gray-300 outline-none focus:border-purple-500"
              />
            </div>

          </div>

          <div className="border-t border-gray-200 my-8" />

          {/* BIO */}

          <div>

            <label className="block text-[24px] font-medium mb-2">
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
              className="w-full rounded-2xl border border-gray-300 p-4 resize-none outline-none focus:border-purple-500"
            />

            <p className="text-lg text-gray-400 mt-2">
              {profile.bio.length}/2000 characters
            </p>

          </div>

          {/* BUTTONS */}

          <div className="grid grid-cols-2 gap-6 mt-10">

            <button
              onClick={() => navigate(-1)}
              className="h-14 text-[22px] rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-indigo-950 hover:text-white"
            >
              Cancel
            </button>

            <button
              onClick={handleUpdate}
              className="h-14 text-[22px] rounded-xl text-white font-semibold bg-gradient-to-r from-[#8B2CF5] to-[#4F46E5] shadow-lg hover:from-indigo-950 hover:to-[#8B2CF5] transition"
            >
              Update Profile
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}