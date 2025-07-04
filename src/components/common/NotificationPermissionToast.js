// client/src/components/common/NotificationPermissionModal.js

import React from 'react';
import { FiBell } from 'react-icons/fi';

const NotificationPermissionToast = ({ onAllow }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        <FiBell className="mx-auto h-16 w-16 text-sky-500 mb-4" />
        
        <h2 className="text-2xl font-bold text-gray-900">Enable Notifications to Continue</h2>
        
        <p className="text-gray-600 mt-2">
          This app requires notification permissions to provide you with essential updates. Please allow notifications to proceed.
        </p>

        <div className="mt-8">
          <button
            onClick={onAllow}
            className="w-full px-6 py-3 text-lg font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionToast;