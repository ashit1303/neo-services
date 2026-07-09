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

export default function CandidateProfile() {
  const navigate = useNavigate();

  const candidate = {
    _id: "1",
    fullName: "Full Name",
    email: "example@gamil.com",
    mobile: "1234567890",
    experience: 2,

    skills: [
      "React",
      "Node.js",
      "JavaScript",
      "MongoDB",
    ],

    github: "https://github.com",

    linkedin:
      "https://linkedin.com/in",

    portfolio:
      "https://portfolio",

    resume:
      "https://resume.pdf",

    bio: `Write down bio`,
  };

  const initials =
    candidate.fullName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f7f8fc] p-8">

      <div className="flex items-center justify-between mb-8">

        <div className="flex items-center gap-5">    
            <h1 className="text-[40px] font-semibold text-[#0f172a]">
              Candidate Profile
            </h1>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() =>
              navigate("/create-profile")
            }
            className="h-12 px-6 text-lg rounded-xl border border-purple-500 text-purple-600 font-semibold hover:bg-purple-700 hover:text-white"
          >
            + Create Profile
          </button>

          <button
            onClick={() =>
              navigate(`/edit-profile`)
            }
            className="h-12 px-6 text-lg rounded-xl border border-purple-500 text-purple-600 font-semibold hover:bg-purple-700 hover:text-white"
          >
            Edit Profile
          </button>

          <button className="h-12 px-6 text-lg rounded-xl border border-purple-500 text-purple-600 font-semibold flex items-center gap-2 hover:bg-purple-700 hover:text-white">
            <Download size={18} />
            Download Resume
          </button>

        </div>

      </div>

      {/* Top Profile Card */}

      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm mb-6">

        <div className="flex items-center gap-10">

          <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center">

            <span className="text-[40px] font-semibold text-[#24196b]">
              {initials}
            </span>

          </div>

          <div className="flex-1">

            <h2 className="text-[40px] font-semibold text-[#0f172a] mb-6">
              {candidate.fullName}
            </h2>

            <div className="flex flex-wrap gap-10">

              <div className="flex items-center gap-3">
                <Mail size={22} className="text-gray-500" />
                <span>{candidate.email}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={22} className="text-gray-500" />
                <span>{candidate.mobile}</span>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={22} className="text-gray-500" />
                <span>
                  {candidate.experience} Years of Experience
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Tag size={22} className="text-gray-500" />
                <span>
                  {candidate.skills.length} Skills
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Main Grid */}

      <div className="grid grid-cols-2 gap-6">

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

          <div className="flex items-center gap-3 mb-8">

            <User
              className="text-purple-600"
              size={24}
            />

            <h3 className="text-2xl font-semibold">
              Basic Information
            </h3>

          </div>

          <div className="space-y-6">

            <div className="grid grid-cols-[220px_20px_1fr]">
              <span className="font-medium text-gray-700">
                Full Name
              </span>
              <span>:</span>
              <span>{candidate.fullName}</span>
            </div>

            <div className="grid grid-cols-[220px_20px_1fr]">
              <span className="font-medium text-gray-700">
                Email
              </span>
              <span>:</span>
              <span>{candidate.email}</span>
            </div>

            <div className="grid grid-cols-[220px_20px_1fr]">
              <span className="font-medium text-gray-700">
                Mobile Number
              </span>
              <span>:</span>
              <span>{candidate.mobile}</span>
            </div>

            <div className="grid grid-cols-[220px_20px_1fr]">
              <span className="font-medium text-gray-700">
                Experience (Years)
              </span>
              <span>:</span>
              <span>{candidate.experience}</span>
            </div>

          </div>

        </div>

        {/* Skills */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

          <div className="flex items-center gap-3 mb-8">

            <Code2
              className="text-purple-600"
              size={24}
            />

            <h3 className="text-2xl font-semibold">
              Skills
            </h3>

          </div>

          <div className="flex flex-wrap gap-4">

            {candidate.skills.map((skill) => (
              <div
                key={skill}
                className="px-5 py-3 bg-purple-100 text-purple-700 rounded-xl font-medium"
              >
                {skill}
              </div>
            ))}

          </div>

        </div>

        {/* Online Presence */}

        <div className="col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

          <div className="flex items-center gap-3 mb-8">

            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 text-xl">
                🌐
              </span>
            </div>

            <h3 className="text-2xl font-semibold">
              Online Presence
            </h3>

          </div>

          <div className="grid grid-cols-2 gap-12">

            <div className="space-y-8">

              <div>
                <p className="font-semibold text-gray-700 mb-2">
                  GitHub URL
                </p>

                <a
                  href={candidate.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  {candidate.github}
                </a>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-2">
                  Portfolio URL
                </p>

                <a
                  href={candidate.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  {candidate.portfolio}
                </a>
              </div>

            </div>

            <div className="space-y-8">

              <div>
                <p className="font-semibold text-gray-700 mb-2">
                  LinkedIn URL
                </p>

                <a
                  href={candidate.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  {candidate.linkedin}
                </a>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-2">
                  Resume URL
                </p>

                <a
                  href={candidate.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  {candidate.resume}
                </a>
              </div>

            </div>

          </div>

        </div>

        {/* Bio */}

        <div className="col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

          <div className="flex items-center gap-3 mb-6">

            <User
              className="text-purple-600"
              size={24}
            />

            <h3 className="text-2xl font-semibold">
              Bio
            </h3>

          </div>

          <div className="border-t pt-6">

            <p className="text-gray-700 leading-8 text-[16px]">
              {candidate.bio}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}