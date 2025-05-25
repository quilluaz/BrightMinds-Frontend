import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import { useTheme } from "../../context/ThemeContext";
import logoForLightTheme from "../../assets/logos/LogoIconDark.svg";
import logoForDarkTheme from "../../assets/logos/LogoIconLight.svg";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const currentLogo = theme === "light" ? logoForLightTheme : logoForDarkTheme;
  const navigate = useNavigate();

  console.log("LoginPage rendered. isAuthenticated:", isAuthenticated, "User:", user, "isLoading:", isLoading);

  // Effect to redirect if already authenticated
  useEffect(() => {
    console.log("LoginPage useEffect triggered. isAuthenticated:", isAuthenticated, "User:", user);
    if (isAuthenticated && user) {
      console.log("LoginPage useEffect: Navigating due to existing auth. Role:", user.role);
      if (user.role === "TEACHER") {
        navigate("/teacher/classrooms", { replace: true });
      } else if (user.role === "STUDENT") {
        navigate("/student/classrooms", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log("LoginPage handleSubmit: Attempting login...");

    try {
      const loggedInUser = await login(email, password);
      console.log("LoginPage handleSubmit: Login call completed. LoggedInUser:", loggedInUser);

      if (loggedInUser) {
        console.log("LoginPage handleSubmit: Navigating after successful login. Role:", loggedInUser.role);
        // The navigation here will happen, but the component might re-render due to context state change.
        // The useEffect above might also try to navigate. This is usually fine.
        if (loggedInUser.role === "TEACHER") {
          navigate("/teacher/classrooms", { replace: true });
        } else if (loggedInUser.role === "STUDENT") {
          navigate("/student/classrooms", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        console.log("LoginPage handleSubmit: Login call returned no user.");
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("LoginPage handleSubmit: Login error caught.", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during login"
      );
    }
  };

  if (isAuthenticated && user && !isLoading) { // Check isLoading to prevent rendering this if auth check is pending
      console.log("LoginPage: Rendering redirecting message because user is authenticated.");
      return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>;
  }

  return (
    // ... rest of your JSX ...
    // Make sure this part is actually rendered when you expect it.
    // If "Redirecting..." is shown, then the issue might be in the navigation logic itself or the target routes.
     <div className="min-h-screen bg-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card border border-gray-100 animate-fade-in">
          <div className="text-center mb-6">
            <Link to="/" className="inline-block">
              <img src={currentLogo} alt="BrightMinds Logo" className="h-20" />
            </Link>
            <h1 className="text-2xl font-bold text-primary-text dark:text-primary-text-dark">
              Welcome Back
            </h1>
            <p className="text-gray-600 mt-1">Log in to continue learning</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="your-email@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading && !error}
              disabled={isLoading}>
              Log In
            </Button>

            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-interactive hover:underline">
                Forgot your password?
              </Link>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary-interactive hover:underline font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;