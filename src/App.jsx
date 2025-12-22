import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ContactedLeads from "./pages/ContactedLeads";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AvaniFormDetail from "./pages/AvaniFormDetail";
import AvaniFormsPage from "./pages/AvaniFormsPage";
import { Loader2 } from "lucide-react";


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin h-8 w-8 text-black" />
      </div>
    );
  }

  if (!user && !localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route (Redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  if (user || localStorage.getItem("token")) {
    // Basic check, accurate user state is updated in context effect
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* Protected App Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/contacted-leads"
            element={
              <ProtectedRoute>
                <ContactedLeads />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/avani-forms/:id"
            element={
              <ProtectedRoute>
                <AvaniFormDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/avani-forms"
            element={
              <ProtectedRoute>
                <AvaniFormsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback: unknown route -> dashboard (or login if not authed) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
