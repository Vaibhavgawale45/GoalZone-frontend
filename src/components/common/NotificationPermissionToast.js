// client/src/components/common/NotificationPermissionModal.js

import React from 'react';
import { FiBell } from 'react-icons/fi';

// This component only needs one prop: the function to call when the user clicks "Enable".
const NotificationPermissionModal = ({ onAllow }) => {
  return (
    // Full-screen overlay with a semi-transparent background
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      {/* Modal content box */}
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        
        <FiBell className="mx-auto h-16 w-16 text-sky-500 mb-4" />

        <h2 className="text-2xl font-bold text-gray-900">One Last Step</h2>
        
        <p className="text-gray-600 mt-2">
          To ensure you receive important updates and stay connected, please enable notifications.
        </p>

        <div className="mt-8">
          <button
            onClick={onAllow}
            className="w-full px-6 py-3 text-lg font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Enable Notifications
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          You can manage this in your browser settings later.
        </p>

      </div>
    </div>
  );
};

export default NotificationPermissionModal;