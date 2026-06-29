import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

interface CandidateProfile {
  userId: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  skills: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  experience?: number;
  bio?: string;
}

export default function CandidateDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await api.get(`/candidate/profile/${userId}`);
        setProfile(response.data.data || response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Profile not found</div>
      </div>
    );
  }

  const isMasked = profile.email.includes('***') || profile.mobileNumber?.includes('***');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
      
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-8 py-12 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profile.fullName}</h1>
                <p className="text-purple-100 mt-1">
                  {profile.experience ? `${profile.experience} years experience` : 'Candidate'}
                </p>
                {isMasked && (
                  <span className="inline-block mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-100 text-xs rounded-full">
                     Limited View (Contact HR for full details)
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="p-8 space-y-6">
         
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{profile.email}</span>
                </div>
                {profile.mobileNumber && (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700">{profile.mobileNumber}</span>
                  </div>
                )}
              </div>
            </div>

           
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.bio && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {(profile.githubUrl || profile.linkedinUrl || profile.portfolioUrl || profile.resumeUrl) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Online Presence</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span className="text-gray-700">GitHub</span>
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      <span className="text-gray-700">LinkedIn</span>
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <span className="text-gray-700">Portfolio</span>
                    </a>
                  )}
                  {profile.resumeUrl && (
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-700">Resume</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}





// import {
//   Eye,
//   Settings,
//   HelpCircle,
//   Upload,
//   Image as ImageIcon,
//   Download,
//   ExternalLink,
//   Pencil,
// } from "lucide-react";

// const actions = [
//   { icon: Upload, label: "Import" },
//   { icon: ImageIcon, label: "Image" },
//   { icon: Download, label: "Export" },
//   { icon: Eye, label: "Preview" },
//   { icon: ExternalLink, label: "Open" },
//   { icon: Settings, label: "Settings" },
//   { icon: HelpCircle, label: "Help" },
// ];

// export default function EditorPage() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="border-b bg-white">
//         {/* Desktop + iPad */}
//         <div className="hidden md:flex items-center justify-between px-6 py-4 lg:px-8">
//           <h1 className="text-2xl font-bold tracking-wide text-gray-900">
//             DILLINGER
//           </h1>

//           <div className="flex items-center gap-3 lg:gap-4">
//             {/* Actions */}
//             <div className="flex items-center gap-1 text-gray-700 lg:gap-3">
//               {actions.map(({ icon: Icon, label }) => (
//                 <button
//                   key={label}
//                   className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-indigo-50 hover:text-indigo-600"
//                 >
//                   <Icon size={20} />
//                   <span className="hidden lg:block">{label}</span>
//                 </button>
//               ))}
//             </div>

//             {/* New Document */}
//             <button className="rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700">
//               <span className="hidden px-5 py-3 lg:block">
//                 + New Document
//               </span>

//               <span className="block px-4 py-3 text-lg font-bold lg:hidden">
//                 +
//               </span>
//             </button>

//             {/* Avatar */}
//             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
//               A
//             </div>
//           </div>
//         </div>

//         {/* Mobile */}
//         <div className="md:hidden">
//           {/* Top Row */}
//           <div className="flex items-center justify-between px-4 py-3">
//             <h1 className="text-lg font-bold tracking-wide text-gray-900">
//               DILLINGER
//             </h1>

//             <div className="flex items-center gap-2">
//               <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white">
//                 +
//               </button>

//               <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
//                 A
//               </div>
//             </div>
//           </div>

//           {/* Actions Row */}
//           <div className="flex items-center justify-between border-t px-3 py-2">
//             {actions.map(({ icon: Icon, label }) => (
//               <button
//                 key={label}
//                 className="p-2 text-gray-700 transition hover:text-indigo-600"
//               >
//                 <Icon size={18} />
//               </button>
//             ))}
//           </div>
//         </div>
//       </header>

//       {/* Document Bar */}
//       <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 md:px-6 lg:px-8">
//         <div className="flex items-center gap-3">
//           <h2 className="truncate text-base font-semibold text-gray-900 md:text-xl">
//             Untitled Document.md
//           </h2>

//           <div className="flex items-center gap-1 text-xs font-medium text-green-600">
//             <span>Saved</span>
//             <Pencil size={12} />
//           </div>
//         </div>
//       </div>

//       {/* Editor Area */}
//       <main className="h-[calc(100vh-125px)] bg-gray-100">
//         {/* Editor Content */}
//       </main>
//     </div>
//   );
// }