import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenCheck, Star, Users, Trophy, Sparkles, Globe } from 'lucide-react';
import Button from '../../components/common/Button';

const LandingPage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-background to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-4 leading-tight">
                Making Learning Fun for Grade 3 Students
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                BrightMinds helps students learn Tagalog and Araling Panlipunan through interactive games and activities in a supportive classroom environment.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Link to="/register">
                  <Button variant="primary" size="lg">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="md:w-1/2 md:pl-8 flex justify-center">
              <img 
                src="https://images.pexels.com/photos/5905497/pexels-photo-5905497.jpeg" 
                alt="Children learning" 
                className="rounded-lg shadow-lg max-w-full h-auto" 
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-text mb-4">Why Choose BrightMinds?</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Our platform makes learning engaging and effective for both students and teachers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-primary-background rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary-interactive bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={28} className="text-primary-interactive" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gamified Learning</h3>
              <p className="text-gray-700">
                Turn studying into fun through interactive games, challenges, and rewards
              </p>
            </div>
            
            <div className="bg-primary-background rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary-energetic bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe size={28} className="text-primary-energetic" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Filipino Culture Focus</h3>
              <p className="text-gray-700">
                Learn Tagalog and Araling Panlipunan with context and cultural appreciation
              </p>
            </div>
            
            <div className="bg-primary-background rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-primary-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Track Progress</h3>
              <p className="text-gray-700">
                Monitor learning achievements and celebrate improvements over time
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Teacher & Student Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-xl shadow-sm p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-interactive bg-opacity-10 rounded-bl-full"></div>
              
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary-interactive bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <Users size={24} className="text-primary-interactive" />
                </div>
                <h3 className="text-2xl font-bold">For Teachers</h3>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Star size={16} className="text-primary-energetic mr-2 flex-shrink-0" />
                  <span>Create and manage virtual classrooms</span>
                </li>
                <li className="flex items-center">
                  <Star size={16} className="text-primary-energetic mr-2 flex-shrink-0" />
                  <span>Track student progress with detailed analytics</span>
                </li>
                <li className="flex items-center">
                  <Star size={16} className="text-primary-energetic mr-2 flex-shrink-0" />
                  <span>Assign learning activities to individuals or groups</span>
                </li>
                <li className="flex items-center">
                  <Star size={16} className="text-primary-energetic mr-2 flex-shrink-0" />
                  <span>Use pre-made activities or create custom ones</span>
                </li>
              </ul>
              
              <Link to="/register">
                <Button variant="primary" fullWidth>
                  Join as Teacher
                </Button>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-accent bg-opacity-10 rounded-bl-full"></div>
              
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary-accent bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <BookOpenCheck size={24} className="text-primary-accent" />
                </div>
                <h3 className="text-2xl font-bold">For Students</h3>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Star size={16} className="text-primary-energetic mr-2 flex-shrink-0" />
                  <span>Join classrooms with simple codes</span>
                </li>
                <li className="flex items-center">
                  <Star size={16} className="text-primary-energetic mr-2 flex-shrink-0" />
                  <span>Learn through fun interactive games</span>
                </li>
                <li className="flex items-center">
                  <Star size={16} className="text-primary-energetic mr-2 flex-shrink-0" />
                  <span>Earn points and see your rank on leaderboards</span>
                </li>
                <li className="flex items-center">
                  <Star size={16} className="text-primary-energetic mr-2 flex-shrink-0" />
                  <span>Track your progress and celebrate achievements</span>
                </li>
              </ul>
              
              <Link to="/register">
                <Button variant="accent" fullWidth>
                  Join as Student
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonial */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6">
              <div className="inline-flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={24} className="text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
            
            <blockquote className="text-xl md:text-2xl italic text-gray-700 mb-6">
              "BrightMinds has transformed how our students learn Tagalog and Araling Panlipunan. The engaging activities and progress tracking make teaching and learning more effective and enjoyable for everyone."
            </blockquote>
            
            <div>
              <p className="font-semibold">Ms. Santos</p>
              <p className="text-sm text-gray-600">Grade 3 Teacher, Manila Elementary School</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary-interactive bg-opacity-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-text mb-4">Ready to Make Learning Fun?</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Join BrightMinds today and transform how Grade 3 students learn Tagalog and Araling Panlipunan
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to="/register">
              <Button variant="primary" size="lg">
                Create Free Account
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg">
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