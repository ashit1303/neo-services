import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

interface CandidateProfile {
  userId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  skills: string[];
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  resumeUrl: string;
  experience: number;
  bio: string;
}

export default function CandidateProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<CandidateProfile>({
    userId: '',
    fullName: '',
    email: '',
    mobileNumber: '',
    skills: [],
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    resumeUrl: '',
    experience: 0,
    bio: '',
  });

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetchingProfile(true);
        const userId = localStorage.getItem('userId');
        if (!userId) {
          navigate('/');
          return;
        }

        const response = await api.get(`/candidate/profile/${userId}`);
        const profile = response.data.data || response.data;
        
        setFormData({
          userId: profile.userId,
          fullName: profile.fullName || '',
          email: profile.email || '',
          mobileNumber: profile.mobileNumber || '',
          skills: profile.skills || [],
          githubUrl: profile.githubUrl || '',
          linkedinUrl: profile.linkedinUrl || '',
          portfolioUrl: profile.portfolioUrl || '',
          resumeUrl: profile.resumeUrl || '',
          experience: profile.experience || 0,
          bio: profile.bio || '',
        });
      } catch (err: any) {
        if (err.response?.status !== 404) {
          console.error('Failed to fetch profile:', err);
        }
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : 0 }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/candidate/profile', formData);
      setSuccess('Profile saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
    
        <div className="mb-8">
          <h1 className="text-4xl text-center font-semibold text-gray-900">Candidate Profile</h1>
          <p className="text-gray-600 mt-1 text-center">Build your professional profile to showcase your skills</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="example@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  maxLength={20}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="+0123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleNumberChange}
                  min={0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="3"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={handleSkillKeyPress}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add a skill (e.g., React, Node.js)"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-purple-700 hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* URLs */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Online Presence</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://github.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume URL
                </label>
                <input
                  type="url"
                  name="resumeUrl"
                  value={formData.resumeUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://drive.google.com/resume.pdf"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              maxLength={2000}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Tell us about yourself, your experience, and what you're looking for..."
            />
            <p className="text-xs text-gray-500 mt-1">{(formData.bio || ' ').length}/2000 characters</p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}










// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/api';

// interface CandidateProfile {
//   userId: string;
//   fullName: string;
//   email: string;
//   mobileNumber: string;
//   skills: string[];
//   githubUrl: string;
//   linkedinUrl: string;
//   portfolioUrl: string;
//   resumeUrl: string;
//   experience: number;
//   bio: string;
// }

// export default function CandidateProfile() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [fetchingProfile, setFetchingProfile] = useState(true);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
  
//   const [formData, setFormData] = useState<CandidateProfile>({
//     userId: '',
//     fullName: '',
//     email: '',
//     mobileNumber: '',
//     skills: [],
//     githubUrl: '',
//     linkedinUrl: '',
//     portfolioUrl: '',
//     resumeUrl: '',
//     experience: 0,
//     bio: '',
//   });

//   const [skillInput, setSkillInput] = useState('');

//   // Fetch existing profile on mount
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         setFetchingProfile(true);
//         const userId = localStorage.getItem('userId');
//         if (!userId) {
//           navigate('/');
//           return;
//         }

//         const response = await api.get(`/candidate/profile/${userId}`);
//         const profile = response.data.data || response.data;
        
//         setFormData({
//           userId: profile.userId,
//           fullName: profile.fullName || '',
//           email: profile.email || '',
//           mobileNumber: profile.mobileNumber || '',
//           skills: profile.skills || [],
//           githubUrl: profile.githubUrl || '',
//           linkedinUrl: profile.linkedinUrl || '',
//           portfolioUrl: profile.portfolioUrl || '',
//           resumeUrl: profile.resumeUrl || '',
//           experience: profile.experience || 0,
//           bio: profile.bio || '',
//         });
//       } catch (err: any) {
//         // Profile not found is okay, user will create new
//         if (err.response?.status !== 404) {
//           console.error('Failed to fetch profile:', err);
//         }
//       } finally {
//         setFetchingProfile(false);
//       }
//     };

//     fetchProfile();
//   },);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : 0 }));
//   };

//   const addSkill = () => {
//     if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
//       setFormData((prev) => ({
//         ...prev,
//         skills: [...prev.skills, skillInput.trim()],
//       }));
//       setSkillInput('');
//     }
//   };

//   const removeSkill = (skillToRemove: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       skills: prev.skills.filter((skill) => skill !== skillToRemove),
//     }));
//   };

//   const handleSkillKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       addSkill();
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     setLoading(true);

//     try {
//       await api.post('/candidate/profile', formData);
//       setSuccess('Profile saved successfully!');
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Failed to save profile');
//       setTimeout(() => setError(''), 3000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (fetchingProfile) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Candidate Profile</h1>
//           <p className="text-gray-600 mt-1">Build your professional profile to showcase your skills</p>
//         </div>

//         {/* Success Message */}
//         {success && (
//           <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
//             {success}
//           </div>
//         )}

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
//             {error}
//           </div>
//         )}

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
//           {/* Basic Information */}
//           <div>
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Full Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={formData.fullName}
//                   onChange={handleChange}
//                   required
//                   maxLength={100}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                   placeholder="John Doe"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                   maxLength={100}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                   placeholder="john@example.com"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Mobile Number
//                 </label>
//                 <input
//                   type="tel"
//                   name="mobileNumber"
//                   value={formData.mobileNumber}
//                   onChange={handleChange}
//                   maxLength={20}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                   placeholder="+91 9876543210"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Experience (Years)
//                 </label>
//                 <input
//                   type="number"
//                   name="experience"
//                   value={formData.experience}
//                   onChange={handleNumberChange}
//                   min={0}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                   placeholder="3"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Skills */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Skills
//             </label>
//             <div className="flex gap-2 mb-3">
//               <input
//                 type="text"
//                 value={skillInput}
//                 onChange={(e) => setSkillInput(e.target.value)}
//                 onKeyPress={handleSkillKeyPress}
//                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                 placeholder="Add a skill (e.g., React, Node.js)"
//               />
//               <button
//                 type="button"
//                 onClick={addSkill}
//                 className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
//               >
//                 Add
//               </button>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {formData.skills.map((skill, index) => (
//                 <span
//                   key={index}
//                   className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
//                 >
//                   {skill}
//                   <button
//                     type="button"
//                     onClick={() => removeSkill(skill)}
//                     className="text-purple-700 hover:text-purple-900"
//                   >
//                     ×
//                   </button>
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* URLs */}
//           <div>
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">Online Presence</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   GitHub URL
//                 </label>
//                 <input
//                   type="url"
//                   name="githubUrl"
//                   value={formData.githubUrl}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                   placeholder="https://github.com/username"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   LinkedIn URL
//                 </label>
//                 <input
//                   type="url"
//                   name="linkedinUrl"
//                   value={formData.linkedinUrl}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                   placeholder="https://linkedin.com/in/username"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Portfolio URL
//                 </label>
//                 <input
//                   type="url"
//                   name="portfolioUrl"
//                   value={formData.portfolioUrl}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                   placeholder="https://yourportfolio.com"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Resume URL
//                 </label>
//                 <input
//                   type="url"
//                   name="resumeUrl"
//                   value={formData.resumeUrl}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                   placeholder="https://drive.google.com/resume.pdf"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Bio */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Bio
//             </label>
//             <textarea
//               name="bio"
//               value={formData.bio}
//               onChange={handleChange}
//               maxLength={2000}
//               rows={4}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
//               placeholder="Tell us about yourself, your experience, and what you're looking for..."
//             />
//             <p className="text-xs text-gray-500 mt-1">{(formData.bio || '').length}/2000 characters</p>
//           </div>

//           {/* Submit Button */}
//           <div className="flex gap-3 pt-4">
//             <button
//               type="button"
//               onClick={() => navigate(-1)}
//               className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50"
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                   </svg>
//                   Saving...
//                 </span>
//               ) : (
//                 'Save Profile'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }