import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const res = await login(email, password);
        setLoading(false);
        if (res.success) navigate("/");
        else setError(res.error);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4
            bg-gradient-to-br from-indigo-200 via-blue-100 to-pink-200">

            <div className="max-w-md w-full 
                bg-gradient-to-br from-white via-blue-50/70 to-indigo-50/60
                backdrop-blur-xl p-8 rounded-2xl
                shadow-[0_25px_70px_rgba(0,0,0,0.12)]
                border border-white/60">

                <div className="flex flex-col items-center mb-6">
                    <img
                        src="/avani-logo.jpg"
                        alt="Avani Enterprises"
                        className="w-24 h-24 mb-3 rounded-full shadow-lg"
                    />
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        AVANI ENTERPRISES
                    </h1>
                </div>

                <h2 className="text-xl font-semibold text-center text-gray-900 mb-1">
                    Welcome Back 
                </h2>
                <p className="text-center text-gray-600 mb-8">
                    Sign in to continue to your dashboard
                </p>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                                bg-white/80
                                focus:ring-2 focus:ring-indigo-400
                                focus:border-transparent outline-none
                                transition-all"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-xs font-medium text-indigo-600 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                                bg-white/80
                                focus:ring-2 focus:ring-indigo-400
                                focus:border-transparent outline-none
                                transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg font-semibold text-white
                            bg-gradient-to-r from-indigo-600 to-pink-500
                            hover:from-indigo-700 hover:to-pink-600
                            shadow-lg shadow-indigo-300/40
                            transition-all flex items-center justify-center
                            disabled:opacity-70"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-indigo-600 font-semibold hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
