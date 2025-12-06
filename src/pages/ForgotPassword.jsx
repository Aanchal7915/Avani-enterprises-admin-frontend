import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { forgotPassword, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        const res = await forgotPassword(email);
        setLoading(false);
        if (res.success) {
            setStep(2);
            setMessage(res.message);
        } else {
            setError(res.error);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        const res = await resetPassword(email, otp, newPassword);
        setLoading(false);
        if (res.success) {
            setMessage("Password reset successful! Redirecting to login...");
            setTimeout(() => navigate("/login"), 3000);
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4
            bg-gradient-to-br from-indigo-200 via-blue-100 to-pink-200">

            <div className="max-w-lg w-full
                bg-gradient-to-br from-white via-blue-50/70 to-indigo-50/60
                backdrop-blur-xl p-6 md:p-7
                rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.12)]
                border border-white/60">

                {/* Back link */}
                <Link
                    to="/login"
                    className="inline-flex items-center text-sm font-medium
                    text-indigo-600 hover:text-indigo-800 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Login
                </Link>

                {/* Logo + brand */}
                <div className="flex flex-col items-center mb-4">
                    <img
                        src="/avani-logo.jpg"
                        alt="Avani Enterprises"
                        className="w-20 h-20 object-contain mb-2 rounded-full shadow-lg"
                    />
                    <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
                        AVANI ENTERPRISES
                    </h1>
                </div>

                {/* Step text */}
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 text-center mb-1">
                    {step === 1 ? "Reset Password" : "Set New Password"}
                </h2>
                <p className="text-center text-gray-600 mb-6 text-sm">
                    {step === 1
                        ? "Enter your email to receive a one-time password (OTP)."
                        : `Enter the OTP and choose a new password for ${email}.`}
                </p>

                {/* Alerts */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm border border-green-200">
                        {message}
                    </div>
                )}

                {/* Forms */}
                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                                    bg-white/80
                                    focus:ring-2 focus:ring-indigo-400
                                    focus:border-transparent outline-none transition-all text-sm"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-lg font-semibold text-white
                                bg-gradient-to-r from-indigo-600 to-pink-500
                                hover:from-indigo-700 hover:to-pink-600
                                shadow-lg shadow-indigo-300/40
                                transition-all flex justify-center items-center
                                disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Send OTP"
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                                    bg-white/80
                                    focus:ring-2 focus:ring-indigo-400
                                    focus:border-transparent outline-none transition-all
                                    text-center tracking-[0.4em] text-base"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Check your email for the 6-digit OTP.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                                    bg-white/80
                                    focus:ring-2 focus:ring-indigo-400
                                    focus:border-transparent outline-none transition-all text-sm"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-lg font-semibold text-white
                                bg-gradient-to-r from-indigo-600 to-pink-500
                                hover:from-indigo-700 hover:to-pink-600
                                shadow-lg shadow-indigo-300/40
                                transition-all flex justify-center items-center
                                disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Reset Password"
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
