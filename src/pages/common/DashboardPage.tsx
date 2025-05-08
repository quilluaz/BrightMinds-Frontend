import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, TrendingUp, Clock } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useClassroom } from '../../context/ClassroomContext';

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { teacherClassrooms, studentClassrooms } = useClassroom();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  if (!currentUser) {
    return null;
  }
  
  // Redirect to appropriate classrooms page based on role
  const goToClassrooms = () => {
    if (currentUser.role === 'teacher') {
      navigate('/teacher/classrooms');
    } else {
      navigate('/student/classrooms');
    }
  };

  // Get first name for greeting
  const firstName = currentUser.name.split(' ')[0];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary-text">
          Welcome back, {firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          {currentUser.role === 'teacher'
            ? 'Manage your classrooms and track student progress'
            : 'Continue your learning journey'
          }
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Classrooms</h3>
            <BookOpen size={24} className="text-primary-interactive" />
          </div>
          <p className="text-3xl font-bold">
            {currentUser.role === 'teacher' ? teacherClassrooms.length : studentClassrooms.length}
          </p>
          <div className="mt-4">
            <Button variant="text" size="sm" onClick={goToClassrooms}>
              View All
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">
              {currentUser.role === 'teacher' ? 'Students' : 'Score'}
            </h3>
            <Award size={24} className="text-primary-energetic" />
          </div>
          <p className="text-3xl font-bold">
            {currentUser.role === 'teacher' ? '25' : '850'}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {currentUser.role === 'teacher'
              ? 'Total enrolled students'
              : 'Total points earned'
            }
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">
              {currentUser.role === 'teacher' ? 'Activities' : 'Completed'}
            </h3>
            <TrendingUp size={24} className="text-primary-accent" />
          </div>
          <p className="text-3xl font-bold">
            {currentUser.role === 'teacher' ? '13' : '8'}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {currentUser.role === 'teacher'
              ? 'Active learning games'
              : 'Learning activities'
            }
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">
              {currentUser.role === 'teacher' ? 'Avg. Score' : 'Next Activity'}
            </h3>
            <Clock size={24} className="text-blue-500" />
          </div>
          {currentUser.role === 'teacher' ? (
            <>
              <p className="text-3xl font-bold">78%</p>
              <p className="text-gray-600 text-sm mt-1">
                Average student score
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">Tagalog Verbs</p>
              <p className="text-sm text-gray-600 mt-1">Due in 3 days</p>
              <div className="mt-3">
                <Button variant="text" size="sm">
                  Start Now
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            <div className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full p-2 mr-3">
                  <BookOpen size={16} />
                </div>
                <div>
                  <p className="font-medium">
                    {currentUser.role === 'teacher'
                      ? 'Maria Santos completed "Tukuyin ang Pangngalan"'
                      : 'You completed "Tukuyin ang Pangngalan"'
                    }
                  </p>
                  <p className="text-sm text-gray-600 mt-1">1 hour ago</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start">
                <div className="bg-green-100 text-green-600 rounded-full p-2 mr-3">
                  <Award size={16} />
                </div>
                <div>
                  <p className="font-medium">
                    {currentUser.role === 'teacher'
                      ? 'New student joined "Araling Panlipunan: Luzon"'
                      : 'You earned 85 points in "Tukuyin ang Pangngalan"'
                    }
                  </p>
                  <p className="text-sm text-gray-600 mt-1">3 hours ago</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start">
                <div className="bg-purple-100 text-purple-600 rounded-full p-2 mr-3">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <p className="font-medium">
                    {currentUser.role === 'teacher'
                      ? 'Class average improved by 5% this week'
                      : 'You reached the top 3 in your classroom'
                    }
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold">
              {currentUser.role === 'teacher' ? 'Quick Actions' : 'Learning Progress'}
            </h2>
          </div>
          
          {currentUser.role === 'teacher' ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/teacher/classrooms')}
                >
                  Manage Classrooms
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                >
                  Create New Activity
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                >
                  View Student Reports
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/profile')}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Tagalog</span>
                  <span className="text-sm text-gray-600">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary-interactive h-2.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Araling Panlipunan</span>
                  <span className="text-sm text-gray-600">35%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary-energetic h-2.5 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/student/classrooms')}
                >
                  Continue Learning
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;