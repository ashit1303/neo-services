import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [loading, setLoading] =
    useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      console.log(response.data);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );

      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-purple-300 to-purple-600 p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Login
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border rounded-lg p-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-700 text-white py-3 rounded-lg"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p className="text-center mt-4">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-purple-700 font-semibold"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}






// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api/api";

// export default function Login() {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [fullName, setFullName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (
//     e: React.FormEvent<HTMLFormElement>
//   ) => {
//     e.preventDefault();

//     setLoading(true);
//     setError("");

//     try {
//       const response = await api.get("/auth/sendOtp",
//         {
//           params: {
//             email,
//             fullName,
//           },
//         }
//       );

//       console.log("Send OTP Response:", response.data);

//       localStorage.setItem(
//         "pendingEmail",
//         email
//       );

//       navigate("/verify-otp");
//     } catch (err: any) {
//       setError(
//         err?.response?.data?.message ||
//           "Failed to send OTP. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-purple-300 to-purple-600 p-4">

//       <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-[420px]">

//         <h1 className="text-3xl md:text-4xl font-semibold text-center text-gray-800 mb-6">
//           Login 
//         </h1>

//         {error && (
//           <div className="mb-6 p-3 mt-6 bg-red-50 border border-red-200 text-red-600 rounded-lg text-md text-center">
//             {error}
//           </div>
//         )}

//         <form
//           onSubmit={handleSubmit}
//           className="space-y-4"
//         >
//           <div>
//             <label className="block text-lg font-semibold text-gray-700 mb-2">
//               Email Address
//             </label>

//             <input
//               type="email"
//               value={email}
//               onChange={(e) =>
//                 setEmail(e.target.value)
//               }
//               placeholder="Enter your email"
//               required
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-800"
//             />
//           </div>

//           <div>
//             <label className="block text-lg font-semibold text-gray-700 mb-2">
//               Full Name
//             </label>

//             <input
//               type="text"
//               value={fullName}
//               onChange={(e) =>
//                 setFullName(e.target.value)
//               }
//               placeholder="Enter your Full Name"
//               required
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-800"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-gradient-to-r from-purple-500 to-indigo-900 text-white text-lg mt-2 font-semibold py-3.5 rounded-lg shadow-lg hover:opacity-90 transition disabled:opacity-50"
//           >
//             {loading
//               ? "Sending OTP..."
//               : "Send OTP"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }