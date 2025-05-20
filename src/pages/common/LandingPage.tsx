import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenCheck, Star, Users, Trophy, Sparkles, Globe } from 'lucide-react';
import Button from '../../components/common/Button';


const LandingPage: React.FC = () => {

  const imageKitUrlEndpoint = 'https://ik.imagekit.io/JISQCITU/';
  const heroImageFolderPath = 'shared-assets/';
  const heroImageName = 'LandingPage.png';
  
  // Optimized ImageKit URL with transformations
  // w-550: Target width slightly above max display width for sharpness
  // q-80: Quality level 80
  // ImageKit will auto-convert format (e.g., PNG to WebP/AVIF)
  const optimizedHeroImageUrl = `${imageKitUrlEndpoint}tr:w-550,q-80/${heroImageFolderPath}${heroImageName}`;

  return (
    <>
      <section className="bg-gradient-to-b from-primary-background to-white dark:from-primary-background-dark dark:to-primary-background-dark py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 lg:w-3/5 text-center md:text-left mb-10 md:mb-0 md:pr-8 lg:pr-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-text dark:text-primary-text-dark mb-6 leading-tight">
                Making Learning Fun for Grade 3 Students
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-8">
                BrightMinds helps students learn Tagalog and Araling Panlipunan through interactive games and activities in a supportive classroom environment.
              </p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                <Link to="/register">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="md:w-1/2 lg:w-2/5 flex justify-center">
              <img 
                src={optimizedHeroImageUrl} 
                alt="BrightMinds Landing Page Hero"
                className="rounded-lg shadow-xl w-full max-w-md lg:max-w-lg h-auto object-cover" 
              />
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-primary-card dark:bg-primary-card-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-text dark:text-primary-text-dark mb-4">Why Choose BrightMinds?</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform makes learning engaging and effective for both students and teachers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-primary-background dark:bg-primary-background-dark rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary-interactive bg-opacity-10 dark:bg-primary-interactive-dark dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={28} className="text-primary-interactive dark:text-primary-interactive-dark" />
              </div>
              <h3 className="text-xl font-semibold text-primary-text dark:text-primary-text-dark mb-3">Gamified Learning</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Turn studying into fun through interactive games, challenges, and rewards
              </p>
            </div>
            
            <div className="bg-primary-background dark:bg-primary-background-dark rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary-energetic bg-opacity-10 dark:bg-primary-energetic-dark dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe size={28} className="text-primary-energetic dark:text-primary-energetic-dark" />
              </div>
              <h3 className="text-xl font-semibold text-primary-text dark:text-primary-text-dark mb-3">Filipino Culture Focus</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Learn Tagalog and Araling Panlipunan with context and cultural appreciation
              </p>
            </div>
            
            <div className="bg-primary-background dark:bg-primary-background-dark rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary-accent bg-opacity-10 dark:bg-primary-accent-dark dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-primary-accent dark:text-primary-accent-dark" />
              </div>
              <h3 className="text-xl font-semibold text-primary-text dark:text-primary-text-dark mb-3">Track Progress</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Monitor learning achievements and celebrate improvements over time
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-primary-card dark:bg-primary-card-dark rounded-xl shadow-lg p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-primary-interactive bg-opacity-10 dark:bg-primary-interactive-dark dark:bg-opacity-20 rounded-bl-full"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary-interactive bg-opacity-20 dark:bg-primary-interactive-dark dark:bg-opacity-30 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Users size={24} className="text-primary-interactive dark:text-primary-interactive-dark" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-text dark:text-primary-text-dark">For Teachers</h3>
                </div>
                <ul className="space-y-3 text-primary-text dark:text-primary-text-dark mb-8">
                   <li className="flex items-start">
                    <Star size={16} className="text-primary-energetic dark:text-primary-energetic-dark mr-3 mt-1 flex-shrink-0" />
                    <span>Create and manage virtual classrooms</span>
                  </li>
                  <li className="flex items-start">
                    <Star size={16} className="text-primary-energetic dark:text-primary-energetic-dark mr-3 mt-1 flex-shrink-0" />
                    <span>Track student progress with detailed analytics</span>
                  </li>
                  <li className="flex items-start">
                    <Star size={16} className="text-primary-energetic dark:text-primary-energetic-dark mr-3 mt-1 flex-shrink-0" />
                    <span>Assign learning activities to individuals or groups</span>
                  </li>
                  <li className="flex items-start">
                    <Star size={16} className="text-primary-energetic dark:text-primary-energetic-dark mr-3 mt-1 flex-shrink-0" />
                    <span>Use pre-made activities or create custom ones</span>
                  </li>
                </ul>
                <Link to="/register?role=teacher">
                  <Button variant="primary" fullWidth>
                    Join as Teacher
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-primary-card dark:bg-primary-card-dark rounded-xl shadow-lg p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-primary-accent bg-opacity-10 dark:bg-primary-accent-dark dark:bg-opacity-20 rounded-bl-full"></div>
               <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary-accent bg-opacity-20 dark:bg-primary-accent-dark dark:bg-opacity-30 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <BookOpenCheck size={24} className="text-primary-accent dark:text-primary-accent-dark" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-text dark:text-primary-text-dark">For Students</h3>
                </div>
                <ul className="space-y-3 text-primary-text dark:text-primary-text-dark mb-8">
                  <li className="flex items-start">
                    <Star size={16} className="text-primary-energetic dark:text-primary-energetic-dark mr-3 mt-1 flex-shrink-0" />
                    <span>Join classrooms with simple codes</span>
                  </li>
                  <li className="flex items-start">
                    <Star size={16} className="text-primary-energetic dark:text-primary-energetic-dark mr-3 mt-1 flex-shrink-0" />
                    <span>Learn through fun interactive games</span>
                  </li>
                  <li className="flex items-start">
                    <Star size={16} className="text-primary-energetic dark:text-primary-energetic-dark mr-3 mt-1 flex-shrink-0" />
                    <span>Earn points and see your rank on leaderboards</span>
                  </li>
                  <li className="flex items-start">
                    <Star size={16} className="text-primary-energetic dark:text-primary-energetic-dark mr-3 mt-1 flex-shrink-0" />
                    <span>Track your progress and celebrate achievements</span>
                  </li>
                </ul>
                <Link to="/register?role=student">
                  <Button variant="accent" fullWidth>
                    Join as Student
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-primary-card dark:bg-primary-card-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6">
              <div className="inline-flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={24} className="text-yellow-400 dark:text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
            <blockquote className="text-xl md:text-2xl italic text-gray-700 dark:text-gray-300 mb-6">
              "BrightMinds has transformed how our students learn Tagalog and Araling Panlipunan. The engaging activities and progress tracking make teaching and learning more effective and enjoyable for everyone."
            </blockquote>
            <div>
              <p className="font-semibold text-primary-text dark:text-primary-text-dark">Ms. Santos</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Grade 3 Teacher, Manila Elementary School</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-primary-interactive bg-opacity-10 dark:bg-primary-interactive-dark dark:bg-opacity-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-text dark:text-primary-text-dark mb-4">Ready to Make Learning Fun?</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join BrightMinds today and transform how Grade 3 students learn Tagalog and Araling Panlipunan
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to="/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Create Free Account
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;