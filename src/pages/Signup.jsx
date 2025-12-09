import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signup, verifySignup } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const res = await signup(name, email, password);
        setLoading(false);
        if (res.success) setStep(2);
        else setError(res.error);
    };

    const handleVerifyParams = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const res = await verifySignup(email, otp);
        setLoading(false);
        if (res.success) navigate("/");
        else setError(res.error);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4
            bg-gradient-to-br from-indigo-200 via-blue-100 to-pink-200">

            <div className="max-w-xl w-full
                bg-gradient-to-br from-white via-blue-50/70 to-indigo-50/60
                backdrop-blur-xl p-6
                rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.12)]
                border border-white/60">

                {/* Logo */}
                <div className="flex flex-col items-center mb-3">
                    <img
                        src="/avani-logo.jpg"
                        alt="Avani Enterprises"
                        className="w-18 h-18 object-contain mb-1 rounded-full shadow-lg"
                    />
                    <h1 className="text-xl font-extrabold text-gray-900">
                        AVANI ENTERPRISES
                    </h1>
                </div>

                {/* Heading */}
                <h2 className="text-lg font-semibold text-gray-900 text-center mb-0.5">
                    {step === 1 ? "Create Account" : "Verify Email"}
                </h2>
                <p className="text-center text-gray-600 mb-4 text-sm">
                    {step === 1
                        ? "Get started with your admin account"
                        : `Enter the OTP sent to ${email}`}
                </p>

                {/* Error */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-2.5 rounded-lg mb-3 text-sm border border-red-200">
                        {error}
                    </div>
                )}

                {/* Step 1 */}
                {step === 1 ? (
                    <form onSubmit={handleSignup} className="space-y-3">
                        {[
                            { label: "Full Name", type: "text", value: name, set: setName, placeholder: "John Doe" },
                            { label: "Email Address", type: "email", value: email, set: setEmail, placeholder: "admin@example.com" },
                            { label: "Password", type: "password", value: password, set: setPassword, placeholder: "••••••••" },
                        ].map((field, i) => (
                            <div key={i}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {field.label}
                                </label>
                                <input
                                    type={field.type}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 
                                        bg-white/80 focus:ring-2 focus:ring-indigo-400
                                        focus:border-transparent outline-none transition-all text-sm"
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    onChange={(e) => field.set(e.target.value)}
                                />
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-2.5 rounded-lg font-semibold text-white
                                bg-gradient-to-r from-indigo-600 to-pink-500
                                hover:from-indigo-700 hover:to-pink-600
                                shadow-lg shadow-indigo-300/40
                                transition-all flex justify-center items-center
                                disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
                        </button>
                    </form>
                ) : (
                    /* Step 2 */
                    <form onSubmit={handleVerifyParams} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                One-Time Password (OTP)
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                                    bg-white/80 focus:ring-2 focus:ring-indigo-400
                                    focus:border-transparent outline-none transition-all
                                    text-center tracking-[0.35em]"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Check your email for the OTP.
                            </p>
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
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
                        </button>
                    </form>
                )}

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
