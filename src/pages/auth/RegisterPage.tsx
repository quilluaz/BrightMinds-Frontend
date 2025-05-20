import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, AlertCircle, KeyRound } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import logoForLightTheme from "../../assets/logos/LogoIconDark.svg";
import logoForDarkTheme from "../../assets/logos/LogoIconLight.svg";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import { UserRole } from "../../types";

const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [teacherCode, setTeacherCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useAuth();
  const { theme } = useTheme();
  const currentLogo = theme === "light" ? logoForLightTheme : logoForDarkTheme;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }
    if (!lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (role === "teacher" && !teacherCode.trim()) {
      setError("Teacher code is required for teacher registration.");
      return;
    }

    try {
      await register(
        firstName.trim(),
        lastName.trim(),
        email,
        password,
        role === "teacher" ? teacherCode : undefined
      );
      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during registration"
      );
    }
  };

  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center p-4">
      {/* Increased max-width here from md to lg */}
      <div className="w-full max-w-lg">
        <div className="card border border-gray-100 animate-fade-in">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <Link to="/" className="inline-block">
                <img
                  src={currentLogo}
                  alt="BrightMinds Logo"
                  className="h-20"
                />
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-primary-text dark:text-primary-text-dark">
              Create Your Account
            </h1>
            <p className="text-gray-600 mt-1">
              Join BrightMinds to start your learning journey
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Flex container for First Name and Last Name */}
            {/* On medium screens (md) and up, they will be in a row. On smaller screens, they stack. */}
            <div className="flex flex-col md:flex-row md:gap-4 mb-4"> {/* << ADDED: Flex container */}
              {/* First Name Field */}
              <div className="w-full md:w-1/2 mb-4 md:mb-0"> {/* << MODIFIED: Width and responsive margin */}
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <User size={18} />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Your first name"
                    required
                  />
                </div>
              </div>

              {/* Last Name Field */}
              <div className="w-full md:w-1/2"> {/* << MODIFIED: Width */}
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <User size={18} />
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Your last name"
                    required
                  />
                </div>
              </div>
            </div> {/* << ADDED: End of Flex container for names */}


            {/* Email Field */}
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
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-4">
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
                  minLength={6}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`
                    flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                    ${
                      role === "student"
                        ? "border-primary-interactive bg-primary-interactive bg-opacity-10 font-medium"
                        : "border-gray-300 hover:border-primary-interactive hover:bg-primary-interactive hover:bg-opacity-5"
                    }
                  `}>
                  <input
                    type="radio"
                    className="sr-only"
                    name="role"
                    value="student"
                    checked={role === "student"}
                    onChange={() => {
                      setRole("student");
                      setTeacherCode("");
                    }}
                  />
                  <span>Student</span>
                </label>
                <label
                  className={`
                    flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                    ${
                      role === "teacher"
                        ? "border-primary-interactive bg-primary-interactive bg-opacity-10 font-medium"
                        : "border-gray-300 hover:border-primary-interactive hover:bg-primary-interactive hover:bg-opacity-5"
                    }
                  `}>
                  <input
                    type="radio"
                    className="sr-only"
                    name="role"
                    value="teacher"
                    checked={role === "teacher"}
                    onChange={() => setRole("teacher")}
                  />
                  <span>Teacher</span>
                </label>
              </div>
            </div>

            {/* Teacher Code Field */}
            {role === "teacher" && (
              <div className="mb-6">
                <label
                  htmlFor="teacherCode"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <KeyRound size={18} />
                  </div>
                  <input
                    id="teacherCode"
                    type="text"
                    value={teacherCode}
                    onChange={(e) => setTeacherCode(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter teacher enrollment code"
                    required={role === "teacher"}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This code is provided by your institution.
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading && !error}
              disabled={isLoading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-interactive hover:underline font-medium">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;