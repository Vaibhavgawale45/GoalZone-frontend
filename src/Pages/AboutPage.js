// client/src/Pages/AboutPage.js (NEW FILE or update existing)
import React from 'react';

const AboutPage = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-lg max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6 text-center">About GoalZone</h1>
        <div className="prose prose-lg max-w-none text-slate-700"> {/* Using Tailwind Typography prose classes */}
          <p>
            Welcome to GoalZone, your ultimate destination for connecting with local football clubs,
            tracking player progress, and engaging with the football community.
          </p>
          <p>
            Our mission is to provide a seamless platform for players to find clubs that match their
            skill level and aspirations, for coaches to manage their teams effectively, and for
            fans to follow the action.
          </p>
          <h2 className="text-2xl font-semibold text-slate-700 mt-8 mb-3">Our Vision</h2>
          <p>
            We envision a world where every football enthusiast, regardless of their level,
            has the tools and community to pursue their passion for the beautiful game.
            GoalZone aims to be at the forefront of this vision, fostering growth,
            competition, and camaraderie.
          </p>
          {/* Add more content about your platform */}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;