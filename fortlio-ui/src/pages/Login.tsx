import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.get("/auth/sendOtp",
        {
          params: {
            email,
            fullName,
          },
        }
      );

      console.log("Send OTP Response:", response.data);

      localStorage.setItem(
        "pendingEmail",
        email
      );

      navigate("/verify-otp");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-purple-300 to-purple-600 p-4">

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-[420px]">

        <h1 className="text-3xl md:text-4xl font-semibold text-center text-gray-800 mb-6">
          Login 
        </h1>

        {error && (
          <div className="mb-6 p-3 mt-6 bg-red-50 border border-red-200 text-red-600 rounded-lg text-md text-center">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-800"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              placeholder="Enter your Full Name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-900 text-white text-lg mt-2 font-semibold py-3.5 rounded-lg shadow-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading
              ? "Sending OTP..."
              : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}