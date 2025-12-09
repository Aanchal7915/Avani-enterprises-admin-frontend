// import { createContext, useContext, useState, useEffect } from "react";
// import axios from "axios";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [token, setToken] = useState(localStorage.getItem("token") || null);
//     const [loading, setLoading] = useState(true);

//     // Configure global axios defaults
//     if (token) {
//         axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     } else {
//         delete axios.defaults.headers.common["Authorization"];
//     }

//     useEffect(() => {
//         // If token exists, we could fetch user profile here if backend supported /me
//         // For now we just trust the token exists until 401
//         setLoading(false);
//     }, [token]);

//     const login = async (email, password) => {
//         try {
//             const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
//             const { token, user } = res.data;

//             localStorage.setItem("token", token);
//             setToken(token);
//             setUser(user);
//             return { success: true };
//         } catch (err) {
//             return { success: false, error: err.response?.data?.message || "Login failed" };
//         }
//     };

//     const signup = async (name, email, password, adminCode) => {
//         try {
//             await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, { name, email, password, adminCode });
//             return { success: true };
//         } catch (err) {
//             return { success: false, error: err.response?.data?.message || "Signup failed" };
//         }
//     };

//     const verifySignup = async (email, otp) => {
//         try {
//             const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-signup`, { email, otp });
//             const { token, user } = res.data;
//             localStorage.setItem("token", token);
//             setToken(token);
//             setUser(user);
//             return { success: true, message: res.data.message };
//         } catch (err) {
//             return { success: false, error: err.response?.data?.message || "Verification failed" };
//         }
//     };

//     const logout = () => {
//         localStorage.removeItem("token");
//         setToken(null);
//         setUser(null);
//     };

//     const forgotPassword = async (email) => {
//         try {
//             const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email });
//             return { success: true, message: res.data.message };
//         } catch (err) {
//             return { success: false, error: err.response?.data?.message || "Request failed" };
//         }
//     };

//     const resetPassword = async (email, otp, newPassword) => {
//         try {
//             const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password-otp`, { email, otp, newPassword });
//             return { success: true, message: res.data.message };
//         } catch (err) {
//             return { success: false, error: err.response?.data?.message || "Reset failed" };
//         }
//     };

//     return (
//         <AuthContext.Provider value={{ user, token, login, signup, verifySignup, logout, forgotPassword, resetPassword, loading }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);














import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

// ✅ 1. Set global baseURL ek hi jagah
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user") || "null")
  );
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // ✅ 2. Token change hote hi axios ke headers update karo
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  // ✅ 3. Initial load pe localStorage se user read karo
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse stored user:", e);
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  // (optional) ✅ 4. 401 aaye to auto logout karne ke liye interceptor
  useEffect(() => {
    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          // token invalid / expired
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(resInterceptor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("/auth/login", { email, password });
      const { token: newToken, user: loggedInUser } = res.data;

      setToken(newToken);
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Login failed",
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      await axios.post("/auth/signup", { name, email, password });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Signup failed",
      };
    }
  };

  const verifySignup = async (email, otp) => {
    try {
      const res = await axios.post("/auth/verify-signup", { email, otp });
      const { token: newToken, user: verifiedUser } = res.data;

      setToken(newToken);
      setUser(verifiedUser);
      localStorage.setItem("user", JSON.stringify(verifiedUser));

      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Verification failed",
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const forgotPassword = async (email) => {
    try {
      const res = await axios.post("/auth/forgot-password", { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Request failed",
      };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await axios.post("/auth/reset-password-otp", {
        email,
        otp,
        newPassword,
      });
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Reset failed",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        verifySignup,
        logout,
        forgotPassword,
        resetPassword,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

