import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function VerifyOtpLogin() {
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(30);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const pendingEmail = localStorage.getItem("pendingEmail");

    if (!pendingEmail) {
      navigate("/verify-otp");
      return;
    }

    setEmail(pendingEmail);

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, [navigate]);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (
    index: number,
    value: string
  ) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const newOtp = ["", "", "", "", "", ""];

    pasted.split("").forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);

    const focusIndex =
      pasted.length >= 6 ? 5 : pasted.length;

    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter complete 6 digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        "/auth/verifyOtp",
        {
          email,
          otp: otpString,
        }
      );

      console.log("Verify OTP Response:", response.data);

      const accessToken =
        response.data?.accessToken ||
        response.data?.data?.accessToken;

      if (!accessToken) {
        throw new Error("Access token not found");
      }

      localStorage.setItem(
        "accessToken",
        accessToken
      );

      localStorage.removeItem("pendingEmail");

      setSuccess(
        "OTP verified successfully. Redirecting..."
      );

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Invalid OTP"
      );

      setOtp(["", "", "", "", "", ""]);

      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    try {
      setResendLoading(true);
      setError("");
      setSuccess("");

      await api.get("/auth/resendOtp", {
        params: {
          email,
        },
      });

      setSuccess(
        "OTP resent successfully. Check your email."
      );

      setTimer(30);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to resend OTP"
      );
    } finally {
      setResendLoading(false);
    }
  };

  // const handleBack = () => {
  //   localStorage.removeItem("pendingEmail");
  //   navigate("/");
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-purple-300 to-purple-600 p-4">
      <div className="bg-white rounded-[24px] shadow-2xl p-10 w-full max-w-[460px]">
        {/* <button
          onClick={handleBack}
          className="mb-4 text-purple-600 hover:text-purple-800 flex items-center gap-1 text-sm font-medium"
        >
          ← Back to Login
        </button> */}

        <div className="text-center mb-6">
          <h1 className="text-4xl font-medium text-gray-700">
            Verify Your Email
          </h1>

          <p className="text-lg font-semibold text-gray-600 mt-2">
            We sent a 6-digit code to your email
          </p>
        </div>

        {success && (
          <div className="mb-6 p-3 mt-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-md text-center">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-md text-center">
            {error}
          </div>
        )}

        <form
          onSubmit={handleVerify}
          className="space-y-6"
        >
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                disabled={loading}
                onChange={(e) =>
                  handleChange(
                    index,
                    e.target.value
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(index, e)
                }
                onPaste={handlePaste}
                className="w-14 h-14 border-2 border-gray-300 rounded-lg text-center text-2xl font-semibold text-gray-700 focus:border-purple-600 focus:outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              otp.join("").length !== 6
            }
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-900 text-white text-xl font-semibold py-3.5 rounded-2xl"
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </button>
        </form>

        <div className="text-center mt-6">
          {timer > 0 ? (
            <p className="text-lg text-gray-600">
              Didn't receive OTP? Resend{" "}
              <span className="font-semibold text-purple-600">
                {timer}s
              </span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-xl text-purple-600 font-semibold hover:underline"
            >
              {resendLoading
                ? "Resending..."
                : "Resend OTP"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}