import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);

    // Configure global axios defaults
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common["Authorization"];
    }

    useEffect(() => {
        // If token exists, we could fetch user profile here if backend supported /me
        // For now we just trust the token exists until 401
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await axios.post("http://localhost:5000/auth/login", { email, password });
            const { token, user } = res.data;

            localStorage.setItem("token", token);
            setToken(token);
            setUser(user);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || "Login failed" };
        }
    };

    const signup = async (name, email, password, adminCode) => {
        try {
            await axios.post("http://localhost:5000/auth/signup", { name, email, password, adminCode });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || "Signup failed" };
        }
    };

    const verifySignup = async (email, otp) => {
        try {
            const res = await axios.post("http://localhost:5000/auth/verify-signup", { email, otp });
            const { token, user } = res.data;
            localStorage.setItem("token", token);
            setToken(token);
            setUser(user);
            return { success: true, message: res.data.message };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || "Verification failed" };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const forgotPassword = async (email) => {
        try {
            const res = await axios.post("http://localhost:5000/auth/forgot-password", { email });
            return { success: true, message: res.data.message };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || "Request failed" };
        }
    };

    const resetPassword = async (email, otp, newPassword) => {
        try {
            const res = await axios.post("http://localhost:5000/auth/reset-password-otp", { email, otp, newPassword });
            return { success: true, message: res.data.message };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || "Reset failed" };
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, verifySignup, logout, forgotPassword, resetPassword, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
