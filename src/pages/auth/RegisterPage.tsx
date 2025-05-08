import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpenCheck, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { UserRole } from '../../types';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
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
            <h1 className="text-2xl font-bold text-primary-text">Create Your Account</h1>
            <p className="text-gray-600 mt-1">Join BrightMinds to start your learning journey</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label 
                  className={`
                    flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                    ${role === 'student' 
                      ? 'border-primary-interactive bg-primary-interactive bg-opacity-10 font-medium' 
                      : 'border-gray-300 hover:border-primary-interactive hover:bg-primary-interactive hover:bg-opacity-5'}
                  `}
                >
                  <input 
                    type="radio" 
                    className="sr-only" 
                    name="role" 
                    value="student"
                    checked={role === 'student'}
                    onChange={() => setRole('student')}
                  />
                  <span>Student</span>
                </label>
                <label 
                  className={`
                    flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all
                    ${role === 'teacher' 
                      ? 'border-primary-interactive bg-primary-interactive bg-opacity-10 font-medium' 
                      : 'border-gray-300 hover:border-primary-interactive hover:bg-primary-interactive hover:bg-opacity-5'}
                  `}
                >
                  <input 
                    type="radio" 
                    className="sr-only" 
                    name="role" 
                    value="teacher"
                    checked={role === 'teacher'}
                    onChange={() => setRole('teacher')}
                  />
                  <span>Teacher</span>
                </label>
              </div>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-interactive hover:underline font-medium">
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