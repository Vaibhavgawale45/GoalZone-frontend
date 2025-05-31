// client/src/pages/UnauthorizedPage.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center p-6 bg-gray-100">
        <svg className="w-32 h-32 text-red-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636M15 9h.01M9 15h.01"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
      <h1 className="text-5xl font-extrabold text-gray-800 mb-4">Access Denied</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">403 - Forbidden</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Sorry, you do not have the necessary permissions to access this page.
      </p>
      <div className="flex space-x-4">
        <button
            onClick={() => navigate(-1)} // Go back to the previous page
            className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
        >
            Go Back
        </button>
        <Link
            to="/"
            className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
        >
            Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;