import React from "react";
import { Menu, X, Moon, Sun, ChevronDown, Library, UsersSquare } from "lucide-react"; // Changed Gamepad2 to Library, UsersSquare
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import logoForLightThemeDesktop from "../../assets/logos/LogoIconSideDark.svg";
import logoForDarkThemeDesktop from "../../assets/logos/LogoIconSideLight.svg";
import logoForLightThemeMobile from "../../assets/logos/LogoIconDark.svg";
import logoForDarkThemeMobile from "../../assets/logos/LogoIconLight.svg";
import UserMenu from "./UserMenu";

const Header: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth(); // Removed logout from here, it's in UserMenu
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  // Removed isGamesMenuOpen as teacher's "Games" dropdown is removed
  const [isPracticeGamesMenuOpen, setIsPracticeGamesMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const getGreeting = (): string => {
    if (!currentUser) return ""; // Handle case where currentUser might be null briefly
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const desktopLogo =
    theme === "light" ? logoForLightThemeDesktop : logoForDarkThemeDesktop;
  const mobileLogo =
    theme === "light" ? logoForLightThemeMobile : logoForDarkThemeMobile;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsUserMenuOpen(false);
    setIsPracticeGamesMenuOpen(false);
  };
  
  const openUserMenu = () => {
    setIsUserMenuOpen(true);
    setIsPracticeGamesMenuOpen(false);
  };

  const openPracticeGamesMenu = () => {
    setIsPracticeGamesMenuOpen(true);
    setIsUserMenuOpen(false);
  };
  
  const closeAllDesktopMenus = () => {
    setIsUserMenuOpen(false);
    setIsPracticeGamesMenuOpen(false);
  }

  const logoLinkPath =
    !isAuthenticated || !currentUser || !currentUser.role
      ? "/"
      : currentUser.role === "TEACHER"
      ? "/teacher/classrooms" // Teachers go to classrooms list
      : currentUser.role === "STUDENT"
      ? "/student/dashboard"
      : "/";

  // UPDATED: Teacher "Dashboard" link now points to their classrooms list
  const teacherDashboardPath = "/teacher/classrooms"; 

  const studentDashboardPath = "/student/dashboard";


  const practiceGameLinks = [
    { to: "/4pics1word", label: "4 Pics 1 Word" },
    { to: "/image-quiz", label: "Image Quiz" },
    { to: "/matching-game-test", label: "Matching Game" },
    { to: "/likas-yaman", label: "Likas Yaman Sort" },
  ];

  return (
    <header className="bg-white dark:bg-primary-card-dark shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between md:justify-between relative md:static">
        <div className="absolute inset-0 flex items-center justify-center md:hidden pointer-events-none">
          <Link to={logoLinkPath} className="inline-flex pointer-events-auto">
            <img
              src={mobileLogo}
              alt="BrightMinds Logo Mobile"
              className="h-8 w-auto"
            />
          </Link>
        </div>

        <Link
          to={logoLinkPath}
          className="hidden md:flex flex-shrink-0 items-center"
        >
          <img
            src={desktopLogo}
            alt="BrightMinds Logo Desktop"
            className="h-8 sm:h-9 w-auto"
          />
        </Link>

        <div className="flex-1 md:hidden"></div>

        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {isAuthenticated && currentUser && currentUser.role && (
            <>
              {currentUser.role === "TEACHER" && (
                <Link
                  to={teacherDashboardPath} // This now links to /teacher/classrooms
                  className="text-sm lg:text-base text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark transition-colors"
                >
                  My Classrooms {/* Changed Label from Dashboard */}
                </Link>
              )}
              {/* "My Classrooms" link for teacher is removed as the above link serves this purpose */}
              
              {currentUser.role === "STUDENT" && (
                <>
                  <Link
                    to={studentDashboardPath}
                    className="text-sm lg:text-base text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/student/classrooms"
                    className="text-sm lg:text-base text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark transition-colors"
                  >
                    My Classrooms
                  </Link>
                </>
              )}
            </>
          )}

          {/* "Games" Dropdown for Unauthenticated users ONLY */}
          {!isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => isPracticeGamesMenuOpen ? closeAllDesktopMenus() : openPracticeGamesMenu()} // Re-using practice games logic for simplicity
                className="flex items-center text-sm lg:text-base text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark transition-colors"
              >
                Explore Games
                <ChevronDown size={16} className={`ml-1 transform transition-transform ${isPracticeGamesMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPracticeGamesMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-primary-card-dark ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    {practiceGameLinks.map(game => (
                       <Link
                        key={game.to}
                        to={game.to}
                        className="block px-4 py-2 text-sm text-primary-text dark:text-primary-text-dark hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={closeAllDesktopMenus}
                      >
                        {game.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* "Practice Games" Dropdown for STUDENTS */}
          {currentUser?.role === "STUDENT" && (
            <div className="relative">
              <button
                onClick={() => isPracticeGamesMenuOpen ? closeAllDesktopMenus() : openPracticeGamesMenu()}
                className="flex items-center text-sm lg:text-base text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark transition-colors"
              >
                Practice Games
                <ChevronDown size={16} className={`ml-1 transform transition-transform ${isPracticeGamesMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPracticeGamesMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-primary-card-dark ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                     {practiceGameLinks.map(game => (
                       <Link
                        key={game.to}
                        to={game.to}
                        className="block px-4 py-2 text-sm text-primary-text dark:text-primary-text-dark hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={closeAllDesktopMenus}
                      >
                        {game.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Global Game Library Link for Teachers (if needed, moved here) */}
          {currentUser?.role === "TEACHER" && (
             <Link
                to="/teacher/games/library" // Example route
                className="text-sm lg:text-base text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark transition-colors flex items-center"
              >
                <Library size={18} className="mr-1.5" /> Game Library
              </Link>
          )}


          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className="text-sm lg:text-base btn btn-outline border border-primary-interactive text-primary-interactive hover:bg-primary-interactive hover:text-white dark:border-primary-interactive-dark dark:text-primary-interactive-dark dark:hover:bg-primary-interactive-dark dark:hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-sm lg:text-base btn btn-primary dark:bg-primary-interactive-dark dark:text-white"
              >
                Sign Up
              </Link>
            </>
          )}

          {isAuthenticated && currentUser && (
            <div className="flex items-center space-x-2 lg:space-x-3">
              <span className="hidden lg:inline text-sm font-medium text-primary-text dark:text-primary-text-dark">
                {getGreeting()}, {currentUser.firstName}!
              </span>
              <span className="lg:hidden text-sm font-medium text-primary-text dark:text-primary-text-dark">
                Hi, {currentUser.firstName}!
              </span>
              <UserMenu isOpen={isUserMenuOpen} setIsOpen={(val) => val ? openUserMenu() : closeAllDesktopMenus()} />
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </nav>

        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-gray-600 dark:text-gray-300" />
            )}
          </button>
          <button
            className="flex-shrink-0 text-primary-text dark:text-primary-text-dark focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-primary-card-dark shadow-lg py-4 px-4 sm:px-6 lg:px-8 animate-fade-in border-t border-gray-100 dark:border-gray-700">
          <nav className="flex flex-col space-y-3">
            {isAuthenticated && currentUser && currentUser.role && (
              <>
                {currentUser.role === "TEACHER" && (
                  <>
                    <Link
                        to={teacherDashboardPath} // Links to /teacher/classrooms
                        className="block text-center px-3 py-2 rounded-md text-base font-medium text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark hover:bg-gray-50 dark:hover:bg-slate-700"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        My Classrooms
                    </Link>
                    <Link
                        to="/teacher/games/library" // Example route for Game Library
                        className="block text-center px-3 py-2 rounded-md text-base font-medium text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark hover:bg-gray-50 dark:hover:bg-slate-700"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Game Library
                    </Link>
                  </>
                )}
                 {currentUser.role === "STUDENT" && (
                  <>
                    <Link
                      to={studentDashboardPath}
                      className="block text-center px-3 py-2 rounded-md text-base font-medium text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark hover:bg-gray-50 dark:hover:bg-slate-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/student/classrooms"
                      className="block text-center px-3 py-2 rounded-md text-base font-medium text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark hover:bg-gray-50 dark:hover:bg-slate-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Classrooms
                    </Link>
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Practice Games</p>
                      {practiceGameLinks.map(game => (
                        <Link
                          key={game.to}
                          to={game.to}
                          className="block text-center px-3 py-2 rounded-md text-base font-medium text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark hover:bg-gray-50 dark:hover:bg-slate-700"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {game.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
                {/* Common mobile menu items for authenticated users */}
                <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="block px-3 text-sm text-center font-medium mb-2 text-primary-text dark:text-primary-text-dark">
                    {getGreeting()}, {currentUser.firstName}!
                  </span>
                  <div className="flex flex-col space-y-1">
                    <Link
                      to="/profile"
                      className="block text-center px-3 py-2 rounded-md text-base font-medium text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark hover:bg-gray-50 dark:hover:bg-slate-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    {/* Logout button is now part of UserMenu, but can be duplicated for mobile if preferred */}
                    <button
                      onClick={() => {
                        // Logic from UserMenu's handleLogout
                        // For now, direct call; ideally, UserMenu's logout would be callable
                        navigate('/login'); 
                        setIsMobileMenuOpen(false);
                        closeAllDesktopMenus();
                        // auth.logout(); // Assuming logout is accessible here or passed down
                      }}
                      className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </>
            )}

            {!isAuthenticated && (
              <>
                 <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Explore Games</p>
                    {practiceGameLinks.map(game => (
                      <Link
                        key={game.to}
                        to={game.to}
                        className="block text-center px-3 py-2 rounded-md text-base font-medium text-primary-text dark:text-primary-text-dark hover:text-primary-interactive dark:hover:text-primary-interactive-dark hover:bg-gray-50 dark:hover:bg-slate-700"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {game.label}
                      </Link>
                    ))}
                  </div>
                <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
                    <Link
                    to="/login"
                    className="block text-center px-3 py-2 rounded-md text-base font-medium border border-gray-300 dark:border-gray-600 text-primary-text dark:text-primary-text-dark hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                    >
                    Log In
                    </Link>
                    <Link
                    to="/register"
                    className="block w-full text-center mt-2 px-3 py-2 rounded-md text-base font-medium btn btn-primary dark:bg-primary-interactive-dark dark:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                    >
                    Register
                    </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;