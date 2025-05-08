import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Lucide-react icons
import {
  BookOpenCheck,
  Mail,
  Lock,
  User,
  AlertCircle,
  KeyRound,
} from "lucide-react";
// Create a simple Microsoft logo component instead of importing from phosphor-react
const MicrosoftLogo = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M11.4 3H3V11.4H11.4V3Z" fill="#F25022" />
    <path d="M11.4 12.6H3V21H11.4V12.6Z" fill="#00A4EF" />
    <path d="M21 3H12.6V11.4H21V3Z" fill="#7FBA00" />
    <path d="M21 12.6H12.6V21H21V12.6Z" fill="#FFB900" />
  </svg>
);

import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import { UserRole } from "../../types";

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [teacherCode, setTeacherCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { register, loginWithMicrosoft, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === "teacher" && !teacherCode.trim()) {
      setError("Teacher code is required for teacher registration.");
      return;
    }

    try {
      await register(
        name,
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

  const handleMicrosoftLogin = async () => {
    setError(null);
    try {
      await loginWithMicrosoft();
      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred with Microsoft Sign-In"
      );
    }
  };

  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card border border-gray-100 animate-fade-in">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <BookOpenCheck size={40} className="text-primary-interactive" />
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
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <User size={18} />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

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

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <Button
            onClick={handleMicrosoftLogin}
            variant="secondary"
            fullWidth
            isLoading={isLoading && !error}
            disabled={isLoading}
            className="flex items-center justify-center border border-gray-300">
            <MicrosoftLogo />
            <span className="ml-2">Sign up with Microsoft</span>
          </Button>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-interactive hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
