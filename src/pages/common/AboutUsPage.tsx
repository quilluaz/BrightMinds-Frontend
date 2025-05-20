import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // For any internal links
import { Users, Lightbulb, Sparkles } from 'lucide-react';

const teamMembers = [
  {
    name: "Jeric",
    role: "Back-end & Matching Game Dev",
    funFact: "Enjoys architecting robust systems and interactive game logic.",
    imagePlaceholder: "/images/placeholders/jeric-avatar.png", // Replace with actual path or a generic one
  },
  {
    name: "Isaac",
    role: "Creative UI/UX Lead",
    funFact: "Passionate about intuitive design and engaging user experiences.",
    imagePlaceholder: "/images/placeholders/isaac-avatar.png",
  },
  {
    name: "Zeke",
    role: "PM & Sorting Game Dev",
    funFact: "Leads project vision and crafts fun sorting challenges.",
    imagePlaceholder: "/images/placeholders/zeke-avatar.png",
  },
  {
    name: "Alexander",
    role: "The Planner & Strategist",
    funFact: "Keeps the project on track and aligns features with educational goals.",
    imagePlaceholder: "/images/placeholders/alexander-avatar.png",
  },
  {
    name: "Selina",
    role: "Details Expert & Quiz Game Dev",
    funFact: "Focuses on refining game mechanics and ensuring educational accuracy.",
    imagePlaceholder: "/images/placeholders/selina-avatar.png",
  },
];

// Team Member Card Component (adapted for BrightMinds)
interface TeamMemberProps {
  name: string;
  role: string;
  funFact: string;
  imagePlaceholder: string;
}

const TeamMemberCard: React.FC<TeamMemberProps> = ({ name, role, funFact, imagePlaceholder }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative w-48 h-48 mb-12 text-center"> {/* Increased size and margin for better display */}
      <div
        className="relative w-full h-full cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105 group"
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        {/* Front of the card (Image) */}
        <div
          className={`absolute w-full h-full rounded-full transition-opacity duration-500 ease-in-out ${
            isFlipped ? "opacity-0" : "opacity-100"
          }`}
        >
          <img
            src={imagePlaceholder} // Using placeholder
            alt={name}
            className="rounded-full w-full h-full object-cover shadow-lg border-4 border-white dark:border-primary-card-dark"
          />
        </div>
        {/* Back of the card (Fun Fact) */}
        <div
          className={`absolute w-full h-full rounded-full bg-primary-accent dark:bg-primary-accent-dark bg-opacity-80 dark:bg-opacity-80 flex items-center justify-center p-4 text-center text-primary-text dark:text-black transition-opacity duration-500 ease-in-out ${
            isFlipped ? "opacity-100" : "opacity-0"
          } shadow-lg`}
        >
          <p className="text-sm font-semibold">{funFact}</p>
        </div>
      </div>
      {/* Name and Role below card */}
      <div className="mt-4">
        <h3 className="font-bold text-xl text-primary-text dark:text-primary-text-dark">{name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
      </div>
    </div>
  );
};

const AboutUsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-primary-background dark:bg-primary-background-dark">
      {/* Main content is already within AppLayout which includes Header and Footer */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 md:py-24 text-center bg-gradient-to-b from-primary-interactive/10 to-primary-background dark:from-primary-interactive-dark/10 dark:to-primary-background-dark">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Lightbulb className="text-primary-accent dark:text-primary-accent-dark h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-text dark:text-primary-text-dark mb-4">
              About BrightMinds
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Sparking curiosity and making learning Tagalog and Araling Panlipunan an adventure for Grade 3 students.
            </p>
          </div>
        </section>

        {/* What is BrightMinds Section */}
        <section className="py-16 lg:py-20 bg-white dark:bg-primary-card-dark shadow-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl font-bold text-primary-text dark:text-primary-text-dark mb-6">
                  What is BrightMinds?
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                  BrightMinds is an interactive educational platform designed to help Grade 3 students in the Philippines learn Tagalog and Araling Panlipunan (Social Studies) in a fun and engaging way.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                  We believe that learning should be an exciting journey. Our platform uses gamified activities, interactive quizzes, and a supportive classroom environment to foster a love for learning these crucial subjects.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  For teachers, BrightMinds offers tools to create and manage virtual classrooms, assign activities, and track student progress, making education more effective and enjoyable.
                </p>
              </div>
              <div className="order-1 md:order-2 flex justify-center">
                {/* Placeholder for an image representing BrightMinds' concept */}
                <img
                  src="/images/placeholders/educational-concept.png" // Replace with actual path
                  alt="BrightMinds Educational Concept"
                  className="w-full max-w-md h-auto object-contain rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-16 lg:py-20 bg-primary-background dark:bg-primary-background-dark">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <Sparkles className="text-primary-energetic dark:text-primary-energetic-dark h-16 w-16 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-primary-text dark:text-primary-text-dark mb-6">
                    Our Mission
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-4">
                    To empower young learners with a strong foundation in Filipino language and culture through innovative and engaging digital experiences.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                    We aim to make education accessible, enjoyable, and effective, helping students to not just learn, but to love learning.
                </p>
            </div>
        </section>


        {/* Team Section */}
        <section className="py-16 lg:py-20 bg-white dark:bg-primary-card-dark shadow-inner">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Users className="text-primary-interactive dark:text-primary-interactive-dark h-16 w-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-primary-text dark:text-primary-text-dark mb-4">
                Meet the BrightMinds Team
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                "J.I.Z.A.S." was the minds behind the creation of BrightMinds, a group of five passionate and ambitious CIT-U BSIT college students
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-16">
              {teamMembers.map((member) => (
                <TeamMemberCard
                  key={member.name}
                  name={member.name}
                  role={member.role}
                  funFact={member.funFact}
                  imagePlaceholder={member.imagePlaceholder}
                />
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default AboutUsPage;