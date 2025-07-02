import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // For animations

import boyplaying from "../assets/boyplaying.mp4"; // Make sure the file name matches your actual video file
import logowhite from "../assets/Logo white.png";

import {
  ArrowRightIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  VideoCameraIcon,
  StarIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  UsersIcon,
  ChartBarIcon,
  PlusCircleIcon, // Using for Club Creation
} from "@heroicons/react/24/outline"; // Using outline style for a modern feel

// --- ANIMATION VARIANTS (for Framer Motion) ---
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Each child will animate 0.15s after the previous one
      delayChildren: 0.2,
    },
  },
};

// --- REUSABLE COMPONENTS ---

// Updated FeatureCard to accept an IconComponent as a prop for flexibility
const FeatureCard = ({ IconComponent, title, description, iconClassName }) => (
  <motion.div
    variants={cardVariants}
    className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-2xl transition-shadow duration-300 flex flex-col text-center group h-full"
  >
    <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 self-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-sky-100 group-hover:to-blue-200">
      <IconComponent
        className={`w-10 h-10 transition-colors duration-300 ${iconClassName}`}
      />
    </div>
    <h3 className="mb-3 text-xl font-bold text-slate-800">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed flex-grow mb-4">
      {description}
    </p>
  </motion.div>
);

const HomePage = () => {
  const navigate = useNavigate();

  // Reusable button styles for consistency
  const ctaButtonBase =
    "inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out transform hover:scale-105 group";
  const ctaButtonPrimary = `${ctaButtonBase} text-white bg-sky-600 hover:bg-sky-700 focus:ring-sky-500`;
  const ctaButtonSecondary = `${ctaButtonBase} text-sky-700 bg-white hover:bg-sky-50 focus:ring-sky-500`;
  const ctaButtonTeal = `${ctaButtonBase} text-white bg-teal-600 hover:bg-teal-700 focus:ring-teal-500`;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section with Video Background */}
      <section className="relative h-[70vh] sm:h-[880px] flex items-center justify-center text-white overflow-hidden">
        {/* Video Background */}
        <video
          src={boyplaying}
          autoPlay
          loop
          muted
          playsInline // Important for iOS mobile devices
          className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover" // Ensures video covers the container
        />
        {/* Darkening Overlay for text readability */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>

        {/* Hero Content */}
        <motion.div
          className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight drop-shadow-lg
                 flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-4"
          >
            Welcome to
            <span className="inline-block align-middle">
              <img
                src={logowhite}
                alt="Footballkhelo.in Logo"
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto"
              />
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-200 mb-12 leading-relaxed drop-shadow-md">
            Discover, manage, and excel in the world of football. Footballkhelo.in
            connects players, coaches, and clubs in one dynamic platform.
          </p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <button
              onClick={() => navigate("/register?role=Coach")}
              className={ctaButtonPrimary}
            >
              I'm a Coach{" "}
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/clubs")}
              className={ctaButtonSecondary}
            >
              I'm a Player{" "}
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Call to Action Sections with Scroll Animation */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-stretch">
            {/* Coach CTA Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
              }}
              className="bg-slate-50 p-8 sm:p-10 rounded-xl shadow-xl border border-slate-200 text-center flex flex-col hover:border-sky-400 transition-colors duration-300"
            >
              <div className="mb-6 flex justify-center">
                <ShieldCheckIcon className="w-16 h-16 text-sky-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
                For Coaches & Club Admins
              </h2>
              <p className="text-slate-600 mb-8 text-md leading-relaxed flex-grow">
                Elevate your club management. Register your team, manage your
                roster, track player performance, and organize engaging
                tournaments.
              </p>
              <button
                onClick={() => navigate("/register?role=Coach")}
                className={`${ctaButtonPrimary} w-full sm:w-auto mt-auto`}
              >
                Register Your Club{" "}
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Player CTA Card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
              }}
              className="bg-slate-50 p-8 sm:p-10 rounded-xl shadow-xl border border-slate-200 text-center flex flex-col hover:border-teal-400 transition-colors duration-300"
            >
              <div className="mb-6 flex justify-center">
                <UserGroupIcon className="w-16 h-16 text-teal-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
                For Aspiring Players
              </h2>
              <p className="text-slate-600 mb-8 text-md leading-relaxed flex-grow">
                Ready to take the field? Browse and enroll in clubs, showcase
                your talent by uploading highlight reels, and build your player
                profile.
              </p>
              <button
                onClick={() => navigate("/clubs")}
                className={`${ctaButtonTeal} w-full sm:w-auto mt-auto`}
              >
                Find a Club{" "}
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-16 sm:py-24 bg-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={cardVariants}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
              Platform Features
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Footballkhelo.in is packed with tools to enhance your football experience.
            </p>
          </motion.div>

          <div className="mb-16">
            <h3 className="text-2xl sm:text-3xl font-semibold text-teal-600 mb-10 text-center relative pb-3 after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:w-20 after:h-1 after:bg-teal-500 after:rounded-full">
              Player Benefits
            </h3>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={gridContainerVariants}
            >
              <FeatureCard
                IconComponent={UserGroupIcon}
                title="Club Enrollment"
                description="Easily find and join football clubs that align with your goals and skill level."
                iconClassName="text-teal-600 group-hover:text-teal-700"
              />
              <FeatureCard
                IconComponent={VideoCameraIcon}
                title="Highlight Reels"
                description="Upload and share your best match moments and skills to get noticed."
                iconClassName="text-teal-600 group-hover:text-teal-700"
              />
              <FeatureCard
                IconComponent={StarIcon}
                title="Score & Progress Tracking"
                description="Monitor your performance with our dynamic score system and track your development."
                iconClassName="text-teal-600 group-hover:text-teal-700"
              />
              <FeatureCard
                IconComponent={UserCircleIcon}
                title="Detailed Player Profiles"
                description="Maintain a comprehensive profile with stats, bio, jersey number, and more."
                iconClassName="text-teal-600 group-hover:text-teal-700"
              />
              <FeatureCard
                IconComponent={ClipboardDocumentListIcon}
                title="Payment Management"
                description="Keep track of club fees and view your payment history seamlessly."
                iconClassName="text-teal-600 group-hover:text-teal-700"
              />
              <FeatureCard
                IconComponent={TrophyIcon}
                title="Tournament Participation"
                description="Discover and participate in tournaments hosted by clubs on Footballkhelo.in."
                iconClassName="text-teal-600 group-hover:text-teal-700"
              />
            </motion.div>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-sky-600 mb-10 text-center relative pb-3 after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:w-20 after:h-1 after:bg-sky-500 after:rounded-full">
              Coach & Club Benefits
            </h3>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={gridContainerVariants}
            >
              <FeatureCard
                IconComponent={PlusCircleIcon}
                title="Club Creation & Customization"
                description="Establish your club's presence with a detailed profile, logo, and captivating banner images."
                iconClassName="text-sky-600 group-hover:text-sky-700"
              />
              <FeatureCard
                IconComponent={UsersIcon}
                title="Comprehensive Player Management"
                description="Manage your team roster, update player positions, assign scores, and track payments."
                iconClassName="text-sky-600 group-hover:text-sky-700"
              />
              <FeatureCard
                IconComponent={ChartBarIcon}
                title="Dynamic Scoring System"
                description="Utilize our flexible scoring system to evaluate player performance and progress."
                iconClassName="text-sky-600 group-hover:text-sky-700"
              />
              <FeatureCard
                IconComponent={VideoCameraIcon}
                title="Scout Player Reels"
                description="Discover new talent by reviewing player-uploaded highlight videos."
                iconClassName="text-sky-600 group-hover:text-sky-700"
              />
              <FeatureCard
                IconComponent={UserCircleIcon}
                title="Coach Profile Management"
                description="Showcase your coaching credentials, experience, and club affiliations."
                iconClassName="text-sky-600 group-hover:text-sky-700"
              />
              <FeatureCard
                IconComponent={TrophyIcon}
                title="Organize Tournaments"
                description="Create, manage, and promote football tournaments directly on the platform."
                iconClassName="text-sky-600 group-hover:text-sky-700"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
