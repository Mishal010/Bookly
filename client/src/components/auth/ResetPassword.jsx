import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { token } = useParams();

  const validatePassword = () => {
    try {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!passwordRegex.test(password)) {
        setError(
          "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character"
        );
        return false;
      }

      // basic empty check
      if (!password || !confirmPassword) {
        setError("Both fields are required");
        return false;
      }

      // matching check
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return false;
      }

      // ✅ valid case
      setError("");
      return true;
    } catch (error) {
      console.error(error.message);
      return false;
    }
  };

  const handleReset = async () => {
    if (validatePassword()) {
      try {
        await api.post(`/auth/reset-password/${token}`, {
          newPassword: password,
        });
        setPassword("");
        setConfirmPassword("");
        // navigate after success
        navigate("/login");
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div
      className={`h-[100vh] w-full flex items-center justify-center bg-[url('/2faimg2.jpg')] bg-cover`}
    >
      <div className="bg-white text-gray-500 max-w-96 mx-4 md:p-6 p-4 text-left text-sm rounded shadow-[0px_0px_10px_0px] shadow-black/10">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Reset Password
        </h2>

        <label htmlFor="password">New Password</label>
        <input
          id="password"
          className="w-full border mt-1 border-gray-500/30 focus:border-indigo-500 outline-none rounded py-2.5 px-4 mb-3"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
        />

        <label htmlFor="confirm-password">Confirm Password</label>
        <input
          id="confirm-password"
          className="w-full border mt-1 border-gray-500/30 focus:border-indigo-500 outline-none rounded py-2.5 px-4"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your new password"
        />

        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

        <button
          type="button"
          onClick={handleReset}
          className="w-full my-3 bg-gray-800 active:scale-95 transition py-2.5 rounded text-white cursor-pointer"
        >
          Reset
        </button>

        <p className="text-center mt-4">
          Change email?{" "}
          <span
            className="text-blue-500 underline cursor-pointer"
            onClick={() => navigate("/forgot-password")}
          >
            Go back
          </span>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
