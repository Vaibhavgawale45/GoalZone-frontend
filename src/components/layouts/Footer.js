// client/src/components/layout/Footer.js

import React from 'react';
import { Link } from 'react-router-dom';
import logowhite from '../../assets/Logo white.png';
// Using professional SVG icons from react-icons
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

// Data for footer links to make the component cleaner and easier to manage
const footerLinkData = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Browse Clubs', to: '/clubs' },
      { label: 'Player Reels', to: '/reels' },
      { label: 'About Us', to: '/about' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'For Users',
    links: [
      { label: 'Login', to: '/login' },
      { label: 'Register', to: '/register' },
      { label: 'My Profile', to: '/profile' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms of Service', to: '/terms-of-service' },
    ],
  },
];

// A small, reusable component for rendering link columns
const FooterLinkColumn = ({ title, links }) => (
  <div>
    <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">{title}</h3>
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.to}>
          <Link
            to={link.to}
            className="text-slate-400 hover:text-sky-400 text-sm transition-colors duration-300"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 text-slate-300 print:hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Adjusted grid for better responsiveness: 1 col -> 2 cols -> 4 cols */}
        <div className="grid grid-cols-1 gap-y-10 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Column 1: Brand Info & Socials */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1"> {/* On small screens, this takes full width */}
            <Link to="/" className="inline-block">
              <img src={logowhite} alt="Footballkhelo.in Logo" className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Connecting the football world, one goal at a time. Find clubs, manage teams, and showcase talent.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-slate-400 hover:text-sky-400 transition-colors duration-300">
                <FaFacebookF size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-slate-400 hover:text-sky-400 transition-colors duration-300">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 hover:text-sky-400 transition-colors duration-300">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Columns 2, 3, 4: Mapped from data for cleanliness */}
          {footerLinkData.map((column) => (
            <FooterLinkColumn key={column.title} title={column.title} links={column.links} />
          ))}

        </div>

        <div className="border-t border-slate-700 pt-8 mt-12 text-center text-sm text-slate-400">
          <p>© {currentYear} Footballkhelo.in All rights reserved. Developed with passion.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;