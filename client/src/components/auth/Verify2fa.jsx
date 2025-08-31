import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/userAuthStore";

const Verify2fa = () => {
  const navigate = useNavigate();
  const verify2FA = useAuthStore((state) => state.verify2FA);
  const resendOTP = useAuthStore((state) => state.resendOTP);
  const sendingotp = useAuthStore((state) => state.sendingotp);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await verify2FA(otp);
      setOtp("");
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOTP();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div
      className={`w-full h-[100vh] bg-[url("/2faimg4.jpg")] bg-cover flex justify-center items-center overflow-y-hidden`}
    >
      <form
        className="bg-white/30 backdrop-blur-lg sm:w-[500px] flex justify-center p-10 flex-col items-center gap-2 w-[90vw] max-sm:blur-none max-sm:bg-white"
        onSubmit={handleSubmit}
      >
        <h1 className="font-semibold text-4xl">Verify 2FA</h1>
        <h2 className="text-center">Enter the 2FA code sent to your email</h2>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="2FA code"
          className="border-black border-1 text-center p-3"
        />
        <button
          className="bg-white px-10 py-2 rounded-md cursor-pointer max-sm:bg-black max-sm:text-white"
          type="submit"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
        <p>Didn't recive the code?</p>
        <span
          className="hover:underline cursor-pointer text-blue-600"
          onClick={handleResendOtp}
        >
          {sendingotp ? "Sending.." : "Resend code"}
        </span>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default Verify2fa;
