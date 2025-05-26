import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext"; 
import { ClassroomProvider } from "./context/ClassroomContext"; 
import { ThemeProvider } from "./context/ThemeContext"; 

// Layouts and Common Components
import Header from "./components/common/Header"; 
import Footer from "./components/common/Footer"; 
import AuthLayout from "./layouts/AuthLayout"; 

// Auth Pages
import LoginPage from "./pages/auth/LoginPage"; 
import RegisterPage from "./pages/auth/RegisterPage"; 

// Common Pages
import LandingPage from "./pages/common/LandingPage"; 
import DashboardPage from "./pages/common/DashboardPage"; 
import ProfilePage from "./pages/common/ProfilePage"; 
import AboutUsPage from "./pages/common/AboutUsPage"; 
import PrivacyPolicyPage from "./pages/common/PrivacyPolicyPage"; 

// Teacher Pages
import TeacherClassroomsPage from "./pages/teacher/TeacherClassroomsPage"; 
import TeacherClassroomViewPage from "./pages/teacher/TeacherClassroomViewPage"; 

// Student Pages
import StudentClassroomsPage from "./pages/student/StudentClassroomsPage"; 
import StudentClassroomViewPage from "./pages/student/StudentClassroomViewPage"; 
import GameplayPage from "./pages/student/GameplayPage"; 

// Game components
import ImageMultipleChoiceGame from "./components/game/Selina/ImageMultipleChoiceGame";
import MatchingGamePage from "./components/game/Jeric/MatchingGamePage";
import LikasYamanGame from "./components/game/Zeke/LikasYamanGame";
import FourPicsOneWord from "./components/game/Mae/4Pics1Word";

// --- ProtectedRoute Component ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// --- RoleRoute Component (Adjusted) ---
const RoleRoute = ({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: "TEACHER" | "STUDENT"; 
}) => {
  const { currentUser, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }


  return <>{children}</>;
};

// --- AppLayout Component ---
const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-pattern dark:bg-primary-background-dark">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// --- Main App Component ---
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ClassroomProvider>
          <Router>
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              <Route element={<AppLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route
                  path="/image-quiz"
                  element={<ImageMultipleChoiceGame />}
                />
                <Route
                  path="/matching-game-test"
                  element={<MatchingGamePage />}
                />
                <Route
                  path="/likas-yaman"
                  element={<LikasYamanGame />}
                />
                <Route
                  path="/4pics1word"
                  element={<FourPicsOneWord />}
                />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />

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

                <Route
                  path="/teacher/classrooms"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRole="TEACHER">
                        <TeacherClassroomsPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/classrooms/:classroomId"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRole="TEACHER">
                        <TeacherClassroomViewPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/student/classrooms"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRole="STUDENT">
                        <StudentClassroomsPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/classrooms/:classroomId"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRole="STUDENT">
                        <StudentClassroomViewPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/classrooms/:classroomId/games/:gameId"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRole="STUDENT">
                        <GameplayPage />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
        </ClassroomProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;