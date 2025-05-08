import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpenCheck, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    }
  };
  
  // Demo credentials
  const setDemoCredentials = (role: 'teacher' | 'student') => {
    if (role === 'teacher') {
      setEmail('teacher@brightminds.com');
      setPassword('password');
    } else {
      setEmail('student@brightminds.com');
      setPassword('password');
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
            <h1 className="text-2xl font-bold text-primary-text">Welcome to BrightMinds</h1>
            <p className="text-gray-600 mt-1">Sign in to continue learning</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
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
            
            <div className="mb-6">
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
                />
              </div>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Sign In
            </Button>
            
            <div className="mt-4 text-center">
              <Link to="/forgot-password" className="text-sm text-primary-interactive hover:underline">
                Forgot your password?
              </Link>
            </div>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-center mb-4">Don't have an account?</p>
            <Link to="/register">
              <Button variant="outline" fullWidth>
                Create Account
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500 mb-3">Demo Accounts:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="text" 
                size="sm"
                onClick={() => setDemoCredentials('teacher')}
              >
                Teacher Demo
              </Button>
              <Button 
                variant="text" 
                size="sm"
                onClick={() => setDemoCredentials('student')}
              >
                Student Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;