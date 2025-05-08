import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ClassroomProvider } from './context/ClassroomContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts and Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Common Pages
import LandingPage from './pages/common/LandingPage';
import DashboardPage from './pages/common/DashboardPage';
import ProfilePage from './pages/common/ProfilePage';

// Teacher Pages
import TeacherClassroomsPage from './pages/teacher/TeacherClassroomsPage';
import TeacherClassroomViewPage from './pages/teacher/TeacherClassroomViewPage';

// Student Pages
import StudentClassroomsPage from './pages/student/StudentClassroomsPage';
import StudentClassroomViewPage from './pages/student/StudentClassroomViewPage';
import GameplayPage from './pages/student/GameplayPage';

// Protected Route HOC
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Role-based Route HOC
const RoleRoute = ({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode;
  allowedRole: 'teacher' | 'student';
}) => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!currentUser || currentUser.role !== allowedRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

// App Layout
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-pattern dark:bg-primary-background-dark">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ClassroomProvider>
          <Router>
            <AppLayout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Teacher Routes */}
                <Route 
                  path="/teacher/classrooms" 
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRole="teacher">
                        <TeacherClassroomsPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/teacher/classrooms/:classroomId" 
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRole="teacher">
                        <TeacherClassroomViewPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Student Routes */}
                <Route 
                  path="/student/classrooms" 
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRole="student">
                        <StudentClassroomsPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/student/classrooms/:classroomId" 
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRole="student">
                        <StudentClassroomViewPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/student/classrooms/:classroomId/games/:gameId" 
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRole="student">
                        <GameplayPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </AppLayout>
          </Router>
        </ClassroomProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;