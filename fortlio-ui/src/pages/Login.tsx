import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const data = res.data?.data;

      if (!data) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      const user = {
        id: data.user?._id || "",
        fullName: data.user?.fullName || "",
        email: data.user?.email || email,
      };

      localStorage.setItem("user", JSON.stringify(user));

      navigate("/candidate-profile", { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-purple-300 to-purple-600">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center mb-6">
          Login
        </h1>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
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
            className="w-full border rounded-lg p-3"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg p-3"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-700 text-white rounded-lg py-3"
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-4">
          Don't have an account?

          <Link
            to="/register"
            className="text-purple-700 ml-2"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}
