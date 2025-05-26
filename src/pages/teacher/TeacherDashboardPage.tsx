// src/pages/teacher/TeacherDashboardPage.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Award, TrendingUp, Clock } from "lucide-react";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useClassroom } from "../../context/ClassroomContext";

const TeacherDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { teacherClassrooms } = useClassroom();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else if (currentUser.role !== "TEACHER") {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== "TEACHER") {
    return null;
  }

  const goToClassrooms = () => {
    navigate("/teacher/classrooms");
  };

  const firstName = currentUser.name.split(" ")[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary-text dark:text-primary-text-dark">
          Welcome back, {firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Manage your classrooms and track student progress
        </p>
      </header>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Classrooms */}
        <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-primary-text dark:text-primary-text-dark">
              Classrooms
            </h3>
            <BookOpen
              size={24}
              className="text-primary-interactive dark:text-primary-interactive-dark"
            />
          </div>
          <p className="text-3xl font-bold text-primary-text dark:text-primary-text-dark">
            {teacherClassrooms.length}
          </p>
          <div className="mt-4">
            <Button variant="text" size="sm" onClick={goToClassrooms}>
              View All
            </Button>
          </div>
        </div>

        {/* Card 2: Students */}
        <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-primary-text dark:text-primary-text-dark">
              Students
            </h3>
            <Award
              size={24}
              className="text-primary-energetic dark:text-primary-energetic-dark"
            />
          </div>
          <p className="text-3xl font-bold text-primary-text dark:text-primary-text-dark">
            25 {/* This is mock data, ideally fetch real count */}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Total enrolled students
          </p>
        </div>

        {/* Card 3: Activities */}
        <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-primary-text dark:text-primary-text-dark">
              Activities
            </h3>
            <TrendingUp
              size={24}
              className="text-primary-accent dark:text-primary-accent-dark"
            />
          </div>
          <p className="text-3xl font-bold text-primary-text dark:text-primary-text-dark">
            13 {/* This is mock data, ideally fetch real count */}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Active learning games
          </p>
        </div>

        {/* Card 4: Avg. Score */}
        <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-primary-text dark:text-primary-text-dark">
              Avg. Score
            </h3>
            <Clock size={24} className="text-blue-500 dark:text-blue-400" />
          </div>
          <>
            <p className="text-3xl font-bold text-primary-text dark:text-primary-text-dark">
              78%
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Average student score
            </p>
          </>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-primary-text dark:text-primary-text-dark">
              Recent Activity
            </h2>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {/* Activity Item 1 */}
            <div className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-full p-2 mr-3">
                  <BookOpen size={16} />
                </div>
                <div>
                  <p className="font-medium text-primary-text dark:text-primary-text-dark">
                    Maria Santos completed "Tukuyin ang Pangngalan"
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    1 hour ago
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-start">
                <div className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 rounded-full p-2 mr-3">
                  <Award size={16} />
                </div>
                <div>
                  <p className="font-medium text-primary-text dark:text-primary-text-dark">
                    New student joined "Araling Panlipunan: Luzon"
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    3 hours ago
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Item 3 */}
            <div className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-start">
                <div className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 rounded-full p-2 mr-3">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <p className="font-medium text-primary-text dark:text-primary-text-dark">
                    Class average improved by 5% this week
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Yesterday
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white dark:bg-primary-card-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-primary-text dark:text-primary-text-dark">
              Quick Actions
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate("/teacher/classrooms")}>
                Manage Classrooms
              </Button>
              <Button variant="outline" fullWidth>
                Create New Activity
              </Button>
              <Button variant="outline" fullWidth>
                View Student Reports
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate("/profile")}>
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
