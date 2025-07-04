// client/src/components/common/InstallPwaToast.js

import React from 'react';
import appIcon from '../../assets/app-icon.png';

// This component is now simpler. It just needs to know what to do when
// the "Install" or "Dismiss" buttons are clicked.
// We rename the onDismiss prop to onInstall to be more descriptive.
const InstallPwaToast = ({ onInstall, onDismiss }) => {
  // The handleInstallClick function is now just a simple call to the onInstall prop.
  // All the complex logic (like calling .prompt()) will live in App.js.
  const handleInstallClick = () => {
    onInstall();
  };

  const handleDismissClick = () => {
    onDismiss();
  };

  return (
    // Main container: fixed at the bottom, full width on mobile, centered and max-width on desktop
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pwa-toast-slide-up">
      <div className="w-full max-w-lg mx-4 mb-4 bg-white rounded-lg shadow-2xl p-4 flex items-center justify-between space-x-4">
        
        {/* Left Side: Icon and Text */}
        <div className="flex items-center space-x-3">
          <img 
            src={appIcon}
            alt="App Icon" 
            className="w-12 h-12 flex-shrink-0" 
          />
          <div>
            <strong className="font-semibold text-gray-900 block">Install the Footballkhelo.in App</strong>
            <p className="text-sm text-gray-600">Get the full experience on your device.</p>
          </div>
        </div>

        {/* Right Side: Buttons */}
        <div className="flex flex-shrink-0 space-x-2">
          {/* Since you commented this out, I'll keep it that way. If you want it back, just uncomment it. */}
          {/* <button
            onClick={handleDismissClick}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Later
          </button> */}
          <button
            // The onClick now calls our simplified handler.
            onClick={handleInstallClick}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPwaToast;