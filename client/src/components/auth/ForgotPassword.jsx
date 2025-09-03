import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSendEmail = async () => {
    setError(null);
    setSuccess(null);

    try {
      const res = await api.post("/auth/request-reset", { email });

      if (res.status === 200) {
        setSuccess("Password reset email sent! Please check your inbox.");
        setEmail("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
      console.error(err);
    }
  };

  return (
    <div
      className={`h-[100vh] w-full flex items-center justify-center bg-[url("2faimg1.jpg")] bg-cover`}
    >
      <div className="bg-white text-gray-500 max-w-96 mx-4 md:p-6 p-4 text-left text-sm rounded shadow-[0px_0px_10px_0px] shadow-black/10">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Forgot Password?
        </h2>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border mt-1 border-gray-500/30 focus:border-indigo-500 outline-none rounded py-2.5 px-4"
          type="email"
          placeholder="Enter your email"
        />

        <button
          type="button"
          className="w-full my-3 bg-gray-800 active:scale-95 transition py-2.5 rounded text-white"
          onClick={handleSendEmail}
        >
          Send Email
        </button>

        {success && <p className="text-green-600 mt-2">{success}</p>}
        {error && <p className="text-red-500 mt-2">{error}</p>}

        <p className="text-center mt-4">
          Don’t have an account?{" "}
          <span
            className="text-blue-500 underline cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Signup Now
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
